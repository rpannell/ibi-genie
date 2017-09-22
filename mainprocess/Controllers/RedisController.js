const systemConstants = require('../../assets/const');
var redis = require("redis"),
    client1 = redis.createClient(systemConstants.REDISSERVER1),
	client2 = redis.createClient(systemConstants.REDISSERVER2),
	AllPlugins = "WebFramework-AllPlugins";

client1.on("error", function (err) {
    console.log("Error " + err);
});

client2.on("error", function (err) {
    console.log("Error " + err);
});

function DeleteKey(key){
	client1.del(key, function(err, reply){});
	client2.del(key, function(err, reply){});
}

exports.removeAllPlugins = function(){
	DeleteKey(AllPlugins);
};

exports.removePluginInRole = function(pluginName){
	DeleteKey('WebFramework-PluginRoles-' + pluginName);
	DeleteKey(AllPlugins);
};