// You can also require other files to run in this process
require('jquery-validation');
var configInfo = require('./config');

$.validator.addMethod('requiredForExternal', function (value, element, param) {
	return (!$("#chkIsExternal").is(":checked")) || ($("#chkIsExternal").is(":checked") && value != undefined && value != null && value != "");
}, 'Required for Application');

$.validator.addMethod('requiredForPlugin', function (value, element, param) {
	return ($("#chkIsExternal").is(":checked")) || (!$("#chkIsExternal").is(":checked") && value != undefined && value != null && value != "");
}, 'Required for Application');

$.validator.addMethod('noSpace', function (value, element, param) {
	return value.indexOf(" ") < 0 && value != "";
}, 'Space is not required');

$.validator.addMethod("checkNameExists", function(value, element)
{
	var isExists = true;
    $.ajax(
    {
        type: "GET",
        url: "http://localhost:3000/api/Plugins/GetByName/" + value,
        contentType: 'application/json; charset=utf-8',
		dataType: "json",
		async: false,  //make sure we at least get the file and see
        success: function(returnData)
        {
			console.log(returnData);
			if(returnData.length == 0 ||(
			   (returnData[0].PluginId == $("#hdPluginId").val()))){
				isExists = true;
			} else {
				isExists = false;
			}
        },
        error: function(xhr, textStatus, errorThrown)
        {
            alert('ajax loading error... ... '+url + query);
            return false;
        }
    });
	return isExists;
}, '');

$.validator.addMethod("checkAreaExists", function(value, element)
{
	var isExists = true;
    $.ajax(
    {
        type: "GET",
        url: "http://localhost:3000/api/Plugins/GetByAreaName/" + value,
        contentType: 'application/json; charset=utf-8',
		dataType: "json",
		async: false,  //make sure we at least get the file and see
        success: function(returnData)
        {
			console.log(returnData);
			if(returnData.length == 0 ||(
			   (returnData[0].PluginId == $("#hdPluginId").val()))){
				isExists = true;
			} else {
				isExists = false;
			}
        },
        error: function(xhr, textStatus, errorThrown)
        {
            alert('ajax loading error... ... '+url + query);
            return false;
        }
    });
	return isExists;
}, '');

$.validator.addMethod("checkRoleExists", function(value, element)
{
	var pluginId = $("#hdPluginRolePluginId").val();
	var url = "http://localhost:3000/api/PluginRoles/GetByPluginIdAndName/" + pluginId ;
	var isExists = true;
    $.ajax(
    {
		type: "POST",
		url: url,
		contentType: 'application/json; charset=utf-8',
		data: JSON.stringify({ Name: value}),
		async: false,  //make sure we at least get the file and see
		success: function (returnData) {
			if(returnData.length == 0 ||(
			   (returnData[0].PluginRoleId == $("#hdPluginRoleId").val()))){
				isExists = true;
			} else {
				isExists = false;
			}
		},
		error: function (error) {
			console.log("Error:");
			console.log(error);
		}	
    });
	return isExists;
}, '');

function SetupPluginRoleValidation(){
	$("#frmPluginRole").validate({ focusCleanup: true });
	$( "#txtPluginRoleName" ).rules( "add", {
		required: true,
		checkRoleExists: true,
		maxlength: 50,
		messages: { required: "Name is required",
					checkRoleExists: "Name already exists"}
	});
}

function SetupValidation(){
	$("#frmPlugin").validate({ focusCleanup: true });
	
	$( "#txtPluginName" ).rules( "add", {
		noSpace: true,
		required: true,
		checkNameExists: true,
		maxlength: 50,
		messages: { required: "Name is required",
					noSpace: "Cannot have a space",
					checkNameExists: "Name already exists"}
	});
	
	$( "#txtAreaPrefix" ).rules( "add", {
		noSpace: true,
		requiredForPlugin: true,
		checkAreaExists: true,
		maxlength: 50,
		messages: { requiredForPlugin: "Area Prefix is required for plugins",
					noSpace: "Cannot have a space",
					checkAreaExists: "Area already exists"}
	});
	
	$( "#txtDisplayName" ).rules( "add", {
		required: true,
		maxlength: 100,
		messages: { required: "The display name is required"}
	});
	
	$( "#txtDescription" ).rules( "add", {
		required: true,
		maxlength: 500,
		messages: { required: "Description is required"}
	});
	
	$( "#txtCssIcon" ).rules( "add", {
		required: true,
		maxlength: 100,
		messages: { required: "The font-awesome icon is required"}
	});
	
	$( "#txtMainUrl" ).rules( "add", {
		url: true,
		requiredForExternal: true,
		maxlength: 500,
		messages: { url: "Main Url must be a url",
					requiredForExternal:  "Main Url is required for Application"
		}
	});
	
	$( "#txtTrainingUrl" ).rules( "add", {
		url: true,
		maxlength: 500,
		messages: { url: "Training Url must be a url"}
	});
	
	$( "#txtOutputDirectory" ).rules( "add", {
		maxlength: 50
	});
	
	$( "#txtAnonymousRole" ).rules( "add", {
		maxlength: 50
	});
	
	$( "#txtCategory" ).rules( "add", {
		maxlength: 50
	});
	
	$( "#txtSortIndex" ).rules( "add", {
		range: [1, 10],
		required: true,
		messages: { 
			range: "Must be between 1 and 10",
			required: "Sort Index is required"
		}
	});
	
}

window.operateEvents = {
	'click .btn_roles': function (e, value, row, index) {
		GetPluginRolesByPluginId(row.PluginId);
	},
	'click .btn_edit': function (e, value, row, index) {
		GetPlugin(row.PluginId);
	}
};

function GetPluginRolesByPluginId(pluginId){
	ClearPluginRoleInfo();
	$("#hdPluginRolePluginId").val(pluginId);
	jQuery.ajax({
		type: "GET",
		url: "http://localhost:3000/api/PluginRoles/GetByPluginId/" + pluginId,
		contentType: 'application/json; charset=utf-8',
		dataType: "json",
		async: false,  //make sure we at least get the file and see
		success: function (data) {
			$("#dvPluginRoles").empty();
			for(var i = 0; i < data.length; i++){
				$("#dvPluginRoles").append("<button data-pluginroleid=\"" + data[i].PluginRoleId + "\" type=\"button\" class=\"editpluginrole list-group-item\">" + data[i].Description + "</button>");
			}
			$('#mdlPluginRoleAdd').modal('show');
		},
		error: function (error) {
			console.log("Error:");
			console.log(error);
		},
		traditional: true
	});
	
}

function ClearPluginInfo(){
	$("#hdPluginId").val("");
	$("#txtPluginName").val("");
	$("#txtAreaPrefix").val("");
	$("#txtDisplayName").val("");
	$("#txtDescription").val("");
	$("#txtCssIcon").val("fa-plug");
	$("#txtCategory").val("");
	$("#txtMainUrl").val("");
	$("#txtTrainingUrl").val("");
	$("#txtAnonymousRole").val("");
	$("#txtOutputDirectory").val("");
	$("#txtSortIndex").val("1");
	$("#chkIsExternal").prop('checked', false);
	$("#chkIsShowInHome").prop('checked', true);
}

function ClearPluginRoleInfo(){
	$("#hdPluginRoleId").val("");
	$("#hdPluginRoleId").val("");
	$("#txtPluginRoleName").val("");
	$("#dvPluginRoles").empty();
}

function GetPluginFromModal(){
	return {
		PluginId: parseInt($("#hdPluginId").val()),
		Description: $("#txtDescription").val(),
		Name: $("#txtPluginName").val(),
		CssIcon: $("#txtCssIcon").val(),
		Category: $("#txtCategory").val(),
		IsInstalled: 1,
		TrainingVideoURL: $("#txtTrainingUrl").val(),
		IsExternal: $("#chkIsExternal").is(":checked") ? 1: 0,
		MainUrl: $("#txtMainUrl").val(),
		AreaRoutePrefix: $("#txtAreaPrefix").val(),
		ShowInHome: $("#chkIsShowInHome").is(":checked") ? 1: 0,
		SortIndex: parseInt($("#txtSortIndex").val()),
		DisplayName: $("#txtDisplayName").val(),
		OutputDirectoryName: $("#txtOutputDirectory").val(),
		AnonymousRole: $("#txtAnonymousRole").val()
	};
}

function GetPluginRoleFromModal(){
	return {
		PluginId: parseInt($("#hdPluginRolePluginId").val()),
		Description: $("#txtPluginRoleName").val(),
	};
}

function GetPlugin(pluginId){
	jQuery.ajax({
		type: "GET",
		url: "http://localhost:3000/api/Plugins/" + pluginId,
		contentType: 'application/json; charset=utf-8',
		dataType: "json",
		async: false,  //make sure we at least get the file and see
		success: function (data) {
			if(data[0] != null && data[0] != undefined){
				$("#hdPluginId").val(pluginId);
				$("#txtPluginName").val(data[0].Name);
				$("#txtAreaPrefix").val(data[0].AreaRoutePrefix);
				$("#txtDisplayName").val(data[0].DisplayName);
				$("#txtDescription").val(data[0].Description);
				$("#txtCssIcon").val(data[0].CssIcon);
				$("#txtCategory").val(data[0].Category);
				$("#txtMainUrl").val(data[0].MainUrl);
				$("#txtTrainingUrl").val(data[0].TrainingVideoURL);
				$("#txtAnonymousRole").val(data[0].AnonymousRole);
				$("#txtOutputDirectory").val(data[0].OutputDirectoryName);
				$("#txtSortIndex").val(data[0].SortIndex);
				$("#chkIsExternal").prop('checked', data[0].IsExternal);
				$("#chkIsShowInHome").prop('checked', data[0].ShowInHome);
				$("#frmPlugin").validate().resetForm();
				$('#mdlPluginAdd').modal('show')
			}
		},
		error: function (error) {
			console.log("Error:");
			console.log(error);
		},
		traditional: true
	});
}

function UpdatePlugin(pluginId){
	var plugindata = GetPluginFromModal();
	jQuery.ajax({
		type: "PUT",
		url: "http://localhost:3000/api/Plugins/" + pluginId,
		contentType: 'application/json; charset=utf-8',
		traditional: true,
		data: JSON.stringify(plugindata),
		success: function () {
			ClearPluginInfo();
			ReloadTable();
			$('#mdlPluginAdd').modal('hide');
		},
		error: function (error) {
			console.log("Error:");
			console.log(error);
		}	
	});
}

function AddPlugin(){
	var plugindata = GetPluginFromModal();
	jQuery.ajax({
		type: "POST",
		url: "http://localhost:3000/api/Plugins/",
		contentType: 'application/json; charset=utf-8',
		data: JSON.stringify(plugindata),
		success: function () {
			ClearPluginInfo();
			ReloadTable();
			$('#mdlPluginAdd').modal('hide');
		},
		error: function (error) {
			console.log("Error:");
			console.log(error);
		}	
	});
}

function AddPluginRole(){
	var plugindata = GetPluginRoleFromModal();
	console.log(plugindata);
	jQuery.ajax({
		 type: "POST",
		url: "http://localhost:3000/api/PluginRoles/",
		contentType: 'application/json; charset=utf-8',
		data: JSON.stringify(plugindata),
		success: function () {
			ClearPluginRoleInfo();
			$('#mdlPluginRoleAdd').modal('hide');
		},
		error: function (error) {
			console.log("Error:");
			console.log(error);
		}	
	});
}


function ReloadTable(){
	jQuery.ajax({
		type: "GET",
		url: "http://localhost:3000/api/Plugins",
		contentType: 'application/json; charset=utf-8',
		dataType: "json",
		//async: false,  //make sure we at least get the file and see
		success: function (data) {
			$("#tblPlugins").bootstrapTable('load', data);
		},
		error: function (error) {
			console.log("Error:");
			console.log(error);
		},
		traditional: true
	});
}

$(document).ready(function () {
	if(!configInfo.IsValid()){
		$("#dvAlert").removeClass("hidden");
	} else {
		$("#dvAlert").addClass("hidden");
	}
	$("#tblPlugins").bootstrapTable();
	$("#btnAddPlugin").click(function(){
		ClearPluginInfo();
		$('#mdlPluginAdd').modal('show');
	});	
	$('[data-toggle="tooltip"]').tooltip();
	$("#btnPluginOptions").click(function () { $(".content").load( "options.html" ); });
	SetupValidation();
	SetupPluginRoleValidation();
	ReloadTable();
	ClearPluginInfo();
	ClearPluginRoleInfo();
	$("#frmPluginRole").submit(function(event){
		event.preventDefault();
		if ($(this).valid()) {
			AddPluginRole();
		}
	});
	
	$("#frmPlugin").submit(function(event){
		event.preventDefault();
		if ($(this).valid()) {
			if($("#hdPluginId").val() == ""){
				AddPlugin();
			} else {
				UpdatePlugin($("hdPluginId").html());
			}
		}
	});
	
	$("#btnCancel").click(function(){
		ClearPluginInfo();
		$('#mdlPluginAdd').modal('hide');
	});
});