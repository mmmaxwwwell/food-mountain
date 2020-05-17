module.exports = {
  render: (items) => `
  <html>
    <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      h1 {
        margin:0;
      }

      body{ 
        font-family:Arial, Helvetica, sans-serif;
      }

      ul{
        list-style-type:none;
        margin:0;
        padding:0;
      }
      </style>
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
        `)}
      </ul>
    </body>
  </html>
  `
}