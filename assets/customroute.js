var configInfo = require('./config');
const {ipcRenderer} = require('electron');

function PopulateSerivceEntities(){
    var sourceLocation = configInfo.GetCurrentServiceLocation();
    var entities = ipcRenderer.sendSync('get-entities-from-service', {
        SourceLocation: sourceLocation
    });

    for (var i = 0; i < entities.length; i++) {
        $("#dlEntities").append($("<option></option>").attr("value", entities[i]).text(entities[i]));
    }
}

ipcRenderer.on('run-extended-reply', (event, arg) => {  
    // Print 2
    console.log("Err: " + arg);
    // Print 4
    $(".content").load( "home.html" );
});

function RunTemplate(){
    var templateParameters = {
        EntityName: $("#dlEntities").val(),
        FunctionName: $("#txtFunctionName").val(),
        ServiceLocation: configInfo.GetCurrentServiceLocation(),
        PluginLocation: configInfo.IsPlugin()
                            ? configInfo.GetPluginSourceLocation()
                            : configInfo.GetApplicationSourceLocation(),
        FunctionInfo: "[]",
        ReturnsList: false
    };
    ipcRenderer.send('run-extended', templateParameters);
    console.log(templateParameters);
}

$(document).ready(function () {
	if(!configInfo.IsValid() && !configInfo.IsServiceSetup()){
		$("#dvAlert").removeClass("hidden");
    } else {
        $("#lblCurrentDatabase").html(configInfo.GetDatabaseName());
        $("#lblCurrentService").html(configInfo.GetCurrentService());
        $("#lblCodeLocation").html(configInfo.GetServiceSourceLocation());
        $("#dvServiceLocation").html(configInfo.GetServiceSourceLocation());
        
        if(configInfo.IsPlugin()){
            $(".plugininfo").removeClass("hidden");
            $("#lblPluginLocation").html(configInfo.GetPluginSourceLocation());
            $("#dvPluginLocation").html(configInfo.GetPluginSourceLocation());
            $("#lblPluginCheckBoxLabel").append(" Add Entity to Plugin");
        } else {
            $(".appinfo").removeClass("hidden");
            $("#lblApplication").html(configInfo.GetApplicationSourceLocation());
            $("#dvApplicationLocation").html(configInfo.GetApplicationSourceLocation());
            $("#lblPluginCheckBoxLabel").append(" Add Entity to Application");
        }

        PopulateSerivceEntities();

        $("#dlEntities").change(function(){
            if($(this).val() == ""){
                $("#dvEntityAction").addClass("hidden");
            } else {
                $("#dvEntityAction").removeClass("hidden");
            }
        });

        $("#dlAction").change(function(){
            if($(this).val() == ""){
                $("#dvEntityParameters").addClass("hidden");
            } else {
                $("#dvEntityParameters").removeClass("hidden");
            }
        });

        var parameterTypes = [
            { Type: "int",  Display: "INT"},
            { Type: "long", Display: "LONG"},
            { Type: "double", Display: "DOUBLE"},
            { Type: "string", Display: "STRING"}
        ];

        $.each(parameterTypes, function(i, param){
            $("#dlParameter1Type")
                .append($("<option></option>")
                .attr("value", param.Type)
                .text(param.Display));
            
            $("#dlParameter2Type")
                .append($("<option></option>")
                .attr("value", param.Type)
                .text(param.Display));
            
            $("#dlParameter3Type")
                .append($("<option></option>")
                .attr("value", param.Type)
                .text(param.Display));
        });
    }

    $("#chkParameter1, #chkParameter2, #chkParameter3").change(function(){
        var number = $(this).attr("rel-number");
        var ddl = "dlParameter" + number + "Type";
        var txt = "txtParameter" + number + "Name";
        if($(this).is(":checked")) {
            $("#" + ddl).removeAttr("disabled");
            $("#" + txt).removeAttr("disabled");
        } else {
            $("#" + ddl).attr("disabled", "disabled");
            $("#" + txt).attr("disabled", "disabled");
        }
    });
    $("#btnSubmit").click(function(){
        RunTemplate();
    });
    $("#btnTemplateOptions").click(function () { $(".content").load( "options.html" ); });
    $("#btnCancel").click(function () { $(".content").load( "home.html" ); });
});