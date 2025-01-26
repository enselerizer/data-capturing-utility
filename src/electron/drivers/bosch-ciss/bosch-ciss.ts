import { Subject } from 'rxjs';
import { SerialPort } from 'serialport';
import { calcCrcBuffer, toPayload } from './utils/crc.js';
import { hexAToString, stringToHexA, toSigned16Bit } from './utils/hexUtils.js';
import { Samples } from './types.js';

export class BoschCiss {
  public incomingData: Subject<Samples> = new Subject<Samples>();
  public incomingDataRaw: Subject<string> = new Subject<string>();

  private port: SerialPort;
  private enableDebug: boolean;
  private recordingBeginTimestamp: bigint = 0n;

  constructor(deviceName: string, enableDebug: boolean = false) {
    this.enableDebug = enableDebug;
    if (this.enableDebug) console.log('[driver] [Bosch CISS] Initializing COM port');
    this.port = new SerialPort({
      path: deviceName,
      baudRate: 115200
    }, (error) => {
      if (error) {
        if (this.enableDebug) console.log('[driver] [Bosch CISS] Error on initialize COM port: ' + error);
      }
    });
    this.handleDataEvents();
  }

  startFastMode() {
    this.write(toPayload([0xFE, 0x06, 0x80, 0x02, 0xF4, 0x01, 0x00, 0x00]));
    this.recordingBeginTimestamp = process.hrtime.bigint();
  }

  async stopFastMode() {
    await this.write(toPayload([0xFE, 0x02, 0x80, 0x00, 0x82]));
    if (this.port.isOpen) this.port.close();
    this.recordingBeginTimestamp = process.hrtime.bigint();
  }

  sendMessage(msg: number[]): void {
    this.write(toPayload(msg));
  }
  sendMessageStr(msg: string): void {
    this.write(toPayload(stringToHexA(msg)));
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
      this.incomingDataRaw.next(data.toString());
      let arriveTimestamp: bigint = process.hrtime.bigint();
      if (data && !this.isFastModeACK(data)) {
        let result = this.processDataBuffer(
          data, arriveTimestamp - this.recordingBeginTimestamp
        )
        if (result[0]) {
          this.incomingData.next(result);
        } else console.log('mem');

      }
    });
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
