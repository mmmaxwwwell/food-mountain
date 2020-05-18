const commonHeadCss = require('../css/common/head')
const allergens = require('../css/common/allergens')

module.exports = {
  render: (settings) => {
    console.log({event:'settings', settings})
    const tags = new Set()
    const ingredients = new Set()
    settings.forEach(item => {
      item.tags.forEach(tag => {
        tags.add(tag)
      })
      item.ingredients.forEach(ingredient => {
        ingredients.add(ingredient.item)
      })
    });

    allergens.forEach(allergen => {
      tags.delete(`${allergen.id}-free`)
    })

    const metadata = settings.map((elem) => {return {title: elem.title, id: elem.id, description: elem.description, ingredients: elem.ingredients.map(elem2 => elem2.item), tags: elem.tags}})

    return `
    <html>
      <head>
      <script
      src="https://code.jquery.com/jquery-3.5.1.slim.min.js"
      integrity="sha256-4+XzXVhsDmqanXGHaHvgh1gMQKX40OUvDEBTu8JcmNs="
      crossorigin="anonymous"></script>
      ${commonHeadCss}
      <style>
        #allergens-ul{
          column-count: 2;
        }
        #tags-input,input.tags-input-item{
          width:75%;
        }
        .fr{
          float:right;
        }
        .selected-tag{
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        #search-button{
          position: absolute;
          bottom:15px;
          width: 85%;
          height: 3em;
          left:7.5%;
        }
        #search-button-button{
          width: 100%;
          height: 100%;
          font-size:2em;
          border-radius:0.25em;
          border-width:1px;
          border-color:black;
        }
      </style>
      <script>
      window.metadata = ${JSON.stringify(metadata)}
      $( document ).ready(function() {
        $('#add-tag-button').click(function(elem){
          if(!$('#tags-input').val())
            return
          $('#tags-list').append('<li class="selected-tag"><input value="' + $('#tags-input').val() + '" type="text" class="tags-input-item" disabled name="tags-input-item[]"><a class="fr"><button type="button" onclick="javascript:console.log($(this).parent().parent().remove())">🗑</button></a></li>')
          $('#tags-input').val('')
        })

        $('#search-button-button').click(function(elem){
          const arr = $('form').serializeArray()
          let results = new Set()
          const tags = $('.tags-input-item').map((index,value) => {
            return value.value
          })

          const tagsInputValue = $('#tags-input').val()
          if(!!tagsInputValue){
            tags.push(tagsInputValue)
          }

          window.metadata.forEach(recipe => {
            //start each one off assuming it will pass. as it goes
            //through each validation, a single disqualifying event will 
            //cause it to fail. every search criteria must match the 
            //recipe. name must match AND every tag must match an ingredient 
            //or tag on the recipe.
            let selected = true
            if(!!$('#recipe-name').val()){
              const terms = $('#recipe-name').val().toLowerCase().split(' ').filter(elem => elem)
              let found = false
              terms.forEach(term => {
                if(recipe.title.toLowerCase().includes(term)){
                  found = true 
                }
              })
              if(!found){
                selected = false
                console.log("DQ1", recipe.id)
              }
            }

            Array.from(tags).forEach(tag => {
              let found = false
              recipe.ingredients.forEach(ingredient => {
                if(ingredient.includes(tag))
                  found = true
              })
              recipe.tags.forEach(recipeTag => {
                if(recipeTag.includes(tag))
                found = true
              })
              if(!found){
                console.log("DQ2", recipe.id)
                selected = false
              }
            })

            if(selected)
              results.add(recipe)
          })
          
          results = Array.from(results)

          const allergens = ${JSON.stringify(allergens)}

          allergens.forEach(allergen => {
            const id = '#allergen-' + allergen.id + ':checked'
            if($(id).length){
              console.log({event:'allergen-check', allergen})
              results.forEach(elem => {
                if(!elem.tags.includes(allergen.id + '-free')){
                  const index = results.indexOf(elem)
                  results.splice(index, 1)
                }
              })
            }
          })

          const rowTemplate = (id, title, description) => '<li class=browse-recipe><a href="id/' + id + '"><fieldset><legend>' + title + '</legend><p>' + description + '</p></fieldset>'

          const output = Array.from(results).map((result) => rowTemplate(result.id, result.title, result.description)).join('')

          $('#search-results-content').html(output)
        })
      });
      </script>
      </head>
      </html>
      <body>
        <center>
          <h1>SimpleFood.io</h1> 
          Search for a Recipe
        </center>
        <hr/>
        <form id="search-form">
          <fieldset id="allergens">
            <legend>Allergens and Intolerances</legend>
            <ul id="allergens-ul">
              ${allergens.map(elem => `
              <li class="allergen">
              <label for="allergen-${elem.id}">
                <input 
                  type="checkbox" 
                  name="allergen-${elem.id}"
                  id="allergen-${elem.id}">
                    ${elem.icon} ${elem.name} free
                  </input>
              </label>
              `).join('')}
            </ul>
          </fieldset>
          <fieldset>
            <legend>Name</legend>
            <input type="text" id="recipe-name" name="recipe-name"/>
          </fieldset>
          <fieldset>
            <legend>Tags & Ingredients</legend>
            <input type="text" list="tags-list-data" autocomplete=off id="tags-input" name="tags-input">
            <datalist id="tags-list-data">
              ${Array.from(tags).map(item => `"<option>${item}</option>"`).join(",")}
              ${Array.from(ingredients).map(item => `"<option>${item}</option>"`).join(",")}
            </datalist>
            <a><button type="button" id="add-tag-button">Add Tag</button></a>
            <hr/>
            <ul id="tags-list">
            </ul>
          </fieldset>
          <fieldset id="search-results">
          <legend>Search Results</legend>
            <div id="search-results-content">
            </div>
          </fieldset>
          <a id="search-button" class="fr"><button type="button" id="search-button-button">Search 🔎</button></a>
        </form>
      </body>
    </html>
    `
  }
}