import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


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

  constructor() { }

  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus.getValue();
  }

  setConnectionStatus(newConnectionStatus: ConnectionStatus) {
    this.connectionStatus.next(newConnectionStatus);
  }

  connect() {
    this.connectionError.next(false);
    this.connectionStatus.next(ConnectionStatus.connecting);
    setTimeout(() => {
      this.connectionStatus.next(ConnectionStatus.disconnected);
      this.connectionError.next(true);
    }, 500);
  }


}
