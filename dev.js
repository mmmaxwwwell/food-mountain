const express = require('express')
const template = require('./recipe_template')
const list_template = require('./list_template')
const { build } = require('./engine')
const { readdirSync, writeFileSync, readFileSync } = require('fs')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  console.log('get')
  return res.write(readFileSync(`./static/index.html`))
})

app.get('/search', (req, res) => {
  console.log('search')
  return res.send(404)
})

app.get('/donate', (req, res) => {
  console.log('search')
  return res.send(404)
})

app.get('/list', (req, res) => {
  console.log('list')
  const output = build()
  return res.write(list_template.render(output.metadata))
})

app.get('/id/:id', (req, res) => {
  const recipes = readdirSync('./recipes')
  const settings = require(`./recipes/${recipes[parseInt(req.params.id)]}`)
  return res.send(template.render(settings))
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))