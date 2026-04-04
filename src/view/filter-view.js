import AbstractView from '../framework/view/abstract-view.js';

const createFilterTemplate = (filters, currentFilter) => {
  const filterItems = filters.map((filter) => {
    const isChecked = filter.type === currentFilter ? 'checked' : '';
    const isDisabled = filter.count === 0 ? 'disabled' : '';

    return `
      <div class="trip-filters__filter">
        <input id="filter-${filter.type}"
               class="trip-filters__filter-input visually-hidden"
               type="radio"
               name="trip-filter"
               value="${filter.type}"
               ${isChecked}
               ${isDisabled}>
        <label class="trip-filters__filter-label" for="filter-${filter.type}">
          ${filter.name} ${filter.count !== null ? `<span class="trip-filters__filter-count">${filter.count}</span>` : ''}
        </label>
      </div>
    `;
  }).join('');

  return `
    <form class="trip-filters" action="#" method="get">
      ${filterItems}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>
  `;
};

export default class FilterView extends AbstractView {
  #filters = null;
  #currentFilter = null;

  constructor(filters, currentFilter) {
    super();
    this.#filters = filters;
    this.#currentFilter = currentFilter;
    this._callback = {};
  }

  get template() {
    return createFilterTemplate(this.#filters, this.#currentFilter);
  }

  setFilterChangeHandler(callback) {
    this._callback.filterChange = callback;
    this.element.querySelectorAll('.trip-filters__filter-input').forEach((input) => {
      if (!input.disabled) {
        input.addEventListener('change', () => callback(input.value));
      }
    });
  }
}
