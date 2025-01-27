import { app, BrowserWindow } from 'electron';
import ElectronApp from './electron-app.js';
import { BoschCISSDriver } from './drivers/bosch-ciss/driver.js';

ElectronApp.main(app, BrowserWindow);

let sensor = new BoschCISSDriver();
