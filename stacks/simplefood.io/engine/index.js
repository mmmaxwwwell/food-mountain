const engine = require('./engine')

exports.handler = () => {
  console.log('test')
  engine.build(true)
}
