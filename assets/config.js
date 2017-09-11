var elecConfig = require("electron-config");
var configInfo = new elecConfig();
var CONFIGNAME = "IBIPluginManagementOptions";
var updateFunction = function(config){
	if(config != undefined && config != null){
		configInfo.set(CONFIGNAME, config);
	}
}
var getFunction = function(){
	var currentConfig = configInfo.get(CONFIGNAME);
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
	return currentConfig;
}

exports.UpdateConfig = function(config){
	updateFunction(config);
}

exports.GetConfig = function() {
	return getFunction();
}

exports.GetPluginSourceLocation = function() {
	var currentConfig = getFunction();
	return currentConfig.CurrentPluginSourceLocation != undefined && currentConfig.CurrentPluginSourceLocation != null
				? currentConfig.CurrentPluginSourceLocation
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

exports.IsValid = function(config){
	if(config == undefined || config == null){
		config = getFunction();
	}
	if(config == null) return false;
		
	if(config.SourceControlLocation == undefined || config.SourceControlLocation == null ||
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
	
	if(config.CurrentService == undefined || config.CurrentService == null){
		return false;
	}
	
	if(config.CurrentServiceSourceLocation == undefined || config.CurrentServiceSourceLocation == null){
		return false;
	}
	
	return true;
}