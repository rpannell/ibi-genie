// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron');
const path = require('path');
const fs = require('fs');
const {autoUpdater} = require("electron-updater");
const winston = require('winston');  
//on the first run of the application the user data folder 
//hasn't been created by this point, so create the userData
//folder before creating the log folder
if (!fs.existsSync(app.getPath("userData"))) {
  fs.mkdirSync(app.getPath("userData"));
}

var logFolder = path.join(app.getPath("userData"), "logs");
var logFile = 'app.log';
winston.configure({
	transports: [
	  new (winston.transports.File)({ filename: path.join(logFolder, logFile) })
	]
});


function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1400,
    minWidth: 600,
    height: 968,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  
  require(path.join(__dirname, 'mainprocess/application-menu.js'));
  require(path.join(__dirname, 'mainprocess/application-ipc.js'));
  require(path.join(__dirname, 'mainprocess/application-webapi.js'));
  

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

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
