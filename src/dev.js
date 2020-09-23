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
  res.send(readFileSync(`./src/static/index.html`).toString())
})

app.get('/about.html', (req, res) => {
  res.send(readFileSync(`./src/static/about.html`).toString())
})

app.get('/search.html', (req, res) => {
  const output = build()
  res.send(search_template.render(output.metadata).toString())
})

app.get('/list.html', (req, res) => {
  const output = build()
  res.send(list_template.render(output.metadata).toString())
})

app.get('/:slug', (req, res) => {
  const settings = require(`./recipes/${req.params.slug.replace('.html', '')}.js`)
  res.send(template.render(settings).toString())
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))