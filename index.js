var fs = require("fs");
var request = require("request");
var config;
try {
  config = JSON.parse(fs.readFileSync("config.json"));
} catch(e) {
  console.error("NO CONFIG FILE FOUND");
  process.exit();
}

if(config.type == "cli") {
  for(var i = 2; i < process.argv.length; i++) {
    var pair = process.argv[2].split("=");
    if(pair.length != 2) continue;
    config.params[pair[0]] = pair[1];
  }
  runConfig(config);
} else if (config.type = "static") {
  runConfig(config);
}

function runConfig(config, cb) {
  if(config.url) {
    config.payload.url = config.url;
    request(config.payload, function(err, data, body) {
      if(cb) cb(body);
    });
  } else if(config.urls) {
    for(var i = 0; i < config.urls.length; i++) {
      var url = config.urls.shift();
      config.url = url;
      function loop(config, res) {
        resHandler(config, res, function(success) {
          if(!success) throw new Error("Invalid Response");
          if(config.urls.length != 0) {
            var url = config.urls.shift();
            config.url = url;
            runConfig(config, loop);
          } else {
            console.info("Testing completed successfully");
          }
        });
      }
      runConfig(config, loop);
    }
  }
}

function resHandler(res, cb) {
    /* Check if response is valid
    // The format of a response handler should be as followed,
    {
      "name": A friendly name for a test
      "url": url of api to test
      "payload" :{
        "type" type of data to send
        "data": {} payload data
        payload data can be either a format, or a specific response
      }
      {
        type: "format",
        values: {
          "name": "string" << define type of data
          "data" { << can define a deep object
            "type" << This can be object or array
            "name": test" << if object,
            if array a valid type or types can be defined for the elements in the array.
          }
        }
      }
    }
    */
}
