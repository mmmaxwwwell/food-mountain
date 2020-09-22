const recipe_template = require('./templates/recipe')
const list_template = require('./templates/list')
const search_template = require('./templates/search')
const { readdirSync, writeFileSync, mkdirSync, existsSync} = require('fs')

const build = (writeFile = false) => {
  if(!existsSync('./dist'))
    mkdirSync('./dist')
  const recipes = readdirSync('./src/recipes')
  console.log({event:'recipes-list', recipes})
  let id = 0
  let metadata = []
  recipes.forEach(elem => {
    const settings = require(`./recipes/${elem}`)
    if(writeFile)
      writeFileSync(`./dist/${id}.html`, recipe_template.render(settings))
    metadata.push({
      id,
      title: settings.title,
      description: settings.shortDescription,
      ingredients: settings.ingredients,
      tags: settings.tags
    })
    id++
  })
  const listTemplateRendered = list_template.render(metadata)
  const searchTemplateRendered = search_template.render(metadata)
  
  if(writeFile){
    writeFileSync('./dist/list.html', listTemplateRendered,)
    writeFileSync('./dist/search.html', searchTemplateRendered)
  }
  
  console.log({event:'build-complete', })

  return { metadata }
}

module.exports = { build }
