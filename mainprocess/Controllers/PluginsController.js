var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var elecConfig = require("electron-config");
const mssql = require('mssql');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var config = config.get("IBIPluginManagementOptions");

router.get('/', function (req, res) {
	mssql.close();
	mssql.connect(config).then(pool => {
		return pool.request()
		.query("select pluginid ,plugindescription ,pluginname ,isinstalled ,rolecount, groupcount, membercount from ibiwebframework.dbo.vwplugininfo order by pluginname");
	}).then(result => { res.send(result.recordset); })
	  .catch(err => { res.send(""); })
});

router.get('/:id', function (req, res) {
	console.log(req.params.pluginId);
    mssql.close();
	if(req.params.pluginId == undefined){
		 mssql.connect(config).then(pool => {
		 return pool.request()
					.query("select pluginid ,plugindescription ,pluginname ,isinstalled ,rolecount, groupcount, membercount from ibiwebframework.dbo.vwplugininfo order by pluginname");
		}).then(result => { res.send(result.recordset); })
		  .catch(err => { res.send(""); })
	} else {
		mssql.connect(config).then(pool => {
			return pool.request()
				.query("SELECT * FROM dbo.Plugins WHERE PluginId = " + req.params.pluginId);
		}).then(result => { res.send(result.recordset); })
		  .catch(err => { res.send(""); })
	}   
});

module.exports = router;