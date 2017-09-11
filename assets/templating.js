require('jquery-validation');
$(document).ready(function () {
    var templateConfig = ipcRenderer.sendSync('get-config');
	
	$("#txtName").change(function(){
		var value = $("#txtName").val();
		$("#txtDatabaseName").val(value);
	});
	
	$('input[type=radio][name=pluginType]').change(function() {
        if (this.value == 'NA') {
            $(".dvPluginInfo").addClass("hidden");
        } else {
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
				CoreExternalPlugin: $("#coreExternalPlguin").is(":checked"),
				StandardService: $("#standardService").is(":checked"),
				CoreService: $("#coreService").is(":checked"),
				CreateMaster: $("#standardService").is(":checked") || $("#coreService").is(":checked"),
				WebServiceUrl: $("#txtWebServiceURL").val(),
				webServiceTestUrl: $("#txtTestWebServiceURL").val(),
				webServiceProdUrl: $("#txtProdWebServiceURL").val(),
			};

			var answer = ipcRenderer.sendSync('run-templates', config);
			if(answer == "saved"){ 
				$(".content").load("home.html");
			}
		}
	});
});