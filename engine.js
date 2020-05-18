const recipe_template = require('./templates/recipe')
const list_template = require('./templates/list')
const { readdirSync, writeFileSync} = require('fs')

const build = (writeFile = false) => {
  const recipes = readdirSync('./recipes')
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

  if(writeFile)
    writeFileSync('./dist/list.html', listTemplateRendered)
  
  console.log({event:'build-complete', })

  return {list: listTemplateRendered, metadata}
}

module.exports = { build }
