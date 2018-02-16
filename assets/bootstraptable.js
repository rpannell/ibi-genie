const {clipboard} = require('electron');
var currentTable = "";
var tableFields = [];
var fieldCnt = 0;
function escapeHtml(text) {
    var div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}

function htmlDecode(input){
  var doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}

function GetDataUlr(){
    var url = "";
    var area = $("#txtArea").val();
    var controller = $("#txtController").val();
    var action = $("#txtAction").val();

    return (area != "" ? ("/" + area) : "") + (controller != "" ? ("/" + controller) : "") + (action != "" ? ("/" + action) : "")
}

function GetAdvancedSearchSpacing(str){
    if($("#chkAdvancedSearch").is(":checked")){
        return "                    " + str + "\n";
    }

    return str + "\n";
}

function CreateTable(){
    var data = "";
    var displayBooleanFormatter = false;

    for(var i = 0; i < tableFields.length; i++){
        if(tableFields[i].Boolean){
            displayBooleanFormatter = true;
        }
    }
    if($("#chkAdvancedSearch").is(":checked")){
        data += "<section id=\"widget-grid\">" + "\n";
        data += "   <div class=\"col-xs-12\" style=\"margin-top:20px;\">" + "\n";
        data += "       <div class=\"jarviswidget jarviswidget-color-blueDark\" id=\"wid-id-" + $("#txtTableId").val() + "\" data-widget-colorbutton=\"false\" data-widget-editbutton=\"false\" data-widget-togglebutton=\"false\" data-widget-deletebutton=\"false\">" + "\n";
        data += "           <header><h2>Master List</h2></header>" + "\n";
        data += "           <div>" + "\n";
        data += "               <div class=\"widget-body\">" + "\n";
        data += "                   <div class=\"widget-body-toolbar\">" + "\n";
        data += "                       <div class=\"panel-group smart-accordion-default\" id=\"divAdvSearch\">" + "\n";
        data += "                           <div class=\"panel panel-default\">" + "\n";
        data += "                               <div class=\"panel-heading\"><h4 class=\"panel-title\"><a data-toggle=\"collapse\" data-parent=\"#divAdvSearch\" href=\"#divAdvSearchInfo\" aria-expanded=\"false\" class=\"collapsed\"> <i class=\"fa fa-lg fa-angle-down pull-right\"></i> <i class=\"fa fa-lg fa-angle-up pull-right\"></i><span> <i class=\"fa fa-search\"></i> </span>Advanced Search</a></h4></div>" + "\n";
        data += "                               <div id=\"divAdvSearchInfo\" class=\"panel-collapse collapse\" aria-expanded=\"false\" style=\"height: 0px;\">" + "\n";
        data += "                                   <div class=\"panel-body\">" + "\n";
        data += "                                       <div class=\"smart-form\">" + "\n";
        data += "                                           <div class=\"row\">" + "\n";
        data += "                                               <section class=\"col col-12\">" + "\n";
        data += "                                                   <label class=\"label\">Search:</label>" + "\n";
        data += "                                                   <label class=\"input\"><input type=\"text\" class=\"form-control\" id=\"txtSearchValue\" /></label>" + "\n";
        data += "                                               </section>" + "\n";
        data += "                                           </div>" + "\n";
        data += "                                       </div>" + "\n";
        data += "                                   </div>" + "\n";
        data += "                                   <div class=\"panel-footer text-right\">" + "\n";
        data += "                                       <button type=\"button\" id=\"btnResetSearch\" class=\"btn btn-labeled btn-primary\"><span class=\"btn-label\"><i class=\"glyphicon glyphicon-remove\"></i></span>Reset</button>" + "\n";
        data += "                                       <button type=\"button\" id=\"btnSearch\" class=\"btn btn-labeled btn-primary\"> <span class=\"btn-label\"><i class=\"glyphicon glyphicon-search\"></i></span>Search</button>" + "\n";
        data += "                                   </div>" + "\n";
        data += "                               </div>" + "\n";
        data += "                           </div>" + "\n";
        data += "                       </div>" + "\n";
        data += "                   </div>" + "\n";
    }
    data += GetAdvancedSearchSpacing("<div class=\"well col-xs-12\" style=\"margin-bottom:20px;\">");
    if($("#chkToolbar").is(":checked")){
        data += GetAdvancedSearchSpacing("   <div id=\"custom-toolbar\">");
        data += GetAdvancedSearchSpacing("       <button class=\"btn btn-primary\" id=\"btnNew\" style=\"margin-bottom: 10px;margin-top: 10px;\">");
        data += GetAdvancedSearchSpacing("           <span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\" style=\"margin-right: 5px;\"></span>New");
        data += GetAdvancedSearchSpacing("       </button>");
        data += GetAdvancedSearchSpacing("   </div>");
    }
    data += GetAdvancedSearchSpacing("   <table id=\"" + $("#txtTableId").val() + "\"");
    data += GetAdvancedSearchSpacing("           class=\"table table-striped\"");
    if($("#chkServerSidePaging").is(":checked")){
        data += GetAdvancedSearchSpacing("           data-pagination =\"true\"");
        data += GetAdvancedSearchSpacing("           data-side-pagination=\"server\"");
        data += GetAdvancedSearchSpacing("           data-page-size=\"20\"");
        data += GetAdvancedSearchSpacing("           data-url=\"" + GetDataUlr() + "\"");
    }
    if($("#chkToolbar").is(":checked")){
        data += GetAdvancedSearchSpacing("           data-toolbar=\"#custom-toolbar\"");
    }
    if($("#chkSearch").is(":checked")){
        data += GetAdvancedSearchSpacing("           data-search=\"true\"");
    }
    if($("#chkExport").is(":checked")){
        data += GetAdvancedSearchSpacing("           data-show-export=\"true\"");
    }
    if($("#chkShowColumns").is(":checked")){
        data += GetAdvancedSearchSpacing("           data-show-columns=\"true\"");
    }
    if($("#chkRefresh").is(":checked")){
        data += GetAdvancedSearchSpacing("           data-show-refresh=\"true\"");
    }        
    if($("#chkDetails").is(":checked")){
        data += GetAdvancedSearchSpacing("           data-detail-view=\"true\"");
        data += GetAdvancedSearchSpacing("           data-detail-formatter=\"DetailFormatter\"");
    }        
    data += GetAdvancedSearchSpacing("           data-query-params=\"SearchParams\"");
    data += GetAdvancedSearchSpacing("           data-toggle=\"table\">");
    data += GetAdvancedSearchSpacing("       <thead>");
    data += GetAdvancedSearchSpacing("           <tr>");
    for(var i = 0; i < tableFields.length; i++){
        var field = tableFields[i];
        data += GetAdvancedSearchSpacing("               <th" + (field.Sortable ? " data-sortable=\"true\"" : "") + (field.Searchable ? " data-search=\"true\"" : "") + (field.Boolean ? " data-formatter=\"booleanFormatter\"" : "") + " data-valign=\"middle\" data-halign=\"center\" data-field=\"" + field.FieldName  + "\">" + field.ColumnName + "</th>");
    }
    if($("#chkOperations").is(":checked")){
        data += GetAdvancedSearchSpacing("               <th data-halign=\"center\" data-align=\"center\" data-valign=\"middle\" data-field=\"Actions\" data-formatter=\"OperateFormatter\" data-events=\"operateEvents\">Actions</th>");
    }
    data += GetAdvancedSearchSpacing("           </tr>");
    data += GetAdvancedSearchSpacing("       </thead>");
    data += GetAdvancedSearchSpacing("   </table>");
    data += GetAdvancedSearchSpacing("</div>");

    if($("#chkAdvancedSearch").is(":checked")){
        data += "               </div>" + "\n";
        data += "           </div>" + "\n";
        data += "       </div>" + "\n";
        data += "   </div>" + "\n";
        data += "</section>" + "\n";
    }
    
    data += "@section scripts{" + "\n";
    data += "   <script>" + "\n";
    data += "       //Used to alter search params before sending data to the controller." + "\n";
    data += "       function SearchParams(params) {" + "\n";
    data += "           return params;" + "\n";
    data += "       }" + "\n";
    if(displayBooleanFormatter){
        data += "       function booleanFormatter(value, row, index) {" + "\n";
        data += "        return value" + "\n";
        data += "                   ? [\"<span class=\"label label-primary\"><span class=\"fa fa-check\"></span></span>\"].join('')" + "\n";
        data += "                   : return [\"\"].join('');" + "\n";
        data += "       }" + "\n";
    }

    if($("#chkDetails").is(":checked")){
        data += "       //Used to display data when a row is expanded." + "\n";
        data += "       function DetailFormatter(index, row, element) {" + "\n";
        data += "           return \"<div id='detailSource-\" + index + \"'></div>\";" + "\n";
        data += "       }" + "\n";
    }
    if($("#chkOperations").is(":checked")){
        data += "       var operateEvents = {" + "\n";
        data += "           'click .edit_btn': function (e, value, row, index) {" + "\n";
        data += "               //EDIT BUTTON FUNCTION GOES HERE" + "\n";
        data += "           }," + "\n";
        data += "           'click .delete_btn': function (e, value, row, index) {" + "\n";
        data += "               //DELETE BUTTON FUNCTION GOES HERE" + "\n";
        data += "           }" + "\n";
        data += "           //MORE CLICK ACTION CAN BE DETECTED HERE" + "\n";
        data += "       };" + "\n";
        data += "       function OperateFormatter(index, row, element) {" + "\n";
        data += "           return [" + "\n";
        data += "               '<div class=\"btn-group\">' +" + "\n";
        data += "                   '<button type=\"button\" class=\"btn btn-default edit_btn\">Edit</button>' +" + "\n";
        data += "                   '<button type=\"button\" class=\"btn btn-default delete_btn\">Delete</button>' +" + "\n";
        data += "                   //MORE CAN BE ADDED HERE" + "\n";
        data += "               '</div>'" + "\n";
        data += "           ].join('');" + "\n";
        data += "       }" + "\n";
    }

    data += "       $(document).ready(function () {" + "\n";
    if($("#chkAdvancedSearch").is(":checked")){
        data += "           $(\"#btnResetSearch\").click(function () {" + "\n";
        data += "               //Add the code to reset the search" + "\n";
        data += "               IBI.UI.SetTextBoxValue(\"txtSearchValue\", \"\");" + "\n";
        data += "               IBI.BootstrapTable.Refresh(\"" + $("#txtTableId").val() + "\");" + "\n";
        data += "           });" + "\n";
        data += "           $(\"#btnSearch\").click(function () {" + "\n";
        data += "               IBI.BootstrapTable.Refresh(\"" + $("#txtTableId").val() + "\");" + "\n";
        data += "           });" + "\n";
    }
    if($("#chkDetails").is(":checked")){
        data += "           $('#" + $("#txtTableId").val() +  "').on('expand-row.bs.table', function (index, row, $detail) {" + "\n";
        data += "               //Call the plugin action to get a partial view of the detail data" + "\n";
        data += "               //$.get(url, function(partialView){" + "\n";
        data += "               //  IBI.UI.ClearHtml(\"detailSource-\" + index + \");" + "\n";
        data += "               //  IBI.UI.SetHtml(\"detailSource-\" + index + \", partialView);" + "\n";
        data += "               //});" + "\n";
        data += "           });" + "\n";
    }
    data += "       });" + "\n";
    data += "   </script>" + "\n";
    data += "}" + "\n";
    //data += "" + "\n";
    $("#codeBlock").empty();
    $("#codeBlock").html(escapeHtml(data));
    $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
    });
    currentTable = data;
}

require("./js/highlight.pack.js");
$(document).ready(function () {
    $("#btnTemplateOptions").click(function () {
        $(".content").load("options.html");
    });

    $('ul.tabs').tabs();
    CreateTable();
    $("input").change(function(){ CreateTable(); });
    $('.tooltipped').tooltip({delay: 50});
    $("#btnClip").click(function(){ clipboard.writeText(currentTable); });
    $("#btnAddField").click(function(){
        $("#txtFieldName").val("");
        $("#txtColumnName").val("");
        $("#chkSortableField").removeAttr("checked");
        $("#chkSearchableField").removeAttr("checked");
        $("#chkBooleanFormatter").removeAttr("checked");
        $('#mdlAddField').modal('open');
    });

    $("#btnAddNewField").click(function(){
        $('#mdlAddField').modal('close');
        var newField = {
            Id: fieldCnt, //used as a primary key
            FieldName: $("#txtFieldName").val(),
            ColumnName: $("#txtColumnName").val(),
            Searchable: $("#chkSearchableField").is(":checked"),
            Sortable: $("#chkSortableField").is(":checked"),
            Boolean:  $("#chkBooleanFormatter").is(":checked"),
        };
        tableFields.push(newField);
        var newLi = "<li class=\"collection-item removeField avatar\" rel-id=\"" + newField.Id + "\">";
        newLi += "<span class=\"title\">Column Name: " + newField.ColumnName + "</span>";
        newLi += "<p>Field: " + newField.FieldName + "<br/>";
        newLi += "Searchable: " + (newField.Searchable ? "Yes" : "No") + "<br/>";
        newLi += "Sortable: " + (newField.Sortable ? "Yes" : "No") + "<br/>";
        newLi += "Boolean: " + (newField.Boolean ? "Yes" : "No") + "</p>";
        newLi += "<a href=\"#!\" class=\"secondary-content btn waves-effect waves-light red\">";
        newLi += "  <i class=\"material-icons fa fa-minus\"></i>";
        newLi += "</a>";
        newLi += "</li>";
        $("#tblFields").append(newLi);
        fieldCnt++;
        //update the html
        CreateTable();
    });

    $(".content").on("click", ".removeField", function () {
        var fieldId = $(this).attr("rel-id");
        for(var i = 0; i < tableFields.length; i++){
            if(tableFields[i].Id == fieldId){
                tableFields.splice(i, 1);
            }
        }
        $(this).remove();
        //update the html
        CreateTable();
    });

    //set all of the modals to be a materialize-css modal
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
});