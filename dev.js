const express = require('express')
const template = require('./templates/recipe')
const submit_template = require('./templates/submit')
const search_template = require('./templates/search')
const list_template = require('./templates/list')
const { build } = require('./engine')
const { readdirSync, writeFileSync, readFileSync } = require('fs')

const app = express()
const port = 3000

app.get('/', (req, res) => {
  console.log('get')
  res.send(readFileSync(`./static/index.html`).toString())
})

app.get('/search', (req, res) => {
  console.log('search:GET')
  const output = build()
  res.send(search_template.render(output.metadata).toString())
})

app.get('/submit', (req, res) => {
  console.log('submit:GET')
  return res.send(submit_template.render().toString())
})

app.get('/donate', (req, res) => {
  console.log('search')
  return res.send(404)
})

app.get('/list', (req, res) => {
  console.log('list')
  const output = build()
  res.send(list_template.render(output.metadata).toString())
})

app.get('/id/:id', (req, res) => {
  const recipes = readdirSync('./recipes')
  const settings = require(`./recipes/${recipes[parseInt(req.params.id)]}`)
  res.send(template.render(settings).toString())
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))