import { ipcMain, IpcMainEvent, IpcMessageEvent } from 'electron';

import { BoschCiss } from './bosch-ciss.js'
import ElectronApp from '../../electron-app.js';
import { hexAToString, stringToHexA } from './utils/hexUtils.js';
import { toPayload } from './utils/crc.js';

export class BoschCISSDriver {

  boschCiss: BoschCiss | undefined;

  constructor(port: number | 0) {
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




  }
}
