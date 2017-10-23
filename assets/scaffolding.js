// You can also require other files to run in this process
var configInfo = require('./config');
const {ipcRenderer} = require('electron');
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.clearNull = function() {
    return target == undefined || target == null ? "" : target;
};

function ucFirstAllWords( str )
{
	str = str.replace(/([a-z])([A-Z])/g, '$1 $2');
    str = str.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
	str = str.replaceAll("_", " ");
	var pieces = str.split(" ");
	for ( var i = 0; i < pieces.length; i++ )
	{
		var j = pieces[i].charAt(0).toUpperCase();
		pieces[i] = j + pieces[i].substr(1).toLowerCase();
	}
	var finish = pieces.join(" ");
	return finish.replaceAll(" ", "").trim();
}

function LoadDatabases(currentServiceData){
	if($('#dlDatabase option').length == 1){
		jQuery.get("http://localhost:3000/", function (data) {
			for (var i = 0; i < data.length; i++) {
				$("#dlDatabase").append($("<option></option>").attr("value", data[i].DatabaseName).text(data[i].DatabaseName));
			}
			$('select').material_select();
			
			//set the value to the current value from the current service data
			if(currentServiceData != undefined && currentServiceData != null && currentServiceData.DatabaseName != undefined && currentServiceData.DatabaseName != null && currentServiceData.DatabaseName != ""){
				$("#dlDatabase").val(currentServiceData.DatabaseName);
				LoadTables();

			}
		});
	}
}

function LoadTables(){
	$("#dlTable").empty();
//	$("#dlTable").append($("<option></option>").attr("value", "").text("-- Select Table --"));
	jQuery.ajax({
		type: "POST",
		url: "http://localhost:3000/GetTables",
		contentType: 'application/json; charset=utf-8',
		dataType: "json",
		data: JSON.stringify({ DatabaseName: $("#dlDatabase").val() }),
		success: function (data) {
			for (var i = 0; i < data.length; i++) {
				$("#dlTable").append($("<option></option>").attr("value", data[i].TableName).text(data[i].TableName));
			}
			$("#dvTables").removeClass("hidden")
			$('select').material_select();
			
		},
		traditional: true
	});
}

function ClearEntityInfo(){
	$("#chkReadOnly").prop('checked', false);
	$('#tblEntityInfo').bootstrapTable('removeAll');
	$("#txtEntityName").val("");
	$("#hdTableName").val("");
	$("#hdSchema").val("");
	$("#dlTable").val("");
}

function WriteJsonFile(fileData, currentlocation){
	jQuery.ajax({
		type: "POST",
		url: "http://localhost:3000/SetJson",
		contentType: 'application/json; charset=utf-8',
		dataType: "json",
		data: JSON.stringify({ CurrentLocation: currentlocation,
							   JsonData: JSON.stringify(fileData) }),
		success: function (data) {
		},
		traditional: true
	});
}

function UpdateScaffoldJsonInfo(currentServiceData, entity){
	var entityInfo = {
		"TableName": entity.TableName,
		"EntityName": entity.PropertyName,
		"Schema": entity.Schema,
		"Properties": []
	};
	
	for(var i = 0; i < entity.Columns.length; i++){
		var column = entity.Columns[i];
		entityInfo.Properties.push({
			"DatabaseColumn": column.ColumnName,
			"DatabaseProperty": column.DataType,
			"Ignore": column.Ignore,
			"IsAutoComplete": column.IsAutoComplete,
			"IsNullable": column.IsNullable,
			"IsPrimary": column.IsPrimaryKey,
			"PropertyName": column.PropertyName,
			"PropertyType": column.PropertyType,
			"SearchType": column.Search,
			"IsInsertOnly": column.IsInsertOnly,
			"MaxLength": column.MaxLength
		});
	}
	
	for(var j = 0; j < currentServiceData.CurrentEntitiesInfo.length; j++){
		if(currentServiceData.CurrentEntitiesInfo[j].EntityName == entity.PropertyName){
			currentServiceData.CurrentEntitiesInfo.splice(j, 1);
			break;
		}
	}

	currentServiceData.CurrentEntitiesInfo.push(entityInfo);
	currentServiceData.DatabaseName = $("#dlDatabase").val();
}

function GetEntityFromJsonData(currentServiceData, entityName){
	var currentInfo = null;
	for(var j = 0; j < currentServiceData.CurrentEntitiesInfo.length; j++){
		if(currentServiceData.CurrentEntitiesInfo[j].EntityName == entityName){
			currentInfo = currentServiceData.CurrentEntitiesInfo[j];
			break;
		}
	}
	
	if(currentInfo != null){
		
	}
	
	return null;
}

$(document).ready(function () {
	if(!configInfo.IsValid() || !configInfo.IsServiceSetup()){
		$("#dvAlert").removeClass("hidden");
	}
	
	var currentServiceData = {};
	var entityInfo = [];
	var currentConfig = configInfo.GetConfig();
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
	
	$("#table").bootstrapTable();
	$("#tblEntityInfo").bootstrapTable();
	
	jQuery.ajax({
		type: "POST",
		url: "http://localhost:3000/GetCurrentJson",
		contentType: 'application/json; charset=utf-8',
		dataType: "json",
		data: JSON.stringify({ CurrentLocation: configInfo.GetServiceSourceLocation() }),
		async: false,  //make sure we at least get the file and see
		success: function (data) {
			currentServiceData = data;
			if(currentServiceData.CurrentEntitiesInfo == undefined || currentServiceData.CurrentEntitiesInfo == null){
				currentServiceData = {
					"CurrentEntitiesInfo": [ ],
					"DatabaseName": "",
					"DatabaseUser": configInfo.GetDatabaseUser(),
					"DatabaseUserPassword": configInfo.GetDatabasePassword(),
					"IsWindowsAuth": false,
					"ServerName": configInfo.GetDatabaseName()
				}
			}
		},
		traditional: true
	});
	
	$("#btnScaffoldOptions").click(function () { $(".content").load( "options.html" ); });
	$("#btnAddEntity").click(function(){
		$('#mdlAdd').modal('open')
		LoadDatabases(currentServiceData);
	});
	
	$("#dlDatabase").change(function () {
		LoadTables();
	});
	
	$("#dlTable").change(function () {
		var databaseTableName = $(this).val().split(".", 2);
		$("#hdSchema").val(databaseTableName[0]);
		$("#hdTableName").val(databaseTableName[1]);
		$("#txtEntityName").val(ucFirstAllWords(databaseTableName[1]));
		Materialize.updateTextFields();
			
	});
	
	$("#btnGo").click(function(){
		jQuery.ajax({
			type: "POST",
			url: "http://localhost:3000/GetTableInfo",
			contentType: 'application/json; charset=utf-8',
			dataType: "json",
			data: JSON.stringify({ DatabaseName: $("#dlDatabase").val(), TableName: $("#hdTableName").val(), Schema: $("#hdSchema").val() }),
			success: function (data) {
				var databaseInformation = data.TableColums;
				console.log("DB INFO:");
				console.log(databaseInformation);
				var currentEntityInfoFromScaffoldingFile = null;
				if(currentServiceData.CurrentEntitiesInfo != undefined && currentServiceData != null){
					for(var i = 0; i < currentServiceData.CurrentEntitiesInfo.length; i++){
						if(currentServiceData.CurrentEntitiesInfo[i].EntityName == $("#txtEntityName").val()){
							currentEntityInfoFromScaffoldingFile = currentServiceData.CurrentEntitiesInfo[i];
						}
					}
				}
				
				if(currentEntityInfoFromScaffoldingFile != null){
					for(var i = 0; i < databaseInformation.length; i++){
						for(var j = 0; j < currentEntityInfoFromScaffoldingFile.Properties.length; j++){
							var property = currentEntityInfoFromScaffoldingFile.Properties[j];
							if(databaseInformation[i].ColumnName == property.DatabaseColumn){
								databaseInformation[i].IsNullable = property.IsNullable;
								databaseInformation[i].PropertyName = property.PropertyName;
								databaseInformation[i].IsPrimaryKey = property.IsPrimary;
								databaseInformation[i].PropertyType = property.PropertyType;
								databaseInformation[i].Ignore = property.Ignore;
								databaseInformation[i].IsInsertOnly = property.IsInsertOnly != undefined ? property.IsInsertOnly : false;
								databaseInformation[i].IsAutoComplete = property.IsAutoComplete != undefined ? property.IsAutoComplete : false;
								databaseInformation[i].Search = property.SearchType;
								databaseInformation[i].MaxLength = property.MaxLength != undefined ? property.MaxLength : databaseInformation[i].MaxLength;
								break;
							}
						}
					}
				} 
				
				$('#tblEntityInfo').bootstrapTable('load', databaseInformation)
			},
			traditional: true
		});
	});
	
	$("#btnCancel").click(function(){
		ClearEntityInfo();
		$('#mdlAdd').modal('close')
	});
	
	$("#btnAddNewEntity").click(function(){
		var columnData = $("#tblEntityInfo").bootstrapTable('getData', true);
		var tableInfo = {
			PropertyName: $("#txtEntityName").val(),
			TableName: $("#hdTableName").val(),
			Schema: $("#hdSchema").val(),
			IsReadOnly: $("#chkReadOnly").prop('checked'),
			Columns: columnData
		}
		
		 for(var i = 0; i < entityInfo.length; i++){
			var currentEntityInfo = entityInfo[i];
			if(currentEntityInfo.PropertyName == tableInfo.PropertyName){
				entityInfo.splice(i,1);
			}
		 }
		entityInfo.push(tableInfo);
		$('#table').bootstrapTable('load', entityInfo);
		ClearEntityInfo();
		$('#mdlAdd').modal('close');
			$('.dropdown-button').dropdown({
				inDuration: 300,
				outDuration: 225,
				constrainWidth: true, // Does not change width of dropdown to that of the activator
				hover: false, // Activate on hover
				gutter: 0, // Spacing from edge
				belowOrigin: true, // Displays dropdown below the button
				alignment: 'left', // Displays dropdown with edge aligned to the left of button
				stopPropagation: false // Stops event propagation
			  });
	
		
	});
	
	$("#btnWriteScaffolding").click(function(){
		$("#mdlConfirm").modal('open')
	});
	
	$("#btnOk").click(function(){
		$('#mdlConfirm').modal('close');
		var answer = ""
		var data = entityInfo;
		var args = {
			ProjectName: configInfo.GetCurrentService(),
			ServiceLocation: configInfo.GetCurrentServiceLocation(),
			PluginName: configInfo.GetCurrentPlugin(),
			PluginLocation: configInfo.GetPluginSourceLocation(),
			ApplicationName: configInfo.GetCurrentApplication(),
			ApplicationLocation: configInfo.GetApplicationSourceLocation(),
			AddToPlugin: $("#chkScaffoldPlugin").prop('checked'),
			Entities: []
		};
		
		for(var i = 0; i < data.length; i++){	
			var entity = data[i];
			//set the primary key
			var pk = "int";
			var pkname = "";
			for(var j = 0; j < entity.Columns.length; j++){
				if(entity.Columns[j].IsPrimaryKey){
					pk = entity.Columns[j].PropertyType.replace("?", "");
					entity.Columns[j].PropertyType = pk;
					pkname = entity.Columns[j].PropertyName;
				}
				entity.Columns[j].Ignore = (entity.Columns[j].Ignore == "1" ? true : false);
				entity.Columns[j].IsInsertOnly = (entity.Columns[j].IsInsertOnly == "1" ? true : false);
				entity.Columns[j].IsAutoComplete = (entity.Columns[j].IsAutoComplete == "1" ? true : false);
			}
			entity.PrimaryKey = pk;
			entity.PrimaryName = pkname;
			//add this entity to the list of entities to scaffold
			args.Entities.push(entity);
			UpdateScaffoldJsonInfo(currentServiceData, entity);
			WriteJsonFile(currentServiceData, configInfo.GetServiceSourceLocation());
		}
		
		answer = ipcRenderer.sendSync('run-scaffolding', args);	
		if(answer == "saved"){ 
			window.setTimeout(function(){
				$(".content").load("home.html");
			}, 500);
		}
	});
	
	

	$('.modal').modal({
		dismissible: false, // Modal can be dismissed by clicking outside of the modal
		opacity: .5, // Opacity of modal background
		inDuration: 300, // Transition in duration
		outDuration: 200, // Transition out duration
		startingTop: '4%', // Starting top style attribute
		endingTop: '10%', // Ending top style attribute
		ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
		
		},
		complete: function() {
			
		} // Callback for Modal close
	  });
	  $('select').material_select();
});