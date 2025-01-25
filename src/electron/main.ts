import { app, BrowserWindow } from 'electron';
import * as url from 'url';
import * as path from 'path';
export default class Main {
  static mainWindow: Electron.BrowserWindow;
  static application: Electron.App;
  static BrowserWindow: any;
  private static onWindowAllClosed() {
    if (process.platform !== 'darwin') {
      Main.application.quit();
    }
  }

  private static onClose() {
    // Dereference the window object.
    //Main.mainWindow = null;
  }

  private static onReady() {
    Main.mainWindow = new Main.BrowserWindow({
      width: 1280,
      height: 720,
      show: false,
      webPreferences: {
        nodeIntegration: true
      }
    });
    Main.mainWindow.setMenu(null);
    Main.mainWindow
      .loadURL(url.format({
        pathname: path.join(app.getAppPath(), `/dist/data-capturing-utility/browser/index.html`),
        protocol: "file:",
        slashes: true
      }));
    Main.mainWindow.on('closed', Main.onClose);
    Main.mainWindow.once('ready-to-show', () => {
      Main.mainWindow.show()
    })
  }

  static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
    // we pass the Electron.App object and the
    // Electron.BrowserWindow into this function
    // so this class has no dependencies. This
    // makes the code easier to write tests for
    Main.BrowserWindow = browserWindow;
    Main.application = app;
    Main.application.on('window-all-closed', Main.onWindowAllClosed);
    Main.application.on('ready', Main.onReady);

  }
}
