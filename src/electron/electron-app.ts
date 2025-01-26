import { app, BrowserWindow } from 'electron';
import * as url from 'url';
import * as path from 'path';
export default class ElectronApp {
  static mainWindow: Electron.BrowserWindow;
  static application: Electron.App;
  static BrowserWindow: any;
  private static onWindowAllClosed() {
    if (process.platform !== 'darwin') {
      ElectronApp.application.quit();
    }
  }

  private static onClose() {
    // Dereference the window object.
    //Main.mainWindow = null;
  }

  private static onReady() {
    ElectronApp.mainWindow = new ElectronApp.BrowserWindow({
      width: 1280,
      height: 720,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    //ElectronApp.mainWindow.setMenu(null);
    ElectronApp.mainWindow
      .loadURL(url.format({
        pathname: path.join(app.getAppPath(), `/dist/data-capturing-utility/browser/index.html`),
        protocol: "file:",
        slashes: true
      }));
    ElectronApp.mainWindow.on('closed', ElectronApp.onClose);
    ElectronApp.mainWindow.once('ready-to-show', () => {
      ElectronApp.mainWindow.show()
    })
  }

  static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
    // we pass the Electron.App object and the
    // Electron.BrowserWindow into this function
    // so this class has no dependencies. This
    // makes the code easier to write tests for
    ElectronApp.BrowserWindow = browserWindow;
    ElectronApp.application = app;
    ElectronApp.application.on('window-all-closed', ElectronApp.onWindowAllClosed);
    ElectronApp.application.on('ready', ElectronApp.onReady);

  }
}
