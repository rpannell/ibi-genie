

/*
 * Used to set a string to title case
 */
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};



String.prototype.titlecase = function (lang, withLowers = false) {
    var i, string, lowers, uppers;

    string = this.replace(/([^\s:\-'])([^\s:\-']*)/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }).replace(/Mc(.)/g, function (match, next) {
        return 'Mc' + next.toUpperCase();
    });

    if (withLowers) {
        if (lang == 'EN') {
            lowers = ['A', 'An', 'The', 'At', 'By', 'For', 'In', 'Of', 'On', 'To', 'Up', 'And', 'As', 'But', 'Or', 'Nor', 'Not'];
        }
        else {
            lowers = ['Un', 'Une', 'Le', 'La', 'Les', 'Du', 'De', 'Des', 'À', 'Au', 'Aux', 'Par', 'Pour', 'Dans', 'Sur', 'Et', 'Comme', 'Mais', 'Ou', 'Où', 'Ne', 'Ni', 'Pas'];
        }
        for (i = 0; i < lowers.length; i++) {
            string = string.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'), function (txt) {
                return txt.toLowerCase();
            });
        } t
    }

    uppers = ['Id', 'R&d'];
    for (i = 0; i < uppers.length; i++) {
        string = string.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'), uppers[i].toUpperCase());
    }

    return string;
}

/*
 * String manipulation functions
 */
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) == str;
    };
}

if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (str) {
        return this.slice(-str.length) == str;
    };
}

const electron = require('electron');
const express = require('express');
const mssql = require('mssql');
const app = electron.app
const webApi = express();
const path = require('path');
const fs = require('fs');
const jsonfile = require('jsonfile');
var elecConfig = require("electron-config");
var tfs = require('../assets/tfs-unlock');
var config = new elecConfig();
tfs.init({
	"visualStudioPath": tfs.vs2017.bit64
});
/*
 * Used to help with the body of a web-api call
 */
var bodyParser = require('body-parser')
webApi.use(bodyParser.json());       // to support JSON-encoded bodies
webApi.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

webApi.use('/api/Plugins', require('./Controllers/PluginsController'));
webApi.use('/api/PluginRoles', require('./Controllers/PluginRolesController'));
/*
 * Get the config information and set it to the 
 * default information if it's not set
 */ 
var config = require('../assets/config').GetDatabaseConnection();

/*
 * Get the list of SQL Server databases from a databas server
 */
webApi.get('/', function (req, res) {
    mssql.close();
    mssql.connect(config).then(pool => {
        return pool.request()
            .query("SELECT name AS DatabaseName from sys.databases ORDER BY name");
    }).then(result => {
        res.send(result.recordset);
    }).catch(err => {
        res.send("");
    })
});



webApi.get('/GetPropertyType', function (req, res) {
    res.send([
		{value: "int", text: "int"},
		{value: "int?", text: "int?"},
		{value: "bool", text: "bool"},
		{value: "bool?", text: "bool?"},
		{value: "byte[]", text: "byte[]"},
		{value: "DateTime", text: "DateTime"},
		{value: "DateTime?", text: "DateTime?"},
		{value: "decimal", text: "decimal"},
		{value: "decimal?", text: "decimal?"},
		{value: "double", text: "double"},
		{value: "double?", text: "double?"},
		{value: "float", text: "float"},
		{value: "float?", text: "float?"},
		{value: "Guid", text: "Guid"},
		{value: "long", text: "long"},
		{value: "long?", text: "long?"},
		{value: "short", text: "short"},
		{value: "short?", text: "short?"},
		{value: "string", text: "string"}
	]);
});

webApi.get('/GetSearchType', function (req, res) {
    res.send([
		{value: "None", text: "None"},
		{value: "Equal", text: "Equal"},
		{value: "Not Equal", text: "Not Equal"},
		{value: "Contains", text: "Contains"},
		{value: "Starts With", text: "Starts With"},
		{value: "Ends With", text: "Ends With"},
		{value: "Greater Than", text: "Greater Than"},
		{value: "Greater Than or Equal", text: "Greater Than or Equal"},
		{value: "Less Than", text: "Less Than"},
		{value: "Less Than or Equal", text: "Less Than or Equal"},
	]);
});

webApi.get('/GetYesNo', function (req, res) {
	///
	/// True = 1 and False = 0
	///
    res.send([
		{value: 1, text: "Yes"},
		{value: 0, text: "No"}
	]);
});

/*
 * Get the tables from a SQL Server database
 */
webApi.post('/GetTables', function (req, res) {
    var db = req.body.DatabaseName;
    mssql.close();
    mssql.connect(config).then(pool => {
        return pool.request().query("SELECT TABLE_SCHEMA + '.' + TABLE_NAME AS TableName FROM " + db + ".INFORMATION_SCHEMA.TABLES WHERE TABLE_CATALOG='" + db + "' UNION SELECT TABLE_SCHEMA + '.' + TABLE_NAME AS TableName FROM " + db + ".INFORMATION_SCHEMA.VIEWS WHERE TABLE_CATALOG='" + db + "' ORDER BY TableName");
    }).then(result => {
        res.send(result.recordset);
    }).catch(err => {
        console.log(err);
        res.send("");
    })
});

/*
 * Get the data from the scaffoldinginfo.json file 
 * from a service
 */
webApi.post('/GetCurrentJson', function (req, res) {
	var currLoc = req.body.CurrentLocation;
	var realPath = path.join(currLoc, "scaffoldinginfo.json");
	if(fs.existsSync(realPath)){
		var scaffoldingObject = jsonfile.readFileSync(realPath);
		res.send(scaffoldingObject);
	} else {
		res.send({});
	}
});

/*
 * Write the data to the scaffoldinginfo.json for a service
 */
webApi.post('/SetJson', function (req, res) {
	var currLoc = req.body.CurrentLocation;
	var updatedData = req.body.JsonData;
    var realPath = path.join(currLoc, "scaffoldinginfo.json");
    var files = [];
    files.push(realPath);
    var stats = fs.statSync(realPath);
    if(stats["mode"] & 2){
        //file is already writable
        jsonfile.writeFileSync(realPath, JSON.parse(updatedData), {spaces: 2, flag : 'w'})
    } else {
        tfs.checkout(files).then(function(){
            jsonfile.writeFileSync(realPath, JSON.parse(updatedData), {spaces: 2, flag : 'w'})
        });
    }      
});

/*
 * Get the information about a table based on the database name, table name and schema
 */
webApi.post('/GetTableInfo', function (req, res) {
    var db = req.body.DatabaseName;
    var tbl = req.body.TableName
    var sch = req.body.Schema;
    mssql.close();
    mssql.connect(config).then(pool => {
        return pool.request()
            .query("SELECT COLUMN_NAME ColumnName,DATA_TYPE DataType, IS_NULLABLE IsNullable, ORDINAL_POSITION Position, CHARACTER_MAXIMUM_LENGTH MaxLength FROM " + db + ".INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + tbl + "' AND TABLE_SCHEMA = '" + sch + "'")
    }).then(result => {
        var endResult = [];
        for (var i = 0; i < result.recordset.length; i++) {
            var columninfo = result.recordset[i];
            var data = {
                ColumnName: columninfo.ColumnName,
                DataType: columninfo.DataType,
                IsNullable: columninfo.IsNullable == "NO" ? true : false,
                PropertyName: ToPascalCase(columninfo.ColumnName),
                Ordinal: columninfo.Position,
                IsPrimaryKey: columninfo.Position == 1 ? true : false,
                PropertyType: DatabaseTypeToSystemType(columninfo.DataType, columninfo.IsNullable == "NO" ? false : true),
				Ignore: false,
				IsInsertOnly: false,
				IsAutoComplete: false,
				Search: "None",
				MaxLength: columninfo.MaxLength != null && columninfo.MaxLength == -1 ? "MAX" : columninfo.MaxLength
            };
            endResult.push(data);
        }
        res.send({
            EntityPropertyName: ToPascalCase(tbl.replace("vw", "")),
            TableColums: endResult
        });
    }).catch(err => {
        console.log(err);
        res.send("");
    })
});

/// Starts the web api service
app.on('ready', function () {
    webApi.listen(3000, function () { });
})

/// Converts a string to PascalCase
/// RGP - 09/15/2017
function ToPascalCase(input) {
    var rtn = "";
    if (input.includes("_")) {
        var splitstring = input.split("_");
        for (var i = 0; i < splitstring.length; i++) {
            rtn = rtn + splitstring[i].titlecase("EN");
        }
    } else {
        rtn = input;
    }

    return rtn.replaceAll(" ", "");
}

/// Converts the database type to a C# type
/// RGP - 09/15/2017
function DatabaseTypeToSystemType(datatype, isNullable) {
    var rtnString = "string";

    if (datatype == "int") {
        rtnString = isNullable ? "int?" : "int";
    }
	else if (datatype == "smallint" || datatype == "tinyint") {
        rtnString = isNullable ? "short?" : "short";
    }
    else if (datatype == "datetime" || datatype == "date" || datatype == "datetime2" || datatype == "smalldatetime") {
        rtnString = isNullable ? "DateTime?" : "DateTime";
    }
    else if (datatype == "bit") {
        rtnString = isNullable ? "bool?" : "bool";
    }
    else if (datatype == "varbinary") {
        rtnString = "byte[]";
    }
    else if (datatype == "float") {
        rtnString = isNullable ? "double?" : "double";
    }
	else if (datatype == "money" || datatype == "smallmoney" || datatype == "decimal" || datatype == "numeric") {
        rtnString = isNullable ? "decimal?" : "decimal";
    }
    else if (datatype == "uniqueidentifier") {
        rtnString = isNullable ? "Guid?" : "Guid";
    }
    else if (datatype == "bigint") {
        rtnString = isNullable ? "long?" : "long";
    }
    return rtnString;
}