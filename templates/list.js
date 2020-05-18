const commonHeadCss = require('../css/common/head')
module.exports = {
  render: (items) => `
  <html>
    <head>
    ${commonHeadCss}
    </head>
    </html>
    <body>
      <center><h1>SimpleFood.io</h1>Browse Recipes</center>
      <hr/>
      <ul>
        ${items.map(item => `
          <li class=browse-recipe>
          <a href="id/${item.id}">
            <fieldset>
              <legend>${item.title}</legend>
              <p>${item.description}</p>
            </fieldset>
          </a>
        `).join('')}
      </ul>
    </body>
  </html>
  `
}