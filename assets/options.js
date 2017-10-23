// window.$ = window.jQuery = require('jquery'); //so we can use jquery
// require('jquery-ui');
const {ipcRenderer} = require('electron');
var configInfo = require('./config');
var currentConfig = configInfo.GetConfig();
const {dialog} = require('electron').remote;

function ShowBranchSelection(projFiles, isPlugin, name, isApplication){
	$("#rdBranch").empty();
	$("#rdIsPlugin").val(isPlugin || isApplication ? "true" : "false");
	$("#sourceName").val(name);
	if(projFiles != undefined && projFiles != null && projFiles.length > 0){
		for(var i = 0; i < projFiles.length; i++){
			var projfile = projFiles[i];
			$("#rdBranch").append("<p><input class=\"with-gap\" type=\"radio\" name=\"branchType\" id=\"Branch_"+i+ "\" value=\"" + projfile + "\" " +  (projfile.includes("Trunk") ? "checked=checked" : "")  + "/><label for=\"Branch_"+i+"\">" + projfile + "</label></p>");
			//$("#rdBranch").append("<div class=\"radio\"><label><input type=\"radio\" name=\"branchType\" value=\"" + projfile + "\" " +  (projfile.includes("Trunk") ? "checked=checked" : "")  + "/>" + projfile + "</label></div>");			
		}
		if(projFiles.length == 1){
			SetFolder(isPlugin, isApplication);
		} else {
			$('#mdlRadioSelection').modal('open');
		}
	}
}

function SetFolder(isPlugin,isApplication){
	var projectfile = $("input[type='radio'][name='branchType']:checked").val();
	var folder = ipcRenderer.sendSync('get-folder-from-file', { SourceLocation: $("#txtSourceControlLocation").val(), Name: $("#sourceName").val(),  File: projectfile, IsPlugin: isPlugin, IsApplication: isApplication});
	if(isPlugin != undefined && isPlugin){	
		$("#lblPluginBranch").html(folder);
		$(".pluginlabel").removeClass("hidden");
		$(".applicationlabel").addClass("hidden");
	} else if (isApplication != undefined && isApplication){
		$("#lblApplicationBranch").html(folder);
		$(".applicationlabel").removeClass("hidden");
		$(".pluginlabel").addClass("hidden");
	} else {
		$("#lblServiceBranch").html(folder);
	}
	$('#mdlRadioSelection').modal('close');
	console.log(folder);
}

$(document).ready(function () {
	$(".infolabel").addClass("hidden");
    $("#txtDatabaseService").val(configInfo.GetDatabaseName());
    $("#txtDatabaseUser").val(configInfo.GetDatabaseUser());
	$("#txtDatabasePassword").val(configInfo.GetDatabasePassword());
    $("#txtSourceControlLocation").val(configInfo.GetSourceLocation());
	$("#lblPluginBranch").html(configInfo.GetPluginSourceLocation());
	$("#lblServiceBranch").html(configInfo.GetCurrentServiceLocation());
	$("#lblApplicationBranch").html(configInfo.GetApplicationSourceLocation());
	
	if(configInfo.GetApplicationSourceLocation() != ""){ $(".applicationlabel").removeClass("hidden"); }
	if(configInfo.GetPluginSourceLocation() != ""){ $(".pluginlabel").removeClass("hidden"); }
	
	$("#btnSelectSourceLocation").click(function(){
		var path = dialog.showOpenDialog({
			properties: ['openDirectory'],
			defaultPath: $("#txtSourceControlLocation").val()
		});
		
		if(path[0] != undefined){
			$("#txtSourceControlLocation").val(path[0]);
		}
		
		
	});
	
	$("#dlPlugins").change(function(){
		if($("#dlPlugins").val() == ""){
			$("#lblPluginBranch").html("");
			return;
		} else {
			$("#lblApplicationBranch").html("");
			$("#dlApps").val("");
		}
		var projfiles = ipcRenderer.sendSync('get-project-files', {	SourceLocation: $("#txtSourceControlLocation").val(), 
																	IsPlugin: true, 
																	Name: $("#dlPlugins").val()});
																	
		ShowBranchSelection(projfiles, true, $("#dlPlugins").val(), false);
	});
	
	$("#dlApps").change(function(){
		if($("#dlApps").val() == ""){
			$("#lblApplicationBranch").html("");
			return;
		} else {
			$("#lblPluginBranch").html("");
			$("#dlPlugins").val("");
		}
		var projfiles = ipcRenderer.sendSync('get-project-files', {	SourceLocation: $("#txtSourceControlLocation").val(), 
																	IsApplication: true,
																	Name: $("#dlApps").val()});
		ShowBranchSelection(projfiles, false, $("#dlApps").val(), true);
	});
	
	$("#dlServices").change(function(){
		
		var projfiles = ipcRenderer.sendSync('get-project-files', {	SourceLocation: $("#txtSourceControlLocation").val(), 
																	IsPlugin: false, 
																	Name: $("#dlServices").val()});
																	
		ShowBranchSelection(projfiles, false, $("#dlServices").val(), false);
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
        currentConfig.CurrentApplication = $("#dlApps").val();
		currentConfig.CurrentPlugin = $("#dlPlugins").val();
        currentConfig.CurrentService = $("#dlServices").val();
		currentConfig.DatabaseUser = $("#txtDatabaseUser").val();
		currentConfig.CurrentPluginSourceLocation = $("#lblPluginBranch").html();
		currentConfig.CurrentServiceSourceLocation = $("#lblServiceBranch").html();
		currentConfig.CurrentApplicationSourceLocation = $("#lblApplicationBranch").html();
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
	
	var applications = ipcRenderer.sendSync('get-application-folder-names');
    for (var i = 0; i < applications.length; i++) {
        $("#dlApps").append($("<option></option>").attr("value", applications[i]).text(applications[i]));
    }
	if (currentConfig.CurrentApplication != null && currentConfig.CurrentApplication != undefined && currentConfig.CurrentApplication != "") {
        $("#dlApps").val(currentConfig.CurrentApplication);
    }
	
	
	$("#btnCancel").click(function(){
		$('#mdlRadioSelection').modal('close');
		$("#rdBranch").empty();
	});

	$('.modal').modal();
});