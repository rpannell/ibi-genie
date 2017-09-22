const express = require('express');
const pluginRouter = express.Router();
const bodyParser = require('body-parser');
const elecConfig = require("electron-config");
const mssql = require('mssql');
pluginRouter.use(bodyParser.urlencoded({ extended: true }));
pluginRouter.use(bodyParser.json());
var config = require('../../assets/config').GetDatabaseConnection();
var cacheController = require('./RedisController');

pluginRouter.get('/', function (req, res) {
	mssql.close();
	mssql.connect(config).then(pool => {
		return pool.request()
		.query("SELECT PluginId ,PluginDescription, PluginName ,IsInstalled ,RoleCount, GroupCount, MemberCount FROM IBIWebFramework.dbo.vwPluginInfo ORDER BY PluginName");
	}).then(result => { res.send(result.recordset); })
	  .catch(err => { res.send(""); })
});

pluginRouter.get('/GetByName/:name', function (req, res) {
	mssql.close();
	mssql.connect(config).then(pool => {
		return pool.request()
		.query("SELECT TOP 1 PluginId FROM IBIWebFramework.dbo.vwPluginInfo WHERE PluginName = '" + req.params.name + "'");
	}).then(result => { res.send(result.recordset); })
	  .catch(err => { res.send(""); })
});

pluginRouter.get('/GetByAreaName/:name', function (req, res) {
	mssql.close();
	mssql.connect(config).then(pool => {
		return pool.request()
		.query("SELECT TOP 1 PluginId FROM IBIWebFramework.dbo.Plugins WHERE IsExternal = 0 AND AreaRoutePrefix = '" + req.params.name + "'");
	}).then(result => { res.send(result.recordset); })
	  .catch(err => { res.send(""); })
});

pluginRouter.get('/:id', function (req, res) {
	var query = "SELECT * FROM IBIWebFramework.dbo.Plugins WHERE PluginId = " + req.params.id;
	mssql.close();
	mssql.connect(config).then(pool => {
		return pool.request().query(query);
	}).then(result => { res.send(result.recordset); })
	  .catch(err => { console.log(err); res.send(""); })
});

pluginRouter.put('/:id', function (req, res) {
	var query = "UPDATE IBIWebFramework.dbo.Plugins SET ";
	query += "Description = '" + req.body.Description + "', ";
	query += "Name = '" + req.body.Name + "', ";
	query += "CssIcon = '" + req.body.CssIcon + "', ";
	query += "Category = '" + req.body.Category + "', ";
	query += "IsInstalled = " + req.body.IsInstalled + ", ";
	query += "TrainingVideoURL = '" + req.body.TrainingVideoURL + "', ";
	query += "IsExternal = " + req.body.IsExternal + ", ";
	query += "MainUrl = '" + req.body.MainUrl + "', ";
	query += "AreaRoutePrefix = '" + req.body.AreaRoutePrefix + "', ";
	query += "ShowInHome = " + req.body.ShowInHome + ", ";
	query += "SortIndex = " + req.body.SortIndex + ", ";
	query += "DisplayName = '" + req.body.DisplayName + "', ";
	query += "OutputDirectoryName = '" + req.body.OutputDirectoryName + "', ";
	query += "AnonymousRole = '" + req.body.AnonymousRole + "' ";
	query += "WHERE PluginId = " + req.body.PluginId;
	mssql.close();
	mssql.connect(config).then(pool => {
		return pool.request().query(query);
	}).then(result => { cacheController.removeAllPlugins(); res.send(""); })
	  .catch(err => { console.log(err); res.send(""); })
});

pluginRouter.post('/', function (req, res) {
	var query = "INSERT INTO IBIWebFramework.dbo.Plugins(Description,Name,CssIcon,Category,IsInstalled,TrainingVideoURL,IsExternal,MainUrl,AreaRoutePrefix,ShowInHome,SortIndex,DisplayName,OutputDirectoryName,AnonymousRole) VALUES (";
	query += "'" + req.body.Description + "', ";
	query += "'" + req.body.Name + "', ";
	query += "'" + req.body.CssIcon + "', ";
	query += "'" + req.body.Category + "', ";
	query += "" + req.body.IsInstalled + ", ";
	query += "'" + req.body.TrainingVideoURL + "', ";
	query += "" + req.body.IsExternal + ", ";
	query += "'" + req.body.MainUrl + "', ";
	query += "'" + req.body.AreaRoutePrefix + "', ";
	query += "" + req.body.ShowInHome + ", ";
	query += "" + req.body.SortIndex + ", ";
	query += "'" + req.body.DisplayName + "', ";
	query += "'" + req.body.OutputDirectoryName + "', ";
	query += "'" + req.body.AnonymousRole + "' ";
	query += ")";
	mssql.close();
	mssql.connect(config).then(pool => {
		return pool.request().query(query);
	}).then(result => { cacheController.removeAllPlugins();  res.send(""); })
	  .catch(err => { res.send(""); })
});


module.exports = pluginRouter;