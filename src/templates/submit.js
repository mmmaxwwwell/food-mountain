const commonHeadCss = require('../css/common/head')

module.exports = {
  render: (settings) => `
  <html>
    <head>
    ${commonHeadCss}
    </head>
    </html>
    <body>
      <center>
        <h1>SimpleFood.io</h1> 
        Submit a Recipe
      </center>
      <hr/>
      
    </body>
  </html>
  `
}