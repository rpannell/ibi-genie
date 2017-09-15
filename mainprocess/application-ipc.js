const {ipcMain} = require('electron');
var elecConfig = require("electron-config");
const fs = require('fs');
const path = require('path');
var config = new elecConfig();
var yeoman = require('yeoman-environment');
var yeomanEnv = yeoman.createEnv();
var glob = require('glob');

ipcMain.on('update-config', (event, arg) => {
    config.set("IBIPluginManagementOptions", arg);
    event.returnValue = 'saved';
});

ipcMain.on('run-templates', (event, arg) => {
	
	if(arg.StandardPlugin) {
		yeomanEnv.lookup(() => {
			yeomanEnv.run('ibi-appframework:StandardPlugin', { 'pluginName': 			arg.Name, 
															   'sourceLocation': 		arg.SourceLocation, 
															   'createMasterSolution': 	arg.CreateMaster,
															   'webServiceUrl': 		arg.WebServiceUrl,
															   'webServiceTestUrl': 	arg.webServiceTestUrl,
															   'webServiceProdUrl': 	arg.webServiceProdUrl,
															 }, err => { });
		});
	} else if(arg.CoreExternalPlugin){
		
	}
	
	if(arg.StandardService){
		yeomanEnv.lookup(() => {
			yeomanEnv.run('ibi-appframework:StandardService', { 'serviceName': 			arg.Name, 
																'sourceLocation': 		arg.SourceLocation, 
																'databaseName': 		arg.DatabaseName, 
																'databaseServer': 		arg.DatabaseServer,
																'databaseUser': 		arg.DatabaseUser,
																'databasePassword': 	arg.DatabasePassword,
																'databaseProdServer': 	arg.DatabaseProdServer,
																'databaseProdUser': 	arg.DatabaseProdUser,
																'databaseProdPassword': arg.DatabaseProdPassword
															  }, err => { });
		});
	} else if(arg.CoreService){
		
	}
	
	event.returnValue = 'saved';
});

ipcMain.on('run-scaffolding', (event, arg) => {
	yeomanEnv.lookup(() => {
		yeomanEnv.run('ibi-appframework:EFWebApiService', { 'projectname': 	arg.ProjectName, 
															'location': 	arg.ServiceLocation, 
															'entityinfo': 	JSON.stringify(arg.Entities), 
															'force': 		true }, err => {
			console.log('done');
		});
		
		
	});
	
	if(arg.AddToPlugin != undefined && arg.AddToPlugin){
		yeomanEnv.lookup(() => {
			yeomanEnv.run('ibi-appframework:EFPlugin', { 'projectname': arg.ProjectName, 
														 'location': 	arg.PluginLocation, 
														 'entityinfo': 	JSON.stringify(arg.Entities), 
														 'force': 		true }, err => {
				console.log('done');
			});	
		});
	}
	
	event.returnValue = 'saved';
});

ipcMain.on('get-config', (event, arg) => {
    var currentConfig = config.get("IBIPluginManagementOptions");
    if (currentConfig == null || currentConfig == undefined) {
        currentConfig = {
            DatabaseName: "jaxdwdv01",
			DatabaseUser: "Dwsvc",
            DatabasePassword: "Pass@word1",
            SourceControlLocation: "",
            CurrentPlugin: "",
            CurrentService: "",
			CurrentPluginSourceLocation: "",
			CurrentServiceSourceLocation: ""
        };
    }

    event.returnValue = currentConfig;
});

ipcMain.on('get-plugin-folder-names', (event, arg) => {
    var currentConfig = config.get("IBIPluginManagementOptions");
    if (currentConfig == null || currentConfig == undefined || currentConfig.SourceControlLocation == "") {
        event.returnValue = [];
    } else {
        var pluginPath = path.join(currentConfig.SourceControlLocation, "Plugins");
        var directories = fs.readdirSync(pluginPath).filter(file => fs.statSync(path.join(pluginPath, file)).isDirectory());
        event.returnValue = directories;
    }
});

ipcMain.on('get-service-folder-names', (event, arg) => {
    var currentConfig = config.get("IBIPluginManagementOptions");
    if (currentConfig == null || currentConfig == undefined || currentConfig.SourceControlLocation == "") {
        event.returnValue = [];
    } else {
        var pluginPath = path.join(currentConfig.SourceControlLocation, "Services");
        var directories = fs.readdirSync(pluginPath).filter(file => fs.statSync(path.join(pluginPath, file)).isDirectory());
        event.returnValue = directories;
    }
});

ipcMain.on('get-project-files', (event, arg) => {
	var rootPath = path.join(arg.SourceLocation, arg.IsPlugin ? "Plugins" : "Services", arg.Name);
	var files = glob.sync(path.join(rootPath, "**\\*.csproj"));
	for(var i = 0; i < files.length; i++){
		files[i] = files[i].replace(new RegExp("/", 'g'), "\\")
		files[i] = files[i].replace(rootPath, "");
	}
	event.returnValue = files;
});

ipcMain.on('get-folder-from-file', (event, arg) => {
	var file = path.join(arg.SourceLocation, arg.IsPlugin ? "Plugins" : "Services", arg.Name, arg.File);
	event.returnValue = path.dirname(file);
});