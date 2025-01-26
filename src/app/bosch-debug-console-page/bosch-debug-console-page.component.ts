import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { ConnectionStatus, DataProviderBoschService } from '../data-provider-bosch.service';
import { IpcService } from '../ipc.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bosch-debug-console-page',
  imports: [FormsModule],
  templateUrl: './bosch-debug-console-page.component.html',
  styleUrl: './bosch-debug-console-page.component.css'
})
export class BoschDebugConsolePageComponent implements OnInit, OnDestroy {

  readonly ConnectionStatus = ConnectionStatus;

  COMPort: number = 0;
  logBuffer: string = '';
  logBufferArr: string [] = [];
  logAreaRows: number = 10;
  command: string = '';
  connectionStatus: ConnectionStatus = ConnectionStatus.disconnected;
  connectionError: boolean = false;
  subscriptions: Subscription[] = [];

  constructor(private dataProviderBocsh: DataProviderBoschService, private ipc: IpcService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.subscriptions.push(this.dataProviderBocsh.connectionStatus.subscribe((value) => {
      this.connectionStatus = value;
      this.cdr.detectChanges();

    }));
    this.subscriptions.push(this.dataProviderBocsh.connectionError.subscribe((value) => {
      this.connectionError = value;
      this.cdr.detectChanges();
    }));
    this.subscriptions.push(this.dataProviderBocsh.cissPortsList.subscribe((portsList: number[]) => {
      if (portsList.length) {
        this.setCOMPort(portsList.at(-1)!);
      }
      this.cdr.detectChanges();
    }));
    this.subscriptions.push(this.dataProviderBocsh.incomingDataRaw.subscribe((rawData: string) => {
      if(rawData) {
        this.logLine('<---- ' + rawData);
        this.cdr.detectChanges();
      }

    }))
    this.subscriptions.push(this.dataProviderBocsh.debugTransmit.subscribe((transmittedMessage: string) => {
      if(transmittedMessage) {
        this.logLine ('----> ' + transmittedMessage);
        this.cdr.detectChanges();
      }

    }))
    this.dataProviderBocsh.updateCissPortsList();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  setCOMPort(port: number) {
    this.COMPort = port;
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

  logLine(line: string) {
    this.logBufferArr.push(line);
    while(this.logBufferArr.length > this.logAreaRows) {
      this.logBufferArr.shift();
    }
    this.logBuffer = '';
    this.logBufferArr.forEach((element,index,arr) => {
      this.logBuffer += element;
      if(arr.length - 1 != index) {
        this.logBuffer += '\n';
      }
    });
  }


  onClickConnectBtn() {
    this.dataProviderBocsh.connect(this.COMPort).then(() => {
      this.logLine('--------- CONNECTED ---------');
    }, () => {
      this.logLine('----- CONNECTION FAILED -----');
    })
  }

  onClickDisconnectBtn() {
    this.dataProviderBocsh.disconnect().then(() => {
      this.logLine('------- DISCONNECTED --------');
    });
  }

  onClickSendBtn() {
    if (this.command) {
      this.dataProviderBocsh.debugSendCommand(this.command).then(() => {
        this.command = '';
      }, () => {
        this.logLine('ERROR while sending');
      });
    }
  }


}
