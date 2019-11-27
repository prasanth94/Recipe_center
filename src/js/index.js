import Search from './models/Search';
import * as searchView from './views/searchView';
import {elements, renderLoader, clearLoader} from './views/base';



/* Global state of the app
1. search object
2. current recipe
3.shopping list object
4.Liked recipe
*/
const state = {};

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
  await state.search.getResults();

  //5. Render Results
  clearLoader();
  searchView.renderResults(state.search.result);
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
