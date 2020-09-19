import BuildSettings = require('../classes/BuildSettings')
import AWSCredentials = require('../classes/AWSCredentials')
const cfn = require('cfn')
import fs = require('fs')

const VALID_ENVS = ['dev', 'prod']

export class Builder {
  constructor(_settings: BuildSettings.BuildSettings) {
    // super(options)
    this.settings = _settings
  }
  settings: BuildSettings.BuildSettings
  async build() {
    if (this.settings.env === undefined) {
      console.log(
        `You must supply an environment. Valid environments are ${VALID_ENVS.join(
          ','
        )}`
      )
      process.exit()
    }

    let creds = new AWSCredentials.AWSCredentials('', '')

    var lines = fs
      .readFileSync(`secrets/rootkey.${this.settings.env}.csv`, 'utf-8')
      .split('\n')
      .filter(Boolean)

    lines.map((line: string) => {
      const split = line.split('=')
      if (split[0] === 'AWSAccessKeyId') {
        creds.AWSAccessKeyId = split[1].replace('\r', '')
      } else if (split[0] === 'AWSSecretKey') {
        creds.AWSSecretKey = split[1]
      }
    })

    const username = require('os').userInfo().username

    fs.writeFileSync(
      `/home/${username}/.aws/credentials`,
      Buffer.from(`
        [default]
        aws_access_key_id = ${creds.AWSAccessKeyId}
        aws_secret_access_key = ${creds.AWSSecretKey}
      `)
    )

    fs.writeFileSync(
      `/home/${username}/.aws/config`,
      Buffer.from(`
        [default]
        region = ${this.settings.awsRegion}
        output = json
      `)
    )

    try {
      fs.rmdirSync('./temp')
    } catch {}
    fs.mkdirSync('./temp')

    const templatePath = `${__dirname}/../stacks/${this.settings.cloudFormationStackName}/template.${this.settings.templateNumber}.js`
    // console.log({ __dirname, templatePath })
    const template = require(templatePath)

    const templateJsonPath = `${__dirname}/../stacks/${this.settings.cloudFormationStackName}/template.${this.settings.templateNumber}.json`

    fs.writeFileSync(
      templateJsonPath,
      Buffer.from(JSON.stringify(await template.config(this.settings)))
    )

    const cfnParams = {
      name: `${this.settings.applicationName}`,
      template: templateJsonPath,
      cfParams: {
        buildNumber: this.settings.buildNumber,
        keyName: 'desktop',
        KeyName: 'desktop',
      },
      tags: {
        app: this.settings.applicationName,
        stackName: this.settings.cloudFormationStackName,
        buildNumber: this.settings.buildNumber,
        env: this.settings.env,
      },
      awsConfig: {
        region: this.settings.awsRegion,
        accessKeyId: creds.AWSAccessKeyId,
        secretAccessKey: creds.AWSSecretKey,
      },
      capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM'],
      checkStackInterval: 5000,
    }

    // console.log({ cfnParams })

    process.env.AWS_SDK_LOAD_CONFIG = '1'

    cfn(cfnParams).catch((e: Error) => {
      console.error({ error: e })
      if (
        e.message.includes(
          'is in ROLLBACK_COMPLETE state and can not be updated'
        )
      ) {
        console.log(`removing ${this.settings.cloudFormationStackName}`)
        cfn.delete(`${this.settings.applicationName}-${this.settings.env}`)
      }
    })
  }
}
