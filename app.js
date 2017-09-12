const express = require('express'),
    app = express();

app.use(function(req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,__setXHR_');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    //res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
var cmdParams = process.argv
hostName = cmdParams[2]
userName = cmdParams[3]
passKey = cmdParams[4]
console.log("hostName : "+hostName)
console.log("userName : "+userName)
console.log("passKey : "+passKey)


var SSH = require('simple-ssh');

app.get('/getFileList', (req, res) => {
	console.log("GET FILE LIST ==>")
    var ssh = new SSH({
        host: hostName,
        user: userName,
        pass: passKey
    });
    var param = req.query.param_1
    var response = {}
    var command = "ls"
    if (param.length > 0) {
        command = "cd ~ && cd "+param.replace(/['"]+/g, '')+" && ls"
    }
	console.log("Executing : "+command)
    ssh.exec(command, {
        out: function(stdout) {
            response.status = true
            response.data = stdout.split("\n").filter(Boolean)
            res.json(response)
        },
        err: function(stderr) {
            response.status = false
            response.errorMessage = stderr
            res.json(response)
        }
    }).start();
})

app.get('/readFile', (req, res) => {
	console.log("READ FILE ==>")
    var ssh = new SSH({
        host: hostName,
        user: userName,
        pass: passKey
    });
    var param = req.query.param_1
    var response = {}
    var command = "cat "+param
	command = command.replace(/['"]+/g, '')
	console.log("Executing : "+command)
    ssh.exec(command, {
        out: function(stdout) {
            response.status = true
            response.data = stdout.replace(/\n/ig, "<br/>")
            ssh.end();
            res.json(response)
        },
        err: function(stderr) {
            response.status = false
            response.errorMessage = stderr
            ssh.end();
            res.json(response)
        }
    }).start();
})

app.listen(3000, () => console.log('node istening on port 3000!'))