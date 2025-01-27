import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IpcService } from './ipc.service';


export enum ConnectionStatus {
  disconnected,
  connecting,
  connected,
  disconnecting
}


@Injectable({
  providedIn: 'root'
})
export class DataProviderBoschService {

  connectionStatus = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.disconnected);
  connectionError = new BehaviorSubject<boolean>(false);
  incomingDataRaw = new BehaviorSubject<string>('');
  debugTransmit = new BehaviorSubject<string>('');
  cissPortsList = new BehaviorSubject<number[]>([]);

  constructor(private ipc: IpcService) {
    this.ipc.on("driver-BoschCISS-errorDisconnect-signal", (event: Electron.IpcMessageEvent, args: any) => {
      this.connectionStatus.next(ConnectionStatus.disconnected);
      this.connectionError.next(true);
    })
    this.ipc.on("driver-BoschCISS-debugResponse-signal", (event: Electron.IpcMessageEvent, args: any) => {
      this.incomingDataRaw.next(args.rawData);
    })
    this.ipc.on("driver-BoschCISS-debugTransmit-signal", (event: Electron.IpcMessageEvent, args: any) => {
      this.debugTransmit.next(args.transmittedMessage);
    })
  }

  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus.getValue();
  }

  setConnectionStatus(newConnectionStatus: ConnectionStatus) {
    this.connectionStatus.next(newConnectionStatus);
  }

  updateCissPortsList() {
    this.ipc.once("driver-BoschCISS-getCISSports-response", (event: Electron.IpcMessageEvent, args: any) => {
      this.cissPortsList.next(args.cissPorts);
    })
    this.ipc.send("driver-BoschCISS-getCISSports-request", {});
  }

  connect(port: number):Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.connectionError.next(false);
      this.connectionStatus.next(ConnectionStatus.connecting);
      this.ipc.once("driver-BoschCISS-connect-response", (event: Electron.IpcMessageEvent, args: any) => {
        if (!args.error) {
          this.connectionStatus.next(ConnectionStatus.connected);
          this.connectionError.next(false);
          resolve();
        } else {
          this.connectionStatus.next(ConnectionStatus.disconnected);
          this.connectionError.next(true);
          reject();
        }
      })
      this.ipc.send("driver-BoschCISS-connect-request", { port: port, debug: true });
    })


  }

  disconnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.connectionError.next(false);
      this.connectionStatus.next(ConnectionStatus.disconnecting);
      this.ipc.once("driver-BoschCISS-disconnect-response", (event: Electron.IpcMessageEvent, args: any) => {
        this.connectionStatus.next(ConnectionStatus.disconnected);
        if (!args.error) {
          this.connectionError.next(false);
          resolve();
        } else {
          this.connectionError.next(true);
          reject();
        }
      })
      this.ipc.send("driver-BoschCISS-disconnect-request", {});
    });

  }

  debugSendCommand(msg: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.ipc.once("driver-BoschCISS-debugSendCommand-response", (event: Electron.IpcMessageEvent, args: any) => {
        if (!args.error) {
          resolve();
        } else {
          reject();
        }
      })
      this.ipc.send("driver-BoschCISS-debugSendCommand-request", {msg: msg});
    })
  }


  testWriteSomeDataToFileMethod() {
    this.ipc.send("driver-BoschCISS-testWriteSomeDataToFileMethod-request", {});
  }


}
