const {ipcMain} = require('electron');
var elecConfig = require("electron-config");
const fs = require('fs');
const path = require('path');
var config = require('../assets/config');
var yeoman = require('yeoman-environment');
var yeomanEnv = yeoman.createEnv();
var glob = require('glob');
const logger = require('winston');  

ipcMain.on('update-config', (event, arg) => {
    config.UpdateConfig(arg);
    event.returnValue = 'saved';
});

ipcMain.on('run-extended', (event, arg) => {
	try{
		yeomanEnv.lookup(() => {
			yeomanEnv.run('ibi-appframework:ExtendWebApiService', { 'entityname': 		arg.EntityName, 
																	'functionname': 	arg.FunctionName, 
																	'serviceLocation': 	arg.ServiceLocation,
																	'pluginLocation': 	arg.PluginLocation,
																	'functionInfo': 	arg.FunctionInfo,
																	'isList': 			arg.ReturnsList
																}, err => { 
																	console.log(err);
				event.sender.send('run-extended-reply', err);
			});
		});
	} catch (err){
		console.log(err);
	}
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
	} else if(arg.StandardApplication){
		yeomanEnv.lookup(() => {
			yeomanEnv.run('ibi-appframework:StandardApplication', { 'pluginName': 				arg.Name, 
																	'sourceLocation': 			arg.SourceLocation, 
																	'createMasterSolution': 	arg.CreateMaster,
																	'webServiceUrl': 			arg.WebServiceUrl,
																	'webServiceTestUrl': 		arg.webServiceTestUrl,
																	'webServiceProdUrl': 		arg.webServiceProdUrl,
															 }, err => { });
		});
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
	}
	
	event.returnValue = 'saved';
});

ipcMain.on('run-scaffolding', (event, arg) => {
	logger.info("--Scaffolding Arguments---", arg);
	yeomanEnv.lookup(() => {
		yeomanEnv.run('ibi-appframework:EFWebApiService', { 'projectname': 	arg.ProjectName, 
															'location': 	arg.ServiceLocation, 
															'entityinfo': 	JSON.stringify(arg.Entities), 
															'force': 		true }, err => {
			logger.info("Finished Scaffolding The Web Service");
		});
		
		
	});
	
	if(arg.AddToPlugin != undefined && arg.AddToPlugin){
		yeomanEnv.lookup(() => {
			yeomanEnv.run('ibi-appframework:EFPlugin', { 'projectname': arg.PluginName != "" ? arg.PluginName : arg.ApplicationName, 
														 'location': 	arg.PluginLocation != "" ? arg.PluginLocation : arg.ApplicationLocation, 
														 'isplugin': arg.PluginLocation != "" ? true : false, 
														 'entityinfo': 	JSON.stringify(arg.Entities), 
														 'force': 		true }, err => {
				logger.info("Finished Scaffolding The Plugin/Application");
			});	
		});
	}
	
	event.returnValue = 'saved';
});

ipcMain.on('get-config', (event, arg) => {
    var currentConfig = config.GetConfig();
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
    var currentConfig = config.GetConfig();
    if (currentConfig == null || currentConfig == undefined || currentConfig.SourceControlLocation == "") {
        event.returnValue = [];
    } else {
        var pluginPath = path.join(currentConfig.SourceControlLocation, "Plugins");
		if(fs.existsSync(pluginPath)){
			var directories = fs.readdirSync(pluginPath).filter(file => fs.statSync(path.join(pluginPath, file)).isDirectory());
			event.returnValue = directories;	
		} else {
			event.returnValue = [];
		}
    }
});

ipcMain.on('get-application-folder-names', (event, arg) => {
    var currentConfig = config.GetConfig();
    if (currentConfig == null || currentConfig == undefined || currentConfig.SourceControlLocation == "") {
        event.returnValue = [];
    } else {
        var pluginPath = path.join(currentConfig.SourceControlLocation, "Applications");
		if(fs.existsSync(pluginPath)){
			var directories = fs.readdirSync(pluginPath).filter(file => fs.statSync(path.join(pluginPath, file)).isDirectory());
			event.returnValue = directories;	
		} else {
			event.returnValue = [];
		}
    }
});

ipcMain.on('get-service-folder-names', (event, arg) => {
    var currentConfig = config.GetConfig();
    if (currentConfig == null || currentConfig == undefined || currentConfig.SourceControlLocation == "") {
        event.returnValue = [];
    } else {
        var pluginPath = path.join(currentConfig.SourceControlLocation, "Services");
        var directories = fs.readdirSync(pluginPath).filter(file => fs.statSync(path.join(pluginPath, file)).isDirectory());
        event.returnValue = directories;
    }
});

ipcMain.on('get-project-files', (event, arg) => {
	var rootPath = path.join(arg.SourceLocation, arg.IsPlugin != undefined && arg.IsPlugin 
														? "Plugins" 
														: arg.IsApplication != undefined && arg.IsApplication
															? "Applications"
															: "Services", arg.Name);
	var files = glob.sync(path.join(rootPath, "**\\*.csproj"));
	for(var i = 0; i < files.length; i++){
		files[i] = files[i].replace(new RegExp("/", 'g'), "\\")
		files[i] = files[i].replace(rootPath, "");
	}
	event.returnValue = files;
});

ipcMain.on('get-folder-from-file', (event, arg) => {
	var file = path.join(arg.SourceLocation, 
						 arg.IsPlugin 
							? "Plugins" 
							: arg.IsApplication
								? "Applications"
								: "Services", 
						 arg.Name, 
						 arg.File);
	event.returnValue = path.dirname(file);
});

ipcMain.on('get-entities-from-service', (event, arg) => {
	var file = path.join(arg.SourceLocation, "Entities","Base");
	var files = glob.sync(path.join(file, "*.cs"));
	for(var i = 0; i < files.length; i++){
		files[i] = files[i].replace(new RegExp("/", 'g'), "\\")
		files[i] = files[i].replace(file + "\\", "");
		files[i] = files[i].replace(".cs", "");
	}
	event.returnValue = files;
});