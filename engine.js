const recipe_template = require('./recipe_template')
const list_template = require('./list_template')
const { readdirSync, writeFileSync} = require('fs')

const build = (writeFile = false) => {
  const recipes = readdirSync('./recipes')
  console.log({event:'recipes-list', recipes})
  const id = 0
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
  })
  
  const listTemplateRendered = list_template.render(metadata)

  if(writeFile)
    writeFileSync('./dist/list.html', listTemplateRendered)
  
  console.log({event:'build-complete', })

  return {list: listTemplateRendered, metadata}
}

module.exports = { build }
