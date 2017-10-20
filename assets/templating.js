require('jquery-validation');
var configInfo = require('./config');
const {ipcRenderer} = require('electron');

/*
	Create a few validator functions to help with the templating form
*/
$.validator.addMethod('standardPluginDataRequired', function (value, element, param) {
	return ($("#standardPlugin").is(":checked") || $("#standardApplication").is(":checked")) && value != undefined && value != null && value != "";
}, 'Required For Standard Plugin');

$.validator.addMethod('standardServiceDataRequired', function (value, element, param) {
	return $("#standardService").is(":checked") && value != undefined && value != null && value != "";
}, 'Required For Standard Service');

$.validator.addMethod('noSpace', function (value, element, param) {
	return value.indexOf(" ") < 0 && value != "";
}, 'Space is not required');

/*
	Setup the validation for the templating form
 */
function SetupValidation(){
	$("#frmTemplating").validate({});
	
	$( "#txtName" ).rules( "add", {
		noSpace: true,
		required: true,
		messages: { required: "Name is required"}
	});
	
	//standard plugin
	$( "#txtWebServiceURL" ).rules( "add", {
		standardPluginDataRequired: true,
		messages: { standardPluginDataRequired: "The development URL is required"}
	});
	$( "#txtTestWebServiceURL" ).rules( "add", {
		standardPluginDataRequired: true,
		messages: { standardPluginDataRequired: "The test URL is required"}
	});
	$( "#txtProdWebServiceURL" ).rules( "add", {
		standardPluginDataRequired: true,
		messages: { standardPluginDataRequired: "The production URL is required"}
	});
	//standard plugin
	
	//standard service
	$( "#txtDatabaseName" ).rules( "add", {
		standardServiceDataRequired: true,
		messages: { standardServiceDataRequired: "The name of the database is required"}
	});
	$( "#txtDatabaseServer" ).rules( "add", {
		standardServiceDataRequired: true,
		messages: { standardServiceDataRequired: "The development database server is required"}
	});
	$( "#txtDatabaseUser" ).rules( "add", {
		standardServiceDataRequired: true,
		messages: { standardServiceDataRequired: "The development database user is required"}
	});
	$( "#txtDatabasePassword" ).rules( "add", {
		standardServiceDataRequired: true,
		messages: { standardServiceDataRequired: "The development database password is required"}
	});
	$( "#txtProdDatabaesServer" ).rules( "add", {
		standardServiceDataRequired: true,
		messages: { standardServiceDataRequired: "The production database server is required"}
	});
	$( "#txtProdDatabaseUser" ).rules( "add", {
		standardServiceDataRequired: true,
		messages: { standardServiceDataRequired: "The production database user is required"}
	});
	$( "#txtProdDatabasePassword" ).rules( "add", {
		standardServiceDataRequired: true,
		messages: { standardServiceDataRequired: "The production database password is required"}
	});
	//standard service
}

$(document).ready(function () {
	if(!configInfo.IsValid() && !configInfo.IsServiceSetup()){
		$("#dvAlert").removeClass("hidden");
	} else {
		$("#dvAlert").addClass("hidden");
	}

    var templateConfig = ipcRenderer.sendSync('get-config');
	SetupValidation();
	
	$("#txtName").change(function(){
		var value = $("#txtName").val();
		$("#txtDatabaseName").val(value);
	});
	
	$('input[type=radio][name=pluginType]').change(function() {
		$(".dvPluginInfo").addClass("hidden");
        if (this.value == 'sp' || this.value == 'app') {
            $(".dvPluginInfo").removeClass("hidden");
        }
    });
	
	$('input[type=radio][name=serviceType]').change(function() {
        if (this.value == 'NA') {
            $(".dvSericeInfo").addClass("hidden");
        } else {
			$(".dvSericeInfo").removeClass("hidden");
		}
    });
	
	if(templateConfig != undefined && templateConfig != null){
		$("#lblSourceLocation").html(templateConfig.SourceControlLocation);
	}
	$("#btnCancel").click(function(){
		$(".content").load("home.html");
	});
	
	$("#frmTemplating").submit(function (event) {
		event.preventDefault();
		if ($(this).valid()) {
			var config = {
				Name: $("#txtName").val(),
				SourceLocation: templateConfig.SourceControlLocation,
				StandardPlugin: $("#standardPlugin").is(":checked"),
				StandardApplication: $("#standardApplication").is(":checked"),
				StandardService: $("#standardService").is(":checked"),
				CoreService: $("#coreService").is(":checked"),
				CreateMaster: $("#standardService").is(":checked") || $("#coreService").is(":checked"),
				WebServiceUrl: $("#txtWebServiceURL").val(),
				webServiceTestUrl: $("#txtTestWebServiceURL").val(),
				webServiceProdUrl: $("#txtProdWebServiceURL").val(),
				DatabaseName: $("#txtDatabaseName").val(),
				DatabaseServer: $("#txtDatabaseServer").val(),
				DatabaseUser: $("#txtDatabaseUser").val(),
				DatabasePassword: $("#txtDatabasePassword").val(),
				DatabaseProdServer: $("#txtProdDatabaesServer").val(),
				DatabaseProdUser: $("#txtProdDatabaseUser").val(),
				DatabaseProdPassword: $("#txtProdDatabasePassword").val()
			};

			var answer = ipcRenderer.sendSync('run-templates', config);
			if(answer == "saved"){ 
				$(".content").load("home.html");
			}
		}
	});
	$("#btnTemplateOptions").click(function () { $(".content").load( "options.html" ); });
});