import { Component } from '@angular/core';
import { DataProviderBoschService } from '../data-provider-bosch.service';

@Component({
  selector: 'app-start-page',
  imports: [],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.css'
})
export class StartPageComponent {

  constructor(private dataProviderBocsh: DataProviderBoschService) {}

  onClickBtn() {
    this.dataProviderBocsh.testWriteSomeDataToFileMethod();
  }
}
