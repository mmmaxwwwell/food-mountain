export class BuildSettings {
  constructor(
    applicationName: string,
    cloudFormationStackName: string,
    buildNumber: string,
    awsRegion: string,
    templateNumber: string,
    env: string
  ) {
    this.applicationName = applicationName
    this.cloudFormationStackName = cloudFormationStackName
    this.buildNumber = buildNumber
    this.awsRegion = awsRegion
    this.templateNumber = templateNumber
    this.env = env
  }

  applicationName: string
  cloudFormationStackName: string
  buildNumber: string
  awsRegion: string
  templateNumber: string
  env: string
}
