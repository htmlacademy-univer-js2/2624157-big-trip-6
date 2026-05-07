import FilterView from '../view/filter-view.js';
import { render, replace, remove } from '../framework/render.js';

export default class FilterPresenter {
  #container = null;
  #filterModel = null;
  #eventsModel = null;
  #filterComponent = null;
  #onFilterChange = null;

  constructor({ container, filterModel, eventsModel, onFilterChange }) {
    this.#container = container;
    this.#filterModel = filterModel;
    this.#eventsModel = eventsModel;
    this.#onFilterChange = onFilterChange;

    this.#eventsModel.addObserver(this.#handleEventsUpdate.bind(this));
  }

  init() {
    this.#renderFilter();
  }

  #renderFilter() {
    const filters = this.#eventsModel.getFiltersCount();
    const currentFilter = this.#filterModel.filter;

    const prevComponent = this.#filterComponent;
    this.#filterComponent = new FilterView(filters, currentFilter);

    this.#filterComponent.setFilterChangeHandler((filterType) => {
      this.#filterModel.setFilter('user', filterType);
      this.#onFilterChange(filterType);
    });

    if (prevComponent) {
      replace(this.#filterComponent, prevComponent);
      remove(prevComponent);
    } else {
      render(this.#filterComponent, this.#container);
    }
  }

  #handleEventsUpdate() {
    this.#renderFilter();
  }
}
