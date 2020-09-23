const recipe_template = require('./templates/recipe')
const list_template = require('./templates/list')
const search_template = require('./templates/search')
const { readdirSync, writeFileSync, mkdirSync, existsSync, readFileSync} = require('fs')

const build = (writeFile = false) => {
  if(!existsSync('./dist'))
    mkdirSync('./dist')
  const recipes = readdirSync('./src/recipes')
  console.log({event:'recipes-list', recipes})
  let metadata = []
  recipes.forEach(elem => {
    const settings = require(`./recipes/${elem}`)
    if(writeFile)
      writeFileSync(`./dist/${settings.slug}.html`, recipe_template.render(settings))
    metadata.push({
      slug: settings.slug,
      title: settings.title,
      description: settings.shortDescription,
      ingredients: settings.ingredients,
      tags: settings.tags
    })
  })
  const listTemplateRendered = list_template.render(metadata)
  const searchTemplateRendered = search_template.render(metadata)
  
  if(writeFile){
    writeFileSync('./dist/list.html', listTemplateRendered,)
    writeFileSync('./dist/search.html', searchTemplateRendered)
    const statics = readdirSync('./src/static')
    statics.forEach(elem => {
      writeFileSync(`./dist/${elem}`, readFileSync(`./src/static/${elem}`))
    })
  }
  
  console.log({event:'build-complete'})

  return { metadata }
}

module.exports = { build }
