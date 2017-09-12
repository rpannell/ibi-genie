const electron = require('electron')
const {ipcMain} = require('electron');
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const url = require('url')
const tfs = require('./assets/tfs-unlock');
const menu = electron.Menu;
const fs = require('fs');
var mainWindow = null
const {autoUpdater} = require("electron-updater");

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

function initialize() {
    var shouldQuit = makeSingleInstance();
    if (shouldQuit) return app.quit();
    //setup the menus
    require(path.join(__dirname, 'mainprocess/application-menu.js'));
    require(path.join(__dirname, 'mainprocess/application-webapi.js'));
    require(path.join(__dirname, 'mainprocess/application-ipc.js'));
    function createWindow() {
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
    }

    app.on('ready', createWindow);
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
    console.log("Browse To: " + arg);
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname.replace("mainprocess", ""), arg),
        protocol: 'file:',
        slashes: true
    }));
});
autoUpdater.on('update-available', (info) => {
  var updateText = 'Update available, the application will restart shortly';
  log.info(updateText);
  win.webContents.send('message', updateText);
})
autoUpdater.on('update-downloaded', (info) => {
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  setTimeout(function() {
    autoUpdater.quitAndInstall();  
  }, 5000)
})

initialize();