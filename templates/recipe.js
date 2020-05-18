const commonHeadCss = require('../css/common/head')
const allergens = require('../css/common/allergens')
let title, description, instructions, ingredients

module.exports = {
  render: (settings) => `
  <html>
    <head>
      ${commonHeadCss}
      <style>
      #allergies{
        display:flex;
      }

      .allergen{
        width:33%;
        margin:0;
        padding:0;
      }
      </style>
    </head>
    </html>
    <body>
      <h1>${settings.title}</h1>
      ${settings.shortDescription}
      <hr>
      <fieldset id="description" class="widget">
        <legend>Description</legend>
        ${settings.description}
      </fieldset>
      <fieldset id="ingredients" class="widget">
        <legend>Ingredients</legend>
        <ul id="ingredients-ul">
          ${settings.ingredients.map(elem => `<li class="ingredient">${elem.quantity} ${elem.units} ${elem.item} ${(elem.mods || []).join(', ')} </li>`).join('')}
        </ul>
      </fieldset>
      <fieldset id="instructions" class="widget">
        <legend>Instructions</legend>
        ${settings.instructions.map(elem => `<p>${elem}</p>`).join('')}
      </fieldset>
      <fieldset id="allergies" class="widget">
        <legend>Allergens and Intolerances</legend>
        ${allergens.map(elem => `
          <div class="allergen">
            ${elem.icon} ${elem.name} 
          </div>  
        `).join('')}
      </fieldset>
      ${!!settings.equipment && !!settings.equipment.required ? `
        <fieldset id="required-equipment" class="widget">
          <legend>Required Equipment</legend>
          <ul id="required-equipment-ul>
            ${settings.equipment.required.map(item => `
              <li class="equipment-container">
                <span class="equipment-name"><a href="${item.link}">${item.name}</a></span>
                <span class="equipment-plug">${item.plug}</span>
              </li>
            `).join('')}
          </ul>
        </fieldset>
      ` : ''}
      ${!!settings.equipment && !!settings.equipment.recommended ? `
        <fieldset id="recommended-equipment" class="widget">
          <legend>Recommended Equipment</legend>
          <ul id="recommended-equipment-ul>
            ${settings.equipment.recommended.map(item => `
              <li class="equipment-container">
                <span class="equipment-name"><a href="${item.link}">${item.name}</a></span>
                <span class="equipment-plug">${item.plug}</span>
              </li>
            `).join('')}
          </ul>
        </fieldset>
      ` : ''}
      ${!!settings.tags ? `
        <fieldset id="tags" class="widget">
          <legend>Tags</legend>
          <ul id="tags>
            ${settings.tags.map(item => `
              <li class="tags">
                <span class="tag-name"><a href="tags/${item}">${item}</a></span>
              </li>
            `).join('')}
          </ul>
        </fieldset>
      ` : ''}
      
    </body>
  </html>
  `
}