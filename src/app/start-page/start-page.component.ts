import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ConnectionStatus, DataProviderBoschService } from '../data-provider-bosch.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-start-page',
  imports: [FormsModule],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.css'
})
export class StartPageComponent implements OnInit, OnDestroy {

  readonly ConnectionStatus = ConnectionStatus;

  subscriptions: Subscription[] = [];
  COMPortList: number[] = [];
  COMPort: number = 0;
  connectionStatus: ConnectionStatus = ConnectionStatus.disconnected;
  nameInput: string = '';
  secondsInput: number = 1;
  trueTimeMode: boolean = false;
  recordingInProcess: boolean = false;

  constructor(private dataProviderBosch: DataProviderBoschService, private cdr: ChangeDetectorRef) {}


  ngOnInit() {
    this.subscriptions.push(this.dataProviderBosch.connectionStatus.subscribe((value) => {
      this.connectionStatus = value;
      this.cdr.detectChanges();
    }));
    this.subscriptions.push(this.dataProviderBosch.cissPortsList.subscribe((portsList: number[]) => {
      this.COMPortList = portsList;
      if (portsList.length) {
        this.COMPort = portsList.at(-1)!;
      } else {
        this.COMPort = 0;
      }
      this.cdr.detectChanges();
    }));
    this.dataProviderBosch.updateCissPortsList();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  onClickCaptureBtn() {
    this.recordingInProcess = true;
    this.dataProviderBosch.connect(this.COMPort).then(() => {
      this.dataProviderBosch.captureDataSeconds(this.nameInput ? this.nameInput : 'noname', this.secondsInput, this.trueTimeMode).then(() => {
        this.recordingInProcess = false;
        this.dataProviderBosch.updateCissPortsList();
      });
    }, () => {
      
    })
  }

  onClickUpdateBtn() {
    this.dataProviderBosch.updateCissPortsList();
  }
}
