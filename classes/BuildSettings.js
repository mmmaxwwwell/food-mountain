"use strict";
exports.__esModule = true;
var BuildSettings = /** @class */ (function () {
    function BuildSettings(applicationName, cloudFormationStackName, buildNumber, awsRegion, templateNumber, env) {
        this.applicationName = applicationName;
        this.cloudFormationStackName = cloudFormationStackName;
        this.buildNumber = buildNumber;
        this.awsRegion = awsRegion;
        this.templateNumber = templateNumber;
        this.env = env;
    }
    return BuildSettings;
}());
exports.BuildSettings = BuildSettings;
