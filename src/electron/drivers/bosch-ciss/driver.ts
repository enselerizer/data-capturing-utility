import { timestamp } from 'rxjs';
import { BoschCiss } from './bosch-ciss.js'
import { Samples } from './types.js';

export class BoschCISSDriver {

  boschCiss: BoschCiss;
  cnt: number = 0;
  lastEnd: bigint = 0n;

  constructor(port: number | 0) {
    this.boschCiss = new BoschCiss('COM' + port.toString(), true);
    this.boschCiss.incomingData.subscribe((value: Samples) => {
        console.log('-----');
        value.forEach(sample => {
          console.log('[ ' + sample.timestamp.toString() + ' ] x: ' + sample.data.x + ' y: ' + sample.data.y + ' z: ' + sample.data.z);
        });

      if(this.cnt >= 30) {
        this.boschCiss.stopFastMode();
      }

      this.cnt++;
    })

    this.boschCiss.startFastMode();
  }
}
