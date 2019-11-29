import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, renderLoader, clearLoader} from './views/base';



/* Global state of the app
1. search object
2. current recipe
3.shopping list object
4.Liked recipe
*/
const state = {};
window.state = state;

state.likes = new Likes();
likesView.toggleLikesMenu(state.likes.getnumLikes());
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
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    if(state.search){
      searchView.highlightSelected(id);
    }

    // Create new recipe object
    state.recipe = new Recipe(id);
    try{
      //Get Recipe data
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();
      //Calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      //Render recipe
      clearLoader();
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
      );
    }catch(error){
      alert("something went wrong :(");
      console.log(error);
    }

  }
}


/*
LIST Controller
*/

const controlList = () => {
  if(!state.list) state.list = new List();

  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
}

/*
Like Controller
*/
const controlLike = () => {
  if(!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;

  if(!state.likes.isLiked(currentID)){
    const newLike = state.likes.addLike(currentID, state.recipe.title, state.recipe.author, state.recipe.img);
    likesView.toggleLikeBtn(true);
    likesView.renderLike(newLike);
  }else {
    state.likes.deleteLike(currentID);
    likesView.toggleLikeBtn(false);
    likesView.deleteLike(currentID);
  }
  likesView.toggleLikesMenu(state.likes.getnumLikes());
}

['hashchange','load'].forEach(event => window.addEventListener(event, controlRecipe));

elements.recipe.addEventListener('click', e => {
  if(e.target.matches('.btn-decrease, .btn-decrease *')){
    if(state.recipe.servings > 1){
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  }else if(e.target.matches('.btn-increase, .btn-increase *')){
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  }else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
    controlList();
  }else if(e.target.matches('.recipe__love, .recipe__love *')){
    controlLike();
  }
});

window.addEventListener('load', () => {
  state.likes = new Likes();
  state.likes.readStorage();

  likesView.toggleLikesMenu(state.likes.getnumLikes());

  state.likes.likes.forEach(like => likesView.renderLike(like));
});

elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  if(e.target.matches('.shopping__delete, .shopping__delete *')){
    state.list.deleteItem(id);
    listView.deleteItem(id);
  }

  else if(e.target.matches('.shopping__count-value')){
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id,val);
  }
});
