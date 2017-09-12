const electron = require('electron')
const {ipcMain} = require('electron');
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const url = require('url')
const tfs = require('./assets/tfs-unlock');
const menu = electron.Menu;
const fs = require('fs');
let mainWindow = null;
const {autoUpdater} = require("electron-updater");
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

function initialize() {
    var shouldQuit = makeSingleInstance();
    if (shouldQuit) return app.quit();
    //setup the menus
    require(path.join(__dirname, 'mainprocess/application-menu.js'));
    require(path.join(__dirname, 'mainprocess/application-webapi.js'));
    require(path.join(__dirname, 'mainprocess/application-ipc.js'));

    app.on('ready', function(){
		var windowOptions = {
            width: 1200,
            minWidth: 600,
            height: 840,
            title: app.getName()
        }
        windowOptions.icon = path.join(__dirname, '/images/favicon.ico')

        mainWindow = new BrowserWindow(windowOptions)
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        }))
        mainWindow.on('closed', function () {
            mainWindow = null
        })
		//console.log("send");
		//mainWindow.webContents.on('did-finish-load', () => {
		//	mainWindow.webContents.send('message', 'whoooooooh!')
		//})
		autoUpdater.checkForUpdates();
	});
    app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit()
        }
    });

    app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) {
            createWindow()
        }
    });
}

function makeSingleInstance() {
    if (process.mas) return false
    return app.makeSingleInstance(function () {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })
}

ipcMain.on('browse-to', (event, arg) => {
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname.replace("mainprocess", ""), arg),
        protocol: 'file:',
        slashes: true
    }));
});

autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...');
})

autoUpdater.on('update-available', (info) => {
  var updateText = 'Update available, the application will restart shortly';
  log.info(updateText);
  mainWindow.webContents.send('message', updateText);
})
autoUpdater.on('update-downloaded', (info) => {
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  setTimeout(function() {
    autoUpdater.quitAndInstall();  
  }, 5000)
})
autoUpdater.on('error', (err) => {
  var updateText = 'Error in auto-updater.';
  log.info(updateText);
  mainWindow.webContents.send('message', updateText);
})
initialize();