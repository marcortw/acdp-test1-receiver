process.env.DEBUG = "acdp-receiver:*";

var pfsenseUrl;

console.log('working with ' + process.env.NODE_ENV + ' config');
if (process.env.NODE_ENV == 'local') {
    pfsenseUrl = 'http://192.168.2.122/';
}

if (process.env.NODE_ENV == 'test1') {
    pfsenseUrl = 'http://10.10.80.254/'
}

var pfsense = require('pfsense-fwcontrol');
var acdpReceiver = require('receiver-nodejs');
var async = require('async');
var firewall = require('./firewall');


var simulate = function (options, acdprequest, callback) {
    if (options.valid) {
        console.log('We received something to respond to in the main program');

        // just tell the client that we have received his stuff
        var resp = {
            "type": "ACDPRESPONSE",
            "receiver": {
                "description": "acdp-test1-receiver"
            }
        };
        resp.demands = [];

        acdprequest.demands.forEach(function (demand) {
            var demandId;
            if (typeof demand.producer === 'undefined') {
                demandId = demand.consumer.id;
            } else {
                demandId = demand.producer.id;
            }
            resp.demands.push({'id': demandId, 'state': 'RECEIVED'});
        });
        callback(null, resp); // send the callback, don't wait for firewall configuration


        var rules = [];

        async.each(acdprequest.demands, function (demand, callback) {
            var tmpRules = firewall.createRuleTemplates(demand, options);
            tmpRules.forEach(function (rule) {
                rules.push(rule);
            });
            callback();
        }, function (err) {
            if (err) {
                console.error(err.message);
            } else {
                firewall.activateRules(rules);
            }
        });

    } else {
        var resp = {
            "type": "ACDPRESPONSE",
            "receiver": {
                "description": "acdp-test1-receiver"
            },
            "request": {
                "state": "INVALID"
            }
        };
        callback(null, resp);
    }
};

module.exports = {
    simulate: simulate
};