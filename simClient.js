var simulator = require('./simulator');
var acdpRequest = {
    "type": "ACDPREQUEST",
    "submitter": {
        "description": "ACDP Submitter for Node.js version 0.1.0"
    },
    "demands": [{
        "consumer": {
            "id": "f5f82a19-7e10-4106-b25b-3ccf09cef78b",
            "application": {
                "applicationid": "acdp-test1-submitter-2",
                "applicationname": "acdp-test1-submitter-2",
                "applicationversion": "Beta 1",
                "instanceid": "d8e1faa2-3338-4a32-b8ab-6b5be4c77f56"
            },
            "consumes": [{
                "endpoint": {
                    "transportEndpoint": {
                        "ports": [{
                            "type": "TCP",
                            "number": 8001
                        }]
                    }
                }
            }],
            "fromProducers": [{
                "endpoint": {
                    "networkEndpoint": {
                        "fqdNames": ["10.10.80.100."]
                    }
                }
            }]
        }
    }]
};

var options = {
    "realip": "10.10.81.200",
    "receiverType": "multicast",
    "valid": true
};

simulator.simulate(options, acdpRequest, function (err, result) {
    if(err){
        console.log(err)
    } else {
        console.log(result);
    }

});