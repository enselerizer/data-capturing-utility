import { Subject } from 'rxjs';
import { SerialPort } from 'serialport';
import { calcCrcBuffer, toPayload } from './utils/crc.js';
import { bufferToHexA, hexAToString, stringToHexA, toSigned16Bit } from './utils/hexUtils.js';
import { PortInfo, Samples } from './types.js';

export class BoschCiss {
  public incomingData: Subject<Samples> = new Subject<Samples>();
  public incomingDataRaw: Subject<string> = new Subject<string>();
  public errorEvent: Subject<void> = new Subject<void>();

  private port: SerialPort;
  private enableDebug: boolean;
  private recordingBeginTimestamp: bigint = 0n;
  private arriveTimestamp: bigint = 0n;
  private trueTimeMode = false;
  private firstDataFragmentArrivedFlag = false;

  public static getCISSPortList(): Promise<number[]> {
    return new Promise<number[]>((resolve) => {
      SerialPort.list().then((ports:PortInfo[])=>{
        let cissPorts: number[] = [];
        ports.forEach(port => {
          if(port.vendorId === "108C" && port.productId === "01A2") {
            cissPorts.push(Number([...port.path.matchAll(/^COM([0-9]+)$/g)][0][1]))
          }
        });
        resolve(cissPorts);
      })

    })



  }

  constructor(deviceName: string, enableDebug: boolean = false, callback: Function) {
    this.enableDebug = enableDebug;
    if (this.enableDebug) console.log('[driver] [Bosch CISS] Initializing COM port...');
    this.port = new SerialPort({
      path: deviceName,
      baudRate: 115200
    }, (error) => {
      if (error) {
        if (this.enableDebug) console.log('[driver] [Bosch CISS] Error on initialize COM port: ' + error + deviceName);
        callback(true);
      } else {
        if (this.enableDebug) console.log('[driver] [Bosch CISS] COM port successfully opened - ' + deviceName);
        callback(false);
      }
    });
    this.handleDataEvents();
  }

  startFastMode(trueTimeMode = false) {
    this.write(toPayload([0xFE, 0x06, 0x80, 0x02, 0xF4, 0x01, 0x00, 0x00]), 0);

    this.recordingBeginTimestamp = process.hrtime.bigint();
    this.trueTimeMode = trueTimeMode;

  }

  async stopFastMode() {
    await this.write(toPayload([0xFE, 0x02, 0x80, 0x00, 0x82]),50);
    return new Promise<void>((resolve) => {
      if (this.port.isOpen) {
        this.port.close(() => {
          if (this.enableDebug) console.log('[driver] [Bosch CISS] COM port successfully closed');
          resolve();
        });
      } else {
        if (this.enableDebug) console.log('[driver] [Bosch CISS] COM port successfully closed');
        resolve();
      }
    });

  }

  sendMessage(msg: number[]): Promise<void> {
    return this.write(toPayload(msg));
  }
  sendMessageStr(msg: string): Promise<void> {
    return this.write(toPayload(stringToHexA(msg)),0)
  }

  private async write(data: number[], wait: number = 500): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.port.write(data, (error) => {
        if (this.enableDebug) console.log('[driver] [Bosch CISS] Write: ' + hexAToString(data));
        if (error) {
          if (this.enableDebug) console.log('[driver] [Bosch CISS] Error on write: ', error.message);
          reject();
        }
        setTimeout(() => resolve(), wait);
      });
    });
  }

  private handleDataEvents(): void {
    this.port.on('data', (data: Buffer) => {
      this.incomingDataRaw.next(hexAToString(bufferToHexA(data)));


      if(!this.trueTimeMode && this.firstDataFragmentArrivedFlag) { 
        this.arriveTimestamp += 8000000n;
      } else {
        this.arriveTimestamp = process.hrtime.bigint() - this.recordingBeginTimestamp;
      }

      this.firstDataFragmentArrivedFlag = true;

      if (data && !this.isFastModeACK(data)) {
        let result = this.processDataBuffer(
          data, this.arriveTimestamp
        )
        if (result[0]) {
          this.incomingData.next(result);
        }

      }
    });

    this.port.on("close", (err: any) => {
      if(err) {
        this.errorEvent.next();
      }
    })
  }

  private processDataBuffer(input: Buffer, measurmentTimestamp: bigint): Samples {

    let result: Samples = [];

    if (calcCrcBuffer(input.subarray(0, 114)) != input[114]) {
      if (this.enableDebug) console.log('[driver] [Bosch CISS] Error on responce parsing: CRC mismatch');
      return [];
    }

    let sample: Buffer;

    for (let sampleIndex = 0; sampleIndex < 16; sampleIndex++) {
      sample = input.subarray(3 + (7 * sampleIndex), 9 + (7 * sampleIndex));
      result.push({
        timestamp: measurmentTimestamp - (500000n * BigInt(15 - sampleIndex)),
        data: {
          x: toSigned16Bit(sample[1] << 8 | sample[0]),
          y: toSigned16Bit(sample[3] << 8 | sample[2]),
          z: toSigned16Bit(sample[5] << 8 | sample[4])
        }
      });
    }
    return result;
  }


  isFastModeACK(input: Buffer): boolean {
    if (input.length != 6) return false;
    if (input[0] != 0xFE) return false;
    if (input[1] != 0x03) return false;
    if (input[2] != 0x01) return false;
    if (input[3] != 0x80) return false;
    if (input[4] != 0x02) return false;
    if (input[5] != 0x80) return false;
    return true;
  }

}
