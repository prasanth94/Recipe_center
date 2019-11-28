import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import {elements, renderLoader, clearLoader} from './views/base';



/* Global state of the app
1. search object
2. current recipe
3.shopping list object
4.Liked recipe
*/
const state = {};

// Search Controller

const controlSearch = async () => {
// 1. Get the query from the viewport
const query = searchView.getInput();

if(query){
  //2. New search object and add to state
  state.search = new Search(query);

  // 3.Prepare UI for results
  searchView.clearInput();
  searchView.clearResults();
  renderLoader(elements.searchRes);
  //4. Search for recipes

  try{
    await state.search.getResults();

    //5. Render Results
    clearLoader();
    searchView.renderResults(state.search.result);
  }catch(error){
    console.log(error);
    alert("something went wrong");
  }

}

}

elements.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');
  if(btn){
    const goto = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goto);
  }


});

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
});

// Recipe Controller
const controlRecipe = async () => {
  // Get ID from url
  const id = window.location.hash.replace('#', '');

  if(id){

    // Prepare UI for changes

    // Create new recipe object
    state.recipe = new Recipe(id);
    try{
      //Get Recipe data
      await state.recipe.getRecipe();
      //Calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      //Render recipe
      console.log(state.recipe);
    }catch(error){
      alert("something went wrong :(");
      console.log(error);
    }

  }
}

['hashchange','load'].forEach(event => window.addEventListener(event, controlRecipe));
