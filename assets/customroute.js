var configInfo = require('./config');
require('jquery-validation');
const {ipcRenderer} = require('electron');

$.validator.addMethod('noSpace', function (value, element, param) {
	return value.indexOf(" ") < 0 && value != "";
}, 'Space is not required');


function PopulateSerivceEntities() {
    var sourceLocation = configInfo.GetCurrentServiceLocation();
    var entities = ipcRenderer.sendSync('get-entities-from-service', {
        SourceLocation: sourceLocation
    });

    for (var i = 0; i < entities.length; i++) {
        $("#dlEntities").append($("<option></option>").attr("value", entities[i]).text(entities[i]));
    }
}

ipcRenderer.on('run-extended-reply', (event, arg) => {
    // Print 4
    $(".content").load("home.html");
});

function SetupFormValidation(){
    $("#frmExtend").validate({ focusCleanup: true });
    $( "#txtFunctionName" ).rules( "add", {
		noSpace: true,
		required: true,
		maxlength: 50,
		messages: { required: "Function name is required",
					noSpace: "Cannot have a space"}
    });
    $( ".txtParameterName" ).rules( "add", {
		noSpace: true,
		required: true,
		maxlength: 50,
		messages: { required: "Parameter name is required",
					noSpace: "Cannot have a space"}
	});
}

function RunTemplate() {
    var funtionInfo = [];
    $(".allParams").each(function (i, item) {
        var type = $(this).find(".dlParameterType").val();
        var name = $(this).find(".txtParameterName").val();
        if (name != "") {
            funtionInfo.push({
                Name: name,
                Type: type
            });
        }
    });
    var templateParameters = {
        EntityName: $("#dlEntities").val(),
        FunctionName: $("#txtFunctionName").val(),
        ServiceLocation: configInfo.GetCurrentServiceLocation(),
        PluginLocation: configInfo.IsPlugin() ?
            configInfo.GetPluginSourceLocation() :
            configInfo.GetApplicationSourceLocation(),
        FunctionInfo: JSON.stringify(funtionInfo),
        ReturnsList: $("#dlReturn").val() == "list",
        IsPost: $("#dlAction").val() == "post"
    };
    console.log(templateParameters);
    ipcRenderer.send('run-extended', templateParameters);
}

$(document).ready(function () {
    var parametercount = 0;
    if (!configInfo.IsValid() && !configInfo.IsServiceSetup()) {
        $("#dvAlert").removeClass("hidden");
    } else {
        $("#lblCurrentDatabase").html(configInfo.GetDatabaseName());
        $("#lblCurrentService").html(configInfo.GetCurrentService());
        $("#lblCodeLocation").html(configInfo.GetServiceSourceLocation());
        $("#dvServiceLocation").html(configInfo.GetServiceSourceLocation());

        if (configInfo.IsPlugin()) {
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
        SetupFormValidation();
        $("#dlEntities").change(function () {
            if ($(this).val() == "") {
                $("#dvEntityAction").addClass("hidden");
                $("#dvEntityParameters").addClass("hidden");
            } else {
                $("#dvEntityAction").removeClass("hidden");
                $("#dvEntityParameters").removeClass("hidden");
            }
        });

        var parameterTypes = [{
                Type: "int",
                Display: "INT"
            },
            {
                Type: "long",
                Display: "LONG"
            },
            {
                Type: "double",
                Display: "DOUBLE"
            },
            {
                Type: "string",
                Display: "STRING"
            }
        ];

        $.each(parameterTypes, function (i, param) {
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

    $("#chkParameter1, #chkParameter2, #chkParameter3").change(function () {
        var number = $(this).attr("rel-number");
        var ddl = "dlParameter" + number + "Type";
        var txt = "txtParameter" + number + "Name";
        if ($(this).is(":checked")) {
            $("#" + ddl).removeAttr("disabled");
            $("#" + txt).removeAttr("disabled");
        } else {
            $("#" + ddl).attr("disabled", "disabled");
            $("#" + txt).attr("disabled", "disabled");
        }
    });

    $("#btnTemplateOptions").click(function () {
        $(".content").load("options.html");
    });
    $("#btnCancel").click(function () {
        $(".content").load("home.html");
    });

    $("#btnPlus").click(function () {
        parametercount++;
        var newParameterHtml = "";
        newParameterHtml += "<div class=\"list-group-item allParams parameters" + parametercount + "\" rel-count=\"" + parametercount + "\">";
        newParameterHtml += "    <div class=\"form-group\">";
        newParameterHtml += "        <label class=\"col-xs-3 control-label\">Parameter Type:</label>";
        newParameterHtml += "        <div class=\"col-xs-8\">";
        newParameterHtml += "            <select class=\"dlParameterType form-control\">";
        newParameterHtml += "               <option value=\"int\">INT</option>";
        newParameterHtml += "               <option value=\"long\">LONG</option>";
        newParameterHtml += "               <option value=\"double\">DOUBLE</option>";
        newParameterHtml += "               <option value=\"string\">STRING</option>";
        newParameterHtml += "           </select>";
        newParameterHtml += "        </div>";
        newParameterHtml += "        <div class=\"col-xs-1\">";
        newParameterHtml += "            <button type=\"button\" class=\"removeParameter btn btn-danger fa fa-minus\" rel-count=\"" + parametercount + "\"></button>";
        newParameterHtml += "        </div>";
        newParameterHtml += "    </div>";
        newParameterHtml += "    <div class=\"form-group\">";
        newParameterHtml += "        <label class=\"col-xs-3 control-label\">Parameter Name:</label>";
        newParameterHtml += "        <div class=\"col-xs-8\">";
        newParameterHtml += "            <input type=\"text\" class=\"txtParameterName form-control\" name=\"paramenterName" + parametercount + "\" />";
        newParameterHtml += "        </div>";
        newParameterHtml += "    </div>";
        newParameterHtml += "</div>";
        $("#lgItems").append(newParameterHtml);
        //add validation to parameter name
        $(".parameters" + parametercount).find(".txtParameterName").rules( "add", {
            noSpace: true,
            required: true,
            maxlength: 50,
            messages: { required: "Parameter name is required",
                        noSpace: "Cannot have a space"}
        });
    });

    $(".content").on("click", ".removeParameter", function () {
        $(".parameters" + $(this).attr("rel-count")).remove();
    });

    $("#frmExtend").submit(function(event){
		event.preventDefault();
		if ($(this).valid()) {
            console.log("run-template");
            RunTemplate();
            $("#btnSubmit").attr("disabled", "disabled");
		}
	});
});