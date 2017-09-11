// window.$ = window.jQuery = require('jquery'); //so we can use jquery
// require('jquery-ui');
// const {ipcRenderer} = require('electron');
var configInfo = require('./config');
var currentConfig = configInfo.GetConfig();
const dialog = require('electron').remote.dialog 

function ShowBranchSelection(projFiles, isPlugin, name){
	$("#rdBranch").empty();
	$("#rdIsPlugin").val(isPlugin ? "true" : "false");
	$("#sourceName").val(name);
	if(projFiles != undefined && projFiles != null && projFiles.length > 0){
		for(var i = 0; i < projFiles.length; i++){
			var projfile = projFiles[i];
			$("#rdBranch").append("<div class=\"radio\"><label><input type=\"radio\" name=\"branchType\" value=\"" + projfile + "\" " +  (projfile.includes("Trunk") ? "checked=checked" : "")  + "/>" + projfile + "</label></div>");
		}
		if(projFiles.length == 1){
			SetFolder(isPlugin);
		} else {
			$('#mdlRadioSelection').modal('show');
		}
	}
}

function SetFolder(isPlugin,){
	var projectfile = $("input[type='radio'][name='branchType']:checked").val();
	var folder = ipcRenderer.sendSync('get-folder-from-file', { SourceLocation: $("#txtSourceControlLocation").val(), Name: $("#sourceName").val(),  File: projectfile, IsPlugin: isPlugin});
	if(isPlugin){	
		$("#lblPluginBranch").html(folder);
	} else {
		$("#lblServiceBranch").html(folder);
	}
	$('#mdlRadioSelection').modal('hide');
	console.log(folder);
}

$(document).ready(function () {
	
    $("#txtDatabaseService").val(currentConfig.DatabaseName);
    $("#txtDatabaseUser").val(currentConfig.DatabaseUser != undefined ? currentConfig.DatabaseUser : "Dwsvc");
	$("#txtDatabasePassword").val(currentConfig.DatabasePassword);
    $("#txtSourceControlLocation").val(currentConfig.SourceControlLocation);
	$("#lblPluginBranch").html(currentConfig.CurrentPluginSourceLocation);
	$("#lblServiceBranch").html(currentConfig.CurrentServiceSourceLocation);
	
	$("#btnSelectSourceLocation").click(function(){
		var path = dialog.showOpenDialog({
			properties: ['openDirectory'],
			defaultPath: $("#txtSourceControlLocation").val()
		});
		
		if(path != undefined){
			$("#txtSourceControlLocation").val(path[0]);
		}
	});
	
	$("#dlPlugins").change(function(){
		
		var projfiles = ipcRenderer.sendSync('get-project-files', {	SourceLocation: $("#txtSourceControlLocation").val(), 
																	IsPlugin: true, 
																	Name: $("#dlPlugins").val()});
																	
		ShowBranchSelection(projfiles, true, $("#dlPlugins").val());
	});
	
	$("#dlServices").change(function(){
		
		var projfiles = ipcRenderer.sendSync('get-project-files', {	SourceLocation: $("#txtSourceControlLocation").val(), 
																	IsPlugin: false, 
																	Name: $("#dlServices").val()});
																	
		ShowBranchSelection(projfiles, false, $("#dlServices").val());
	});
	
	$("#btnRadioSelect").click(function(){
		var isPlugin = $("#rdIsPlugin").val() == "true" ? true : false;
		SetFolder(isPlugin);
	});
	
    $("#btnSave").click(function () {
        if (currentConfig == null || currentConfig == undefined) {
            currentConfig = {};
        }

        currentConfig.DatabaseName = $("#txtDatabaseService").val();
        currentConfig.DatabasePassword = $("#txtDatabasePassword").val();
        currentConfig.SourceControlLocation = $("#txtSourceControlLocation").val();
        currentConfig.CurrentPlugin = $("#dlPlugins").val();
        currentConfig.CurrentService = $("#dlServices").val();
		currentConfig.DatabaseUser = $("#txtDatabaseUser").val();
		currentConfig.CurrentPluginSourceLocation = $("#lblPluginBranch").html();
		currentConfig.CurrentServiceSourceLocation = $("#lblServiceBranch").html();
		configInfo.UpdateConfig(currentConfig);
        $(".content").load("home.html");
    });

    var plugins = ipcRenderer.sendSync('get-plugin-folder-names');
    for (var i = 0; i < plugins.length; i++) {
        $("#dlPlugins").append($("<option></option>").attr("value", plugins[i]).text(plugins[i]));
    }

    if (currentConfig.CurrentPlugin != null && currentConfig.CurrentPlugin != undefined && currentConfig.CurrentPlugin != "") {
        $("#dlPlugins").val(currentConfig.CurrentPlugin);
    }

    var services = ipcRenderer.sendSync('get-service-folder-names');
    for (var i = 0; i < services.length; i++) {
        $("#dlServices").append($("<option></option>").attr("value", services[i]).text(services[i]));
    }

    if (currentConfig.CurrentService != null && currentConfig.CurrentService != undefined && currentConfig.CurrentService != "") {
        $("#dlServices").val(currentConfig.CurrentService);
    }
	
	$("#btnCancel").click(function(){
		$('#mdlRadioSelection').modal('hide');
		$("#rdBranch").empty();
	});
});