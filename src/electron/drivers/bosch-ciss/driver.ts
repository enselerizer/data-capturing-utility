import { ipcMain, IpcMainEvent, IpcMessageEvent } from 'electron';

import { BoschCiss } from './bosch-ciss.js'
import ElectronApp from '../../electron-app.js';
import { hexAToString, stringToHexA } from './utils/hexUtils.js';
import { toPayload } from './utils/crc.js';
import { Sample, Samples } from './types.js';
import { Subscription } from 'rxjs';
import { stringify } from 'csv-stringify';
import * as fs from 'fs';

export class BoschCISSDriver {

  boschCiss: BoschCiss | undefined;
  fastModeSubscrition: Subscription | undefined;

  constructor() {
    this.init();
  }


  init() {
    ipcMain.on("driver-BoschCISS-connect-request", (event: IpcMainEvent, args: any) => {
      this.boschCiss = new BoschCiss('COM' + args.port, args.debug, (error: boolean) => {
        if (error) {
          event.sender.send("driver-BoschCISS-connect-response", { error: true });
        } else {
          event.sender.send("driver-BoschCISS-connect-response", { error: false });
        }
      });
      this.boschCiss.errorEvent.subscribe(() => {
        ElectronApp.mainWindow.webContents.send("driver-BoschCISS-errorDisconnect-signal", {});
      })
      this.boschCiss.incomingDataRaw.subscribe((rawData) => {
        ElectronApp.mainWindow.webContents.send("driver-BoschCISS-debugResponse-signal", { rawData: rawData });
      })
    });

    ipcMain.on("driver-BoschCISS-disconnect-request", (event: IpcMainEvent, args: any) => {
      if (this.boschCiss) {
        ElectronApp.mainWindow.webContents.send("driver-BoschCISS-debugTransmit-signal",
          {
            transmittedMessage: hexAToString([0xFE, 0x02, 0x80, 0x00, 0x82])
          });
        this.boschCiss.stopFastMode().then(() => {
          event.sender.send("driver-BoschCISS-disconnect-response", { error: false });
        })
      }
    });

    ipcMain.on("driver-BoschCISS-getCISSports-request", (event: IpcMainEvent, args: any) => {
      BoschCiss.getCISSPortList().then((cissPorts: number[]) => {
        event.sender.send("driver-BoschCISS-getCISSports-response", { cissPorts: cissPorts });
      })

    });

    ipcMain.on("driver-BoschCISS-debugSendCommand-request", (event: IpcMainEvent, args: any) => {
      if (this.boschCiss) {
        this.boschCiss.sendMessageStr(args.msg.replace(/\s+/g, '')).then(() => {

          ElectronApp.mainWindow.webContents.send("driver-BoschCISS-debugTransmit-signal",
            {
              transmittedMessage: hexAToString(toPayload(stringToHexA(args.msg.replace(/\s+/g, ''))))
            });

          event.sender.send("driver-BoschCISS-debugSendCommand-response", { error: false });
        }, () => {
          event.sender.send("driver-BoschCISS-debugSendCommand-response", { error: true });
        })
      }
    });

    ipcMain.on("driver-BoschCISS-testWriteSomeDataToFileMethod-request", (event: IpcMainEvent, args: any) => {
      this.writeSomeDataToFile();
    });

    ipcMain.on("driver-BoschCISS-captureDataSeconds-request", (event: IpcMainEvent, args: any) => {
      this.captureDataSeconds(args.fileName, args.seconds, args.trueTime); 
    });
  }


  writeSomeDataToFile() {
    let packetsLimit: number = 10;
    let packets: number = 0;

    const writeableStream = fs.createWriteStream("hello.csv");

    const columns = [
      "timestamp",
      "x",
      "y",
      "z"
    ];

    const stringifier = stringify({ header: true, columns: columns });
    stringifier.pipe(writeableStream);

    if (this.boschCiss) {
      this.fastModeSubscrition = this.boschCiss.incomingData.subscribe((value: Samples) => {
        value.forEach((element: Sample) => {
          stringifier.write([
            element.timestamp.toString(),
            element.data.x.toString(),
            element.data.y.toString(),
            element.data.z.toString()
          ])
        });
        if(packets >= packetsLimit) {
          this.boschCiss?.stopFastMode().then(()=>{
            this.fastModeSubscrition?.unsubscribe();
            writeableStream.close();
          })
        }
        packets++;
      })
      this.boschCiss.startFastMode();
    }

  }

  captureDataSeconds(fileName: string, seconds: number, trueTime = false) {
    
    let packetsLimit: number = 125 * seconds;
    let packets: number = 0;
    fs.mkdirSync("./recordings/"+fileName+"_01-01-2025_00.00.00");
    const writeableStream = fs.createWriteStream("./recordings/"+fileName+"_01-01-2025_00.00.00/sensor0.csv",{flags: 'w'});

    const columns = [
      "timestamp",
      "x",
      "y",
      "z"
    ];

    const stringifier = stringify({ header: true, columns: columns });
    stringifier.pipe(writeableStream);

    if (this.boschCiss) {
      this.fastModeSubscrition = this.boschCiss.incomingData.subscribe((value: Samples) => {
        value.forEach((element: Sample) => {
          stringifier.write([
            element.timestamp.toString(),
            element.data.x.toString(),
            element.data.y.toString(),
            element.data.z.toString()
          ])
        });
        if(packets >= packetsLimit) {
          this.boschCiss?.stopFastMode().then(()=>{
            this.fastModeSubscrition?.unsubscribe();
            writeableStream.close();
          })
        }
        packets++;
      })
      this.boschCiss.startFastMode(trueTime);
    }
  }


}
