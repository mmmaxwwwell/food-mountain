import * as BuildSettings from './classes/BuildSettings'
import * as Builder from './lib/Builder'
const stack = process.argv[2]
const env = process.argv[3]
const buildNumber = process.argv[4] || '0'
const templateNumber = process.argv[5] || '0'
const awsRegion = process.argv[6] || 'us-east-1'

const settings = new BuildSettings.BuildSettings(
  `${stack.replace(/[^a-zA-Z]/, '')}-${env}`,
  stack,
  buildNumber,
  awsRegion,
  templateNumber,
  env
)

const builder = new Builder.Builder(settings)

console.log({ event: 'buiding-with-settings', settings })

builder.build()
