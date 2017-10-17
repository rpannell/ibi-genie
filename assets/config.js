var elecConfig = require("electron-config");
var configInfo = new elecConfig();
const systemConstants = require('./const');
var updateFunction = function(config){
	if(config != undefined && config != null){
		configInfo.set(systemConstants.CONFIGKEY, config);
	}
}
var getFunction = function(){
	var currentConfig = configInfo.get(systemConstants.CONFIGKEY);
	if (currentConfig == null || currentConfig == undefined) {
        currentConfig = {
            DatabaseName: systemConstants.DEFAULTDEVSERVER,
			DatabaseUser: systemConstants.DEFAULTDEVUSER,
            DatabasePassword: systemConstants.DEFAULTDEVPASSWORD,
            SourceControlLocation: "",
            CurrentPlugin: "",
			CurrentApplication: "",
            CurrentService: "",
			CurrentPluginSourceLocation: "",
			CurrentServiceSourceLocation: "",
			CurrentApplicationSourceLocation: ""
        };
    }
	return currentConfig;
}

exports.GetDatabaseConnection = function(){
	var config = configInfo.get(systemConstants.CONFIGKEY);
	var dbConfigOptions = {};
	if (config == null || config == undefined) {
		dbConfigOptions = {
			database: "master",
			user: systemConstants.DEFAULTDEVUSER,
			server: systemConstants.DEFAULTDEVSERVER,
			password: systemConstants.DEFAULTDEVPASSWORD,
			options: {
				encrypt: false
			}
		};
	} else {
		dbConfigOptions = {
			database: "master",
			server: config.DatabaseName,
			user: config.DatabaseUser,
			password: config.DatabasePassword,
			options: {
				encrypt: false
			}
		};
	}
	
	return dbConfigOptions;
}

exports.UpdateConfig = function(config){
	updateFunction(config);
}

exports.GetConfig = function() {
	return getFunction();
}

exports.GetCurrentPlugin = function() {
	var currentConfig = getFunction();
	return currentConfig.CurrentPlugin != undefined && currentConfig.CurrentPlugin != null
				? currentConfig.CurrentPlugin
				: "";
}

exports.GetPluginSourceLocation = function() {
	var currentConfig = getFunction();
	return currentConfig.CurrentPluginSourceLocation != undefined && currentConfig.CurrentPluginSourceLocation != null
				? currentConfig.CurrentPluginSourceLocation
				: "";
}

exports.GetCurrentApplication = function() {
	var currentConfig = getFunction();
	return currentConfig.CurrentApplication != undefined && currentConfig.CurrentApplication != null
				? currentConfig.CurrentApplication
				: "";
}

exports.GetApplicationSourceLocation = function() {
	var currentConfig = getFunction();
	return currentConfig.CurrentApplicationSourceLocation != undefined && currentConfig.CurrentApplicationSourceLocation != null
				? currentConfig.CurrentApplicationSourceLocation
				: "";
}

exports.GetServiceSourceLocation = function() {
	var currentConfig = getFunction();
	return currentConfig.CurrentServiceSourceLocation != undefined && currentConfig.CurrentServiceSourceLocation != null
				? currentConfig.CurrentServiceSourceLocation
				: "";
}

exports.GetCurrentService = function() {
	var currentConfig = getFunction();
	return currentConfig.CurrentService != undefined && currentConfig.CurrentService != null
				? currentConfig.CurrentService
				: "";
}

exports.GetCurrentServiceLocation = function() {
	var currentConfig = getFunction();
	return currentConfig.CurrentServiceSourceLocation != undefined && currentConfig.CurrentServiceSourceLocation != null
				? currentConfig.CurrentServiceSourceLocation
				: "";
}

exports.GetDatabaseName = function() {
	var currentConfig = getFunction();
	return currentConfig.DatabaseName != undefined && currentConfig.DatabaseName != null
				? currentConfig.DatabaseName
				: "";
}

exports.GetDatabaseUser = function() {
	var currentConfig = getFunction();
	return currentConfig.DatabaseUser != undefined && currentConfig.DatabaseUser != null
				? currentConfig.DatabaseUser
				: "";
}

exports.GetDatabasePassword = function() {
	var currentConfig = getFunction();
	return currentConfig.DatabasePassword != undefined && currentConfig.DatabasePassword != null
				? currentConfig.DatabasePassword
				: "";
}

exports.GetSourceLocation = function() {
	var currentConfig = getFunction();
	return currentConfig.SourceControlLocation != undefined && currentConfig.SourceControlLocation != null
				? currentConfig.SourceControlLocation
				: "";
}


exports.IsPlugin = function() {
	var currentConfig = getFunction();
	return currentConfig.CurrentPluginSourceLocation != undefined && currentConfig.CurrentPluginSourceLocation != null && currentConfig.CurrentPluginSourceLocation != ""
				? true
				: false;
}

exports.IsApplication = function() {
	var currentConfig = getFunction();
	return currentConfig.CurrentApplicationSourceLocation != undefined && currentConfig.CurrentApplicationSourceLocation != null && currentConfig.CurrentApplicationSourceLocation != ""
				? true
				: false;
}

exports.IsValid = function(config){
	if(config == undefined || config == null){
		config = getFunction();
	}
	if(config == null) return false;
		
	if(config.SourceControlLocation == undefined || config.SourceControlLocation == null || config.SourceControlLocation == "" ||
	   config.DatabaseName == undefined || config.DatabaseName == null ||
	   config.DatabaseUser == undefined || config.DatabaseUser == null ||
	   config.DatabasePassword == undefined || config.DatabasePassword == null){
		return false;
	}
	
	return true;
}

exports.IsServiceSetup = function(config){
	if(config == undefined || config == null){
		config = getFunction();
	}
	
	if(config == null) return false;
	
	if(config.CurrentService == undefined || config.CurrentService == null || config.CurrentService == ""){
		return false;
	}
	
	if(config.CurrentServiceSourceLocation == undefined || config.CurrentServiceSourceLocation == null || config.CurrentServiceSourceLocation == ""){
		return false;
	}
	
	return true;
}