if (process.env.NODE_ENV == 'local') {
    pfsenseUrl = 'http://192.168.2.122/';
}

if (process.env.NODE_ENV == 'test1') {
    pfsenseUrl = 'http://10.10.80.254/'
}

var rangeCheck = require('range_check');
var pfsense = require('pfsense-fwcontrol');
var deasync = require('deasync');


var activateRules = function (addRules) {
    var sync = true;
    var response = null;

    pfsense.start({
        baseUrl: pfsenseUrl,
        username: 'admin',
        password: 'pfsense'
        //proxy: 'http://localhost:8888'
    }, addRules, function (err, result) {
        if (err) {
            console.log(err);
            response = 'error';
            sync = false;
        } else {
            console.log(result);
            response = 'done';
            sync = false;
        }
    });

    while(sync) {require('deasync').sleep(3000);}
    return response;
};

var createRulesFromDemand = function (demand, options) {
    var rules = [];
    var demandType = 'producer';
    if (typeof demand.producer === 'undefined') {
        demandType = 'consumer';
    }

    var addRule = {
        action: 'create',
        params: {
            type: 'pass',
            ipprotocol: 'inet',
            interface: 'lan',
            srctype: 'single',
            src: '',
            srcbeginport: '',
            srcbeginport_cust: '',
            srcendport: '',
            srcendport_cust: '',
            dsttype: 'single'
        }
    };

    // topology
    if (rangeCheck.inRange(options.realip, '10.10.80.0/24') && demandType == 'consumer') {
        addRule.params.interface = 'wan'
    }
    if (rangeCheck.inRange(options.realip, '10.10.80.0/24') && demandType == 'producer') {
        addRule.params.interface = 'lan'
    }
    if (rangeCheck.inRange(options.realip, '10.10.81.0/24') && demandType == 'consumer') {
        addRule.params.interface = 'lan'
    }
    if (rangeCheck.inRange(options.realip, '10.10.81.0/24') && demandType == 'producer') {
        addRule.params.interface = 'wan'
    }


    if (demandType == 'consumer') {
        console.log('going to create a rule template for a consumer');

        addRule.params.src = options.realip;
        addRule.params.dst = demand.consumer.fromProducers[0].endpoint.networkEndpoint.ipAddresses[0];
        addRule.params.proto = demand.consumer.consumes[0].endpoint.transportEndpoint.ports[0].type;
        addRule.params.dstbeginport = demand.consumer.consumes[0].endpoint.transportEndpoint.ports[0].number;
        addRule.params.dstendport = demand.consumer.consumes[0].endpoint.transportEndpoint.ports[0].number;
        addRule.params.descr = demand.consumer.id;

    } else {
        console.log('going to create a rule template for a producer');

        addRule.params.src = demand.producer.forConsumers[0].endpoint.networkEndpoint.ipAddresses[0];
        addRule.params.dst = options.realip;
        addRule.params.proto = demand.producer.produces[0].endpoint.transportEndpoint.ports[0].type;
        addRule.params.dstbeginport = demand.producer.produces[0].endpoint.transportEndpoint.ports[0].number;
        addRule.params.dstendport = demand.producer.produces[0].endpoint.transportEndpoint.ports[0].number;
        addRule.params.descr = demand.producer.id;
    }

    rules.push(addRule);
    console.log(JSON.stringify(addRule));

    return rules;
};

module.exports = {
    activateRules: activateRules,
    createRuleTemplates: createRulesFromDemand
};