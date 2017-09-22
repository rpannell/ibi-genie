const express = require('express');
const pluginRolesRouter = express.Router();
const bodyParser = require('body-parser');
const elecConfig = require("electron-config");
const mssql = require('mssql');
pluginRolesRouter.use(bodyParser.urlencoded({ extended: true }));
pluginRolesRouter.use(bodyParser.json());
var config = require('../../assets/config').GetDatabaseConnection();
var cacheController = require('./RedisController');

pluginRolesRouter.get('/', function (req, res) {
	mssql.close();
	mssql.connect(config).then(pool => {
		return pool.request()
		.query("SELECT PluginRoleId ,PluginId, Description FROM IBIWebFramework.dbo.PluginRoles");
	}).then(result => { res.send(result.recordset); })
	  .catch(err => { res.send(""); })
});

pluginRolesRouter.get('/GetByPluginId/:id', function (req, res) {
	var query = "SELECT * FROM IBIWebFramework.dbo.PluginRoles WHERE PluginId = " + req.params.id;
	mssql.close();
	mssql.connect(config).then(pool => {
		return pool.request().query(query);
	}).then(result => { res.send(result.recordset); })
	  .catch(err => { console.log(err); res.send(""); })
});

pluginRolesRouter.post('/GetByPluginIdAndName/:id', function (req, res) {
	var query = "SELECT TOP 1 PluginRoleId FROM IBIWebFramework.dbo.PluginRoles WHERE PluginId = " + req.params.id + " AND Description = '" + req.body.Name + "'";
	mssql.close();
	mssql.connect(config).then(pool => {
		return pool.request().query(query);
	}).then(result => { res.send(result.recordset); })
	  .catch(err => { console.log(err); res.send(""); })
});

pluginRolesRouter.get('/:id', function (req, res) {
	var query = "SELECT * FROM IBIWebFramework.dbo.PluginRoles WHERE PluginRoleId = " + req.params.id;
	mssql.close();
	mssql.connect(config).then(pool => {
		return pool.request().query(query);
	}).then(result => { res.send(result.recordset); })
	  .catch(err => { console.log(err); res.send(""); })
});

pluginRolesRouter.put('/:id', function (req, res) {
	var query = "UPDATE IBIWebFramework.dbo.PluginRoles SET ";
	query += "Description = '" + req.body.Description + "', ";
	query += "PluginId = " + req.body.PluginId + " ";
	query += "WHERE PluginRoleId = " + req.body.PluginId;
	mssql.close();
	mssql.connect(config).then(pool => {
		return pool.request().query(query);
	}).then(result => { res.send(""); })
	  .catch(err => { console.log(err); res.send(""); })
});

pluginRolesRouter.post('/', function (req, res) {
	var query = "INSERT INTO IBIWebFramework.dbo.PluginRoles(PluginId, Description) VALUES (";
	query += "" + req.body.PluginId + ", ";
	query += "'" + req.body.Description + "'";
	query += ")";
	mssql.close();
	mssql.connect(config).then(pool => {
		return pool.request().query(query);
	}).then(result => {  res.send(""); })
	  .catch(err => { res.send(""); })
});


module.exports = pluginRolesRouter;