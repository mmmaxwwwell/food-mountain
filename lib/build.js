"use strict";
exports.__esModule = true;
var AWSCredentials = require("./classes/AWSCredentials");
var cfn = require('cfn');
var fs = require("fs");
var VALID_ENVS = ['dev', 'prod'];
var build = function (buildSettings) {
    if (buildSettings.env === undefined) {
        console.log("You must supply an environment. Valid environments are " + VALID_ENVS.join(','));
        process.exit();
    }
    var creds = new AWSCredentials.AWSCredentials('', '');
    var lines = fs
        .readFileSync("secrets/rootkey." + buildSettings.env + ".csv", 'utf-8')
        .split('\n')
        .filter(Boolean);
    lines.map(function (line) {
        var split = line.split('=');
        if (split[0] === 'AWSAccessKeyId') {
            creds.AWSAccessKeyId = split[1].replace('\r', '');
        }
        else if (split[0] === 'AWSSecretKey') {
            creds.AWSSecretKey = split[1];
        }
    });
    var username = require('os').userInfo().username;
    fs.writeFileSync("/home/" + username + "/.aws/credentials", new Buffer("\n  [default]\n  aws_access_key_id = " + creds.AWSAccessKeyId + "\n  aws_secret_access_key = " + creds.AWSSecretKey + "\n    "));
    fs.writeFileSync("/home/" + username + "/.aws/config", new Buffer("\n  [default]\n  region = " + buildSettings.awsRegion + "\n  output = json\n    "));
    fs.mkdirSync('./temp');
    var cfnParams = {
        name: buildSettings.applicationName,
        template: __dirname +
            ("/cf/stacks/" + buildSettings.cloudFormationStackName + "/template_" + buildSettings.templateNumber + ".json"),
        cfParams: {
            buildNumber: buildSettings.buildNumber,
            keyName: 'desktop',
            KeyName: 'desktop'
        },
        tags: {
            app: buildSettings.applicationName,
            stackName: buildSettings.cloudFormationStackName,
            buildNumber: `${(new Date).getTime()}`,
            env: buildSettings.env
        },
        awsConfig: {
            region: buildSettings.awsRegion,
            accessKeyId: creds.AWSAccessKeyId,
            secretAccessKey: creds.AWSSecretKey
        },
        capabilities: ['CAPABILITY_IAM'],
        checkStackInterval: 5000
    };
    // console.log({ cfnParams })
    process.env.AWS_SDK_LOAD_CONFIG = '1';
    cfn(cfnParams).catch((e) => {
        console.error({ error: e });
        if (e.message.includes('is in ROLLBACK_COMPLETE state and can not be updated')) {
            console.log("removing " + buildSettings.cloudFormationStackName);
            cfn["delete"](buildSettings.applicationName);
        }
    });
};
module.exports = { build: build };
