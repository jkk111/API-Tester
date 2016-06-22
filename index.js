var fs = require("fs");
var request = require("request");
var config;
// try {
//   config = JSON.parse(fs.readFileSync("config.json"));
// } catch(e) {
//   console.error("NO CONFIG FILE FOUND");
//   process.exit();
// }

// if(config.type == "cli") {
//   for(var i = 2; i < process.argv.length; i++) {
//     var pair = process.argv[2].split("=");
//     if(pair.length != 2) continue;
//     config.params[pair[0]] = pair[1];
//   }
//   runConfig(config);
// } else if (config.type = "static") {
//   runConfig(config);
// }

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


function checkValid(check, data) {
  if(typeof check.check != "object") {
    console.error("Must provide a valid object or array to check");
    return false;
  }
  if(data == undefined) {
    return false;
  }
  if(check.type == "static") {
    for(key in check.check) {
      if(typeof check.check[key] == "object" && data[key]) {
        var tmp = {};
        tmp.type = check.type;
        tmp.check = check.check[key];
        var validSub = checkValid(tmp, data[key]);
        if(!validSub) {
          return false;
        }
      } else {
        if(check.check[key] != data[key]) {
          return false;
        }
      }
    }
  } else if (check.type == "format") {
    if(Array.isArray(check.check)) {
      for(var i = 0; i < check.check.length; i++) {
        if(typeof check.check[i] == "object") {
          var tmp = {};
          tmp.type = check.type;
          tmp.check = check.check[i];
          var validSub = checkValid(tmp, data[i]);
          if(!validSub) {
            return false;
          }
        } else {
          if(!data[check.check[i]]) {
            return false;
          }
        }
      }
    } else {
      console.error("Must provide an array for format!");
    }
  } else if(check.type = "typecheck") {
    for(key in check.check) {
      if(typeof check.check[key] == "object") {
        var tmp = {}
        tmp.type = check.type;
        tmp.check = check.check[key];
        var validSub = checkValid(tmp, data[key]);
        if(!validSub) {
          return false;
        }
      }
      else if(typeof data[key] != check.check[key]) {
        console.info("TypeOf data[%s] was %s not %s", key, typeof data[key], check.check[key]);
        return false;
      }
    }
  }
  return true;
}

var chk = {
  type: "typecheck",
  check: {
    hello: "string",
    "world": "string",
    test: {
      main: "number",
      secondary: "number"
    },
  }
}

var a = 1
a = a << 31;
a[31] = 0;

b = -2147483648;
a = ~b;
console.log(a);

var data = {
  hello: "man",
  "world": "'s huh?",
  test: {
    main: 1,
    secondary: 1.1
  }
}

console.log(checkValid(chk, data));
