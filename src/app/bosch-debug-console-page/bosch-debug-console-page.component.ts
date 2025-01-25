import { Component, OnInit } from '@angular/core';
import { ConnectionStatus, DataProviderBoschService } from '../data-provider-bosch.service';

@Component({
  selector: 'app-bosch-debug-console-page',
  imports: [],
  templateUrl: './bosch-debug-console-page.component.html',
  styleUrl: './bosch-debug-console-page.component.css'
})
export class BoschDebugConsolePageComponent implements OnInit{

  readonly ConnectionStatus = ConnectionStatus;

  COMPort: number = 0;
  logBuffer: string = '';
  command: string = '';
  connectionStatus: ConnectionStatus = ConnectionStatus.disconnected;
  connectionError: boolean = false;

  constructor(private dataProviderBocsh: DataProviderBoschService) {}

  ngOnInit() {
    this.dataProviderBocsh.connectionStatus.subscribe((value) => {
      this.connectionStatus = value;
    });
    this.dataProviderBocsh.connectionError.subscribe((value) => {
      this.connectionError = value;
    });
  }

  setCOMPort(eventData: any) {
    this.COMPort = Number(eventData.target.value) || 0;
  }
  getCOMPort() {
    return this.COMPort;
  }

  setLogBuffer(text: string) {
    this.logBuffer = text;
  }
  getLogBuffer() {
    return this.logBuffer;
  }

  setCommand(command: string) {
    this.command = command;
  }
  getCommand() {
    return this.command;
  }


  onClickConnectBtn() {
    this.dataProviderBocsh.connect();
  }

  onClickDisconnectBtn() {
    this.dataProviderBocsh.setConnectionStatus(ConnectionStatus.disconnected);
  }

  onClickSendBtn() {
    alert('SendMock');
  }


}
