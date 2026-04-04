import AbstractView from '../framework/view/abstract-view.js';

const createSortTemplate = (currentSortType) => {
  const sortTypes = [
    { type: 'day', name: 'Day', isDisabled: false },
    { type: 'event', name: 'Event', isDisabled: true },
    { type: 'time', name: 'Time', isDisabled: false },
    { type: 'price', name: 'Price', isDisabled: false },
    { type: 'offer', name: 'Offers', isDisabled: true }
  ];

  const sortItems = sortTypes.map((sort) => {
    const isChecked = sort.type === currentSortType ? 'checked' : '';
    const isDisabled = sort.isDisabled ? 'disabled' : '';

    return `
      <div class="trip-sort__item trip-sort__item--${sort.type}">
        <input id="sort-${sort.type}"
               class="trip-sort__input visually-hidden"
               type="radio"
               name="trip-sort"
               value="sort-${sort.type}"
               ${isChecked}
               ${isDisabled}>
        <label class="trip-sort__btn" for="sort-${sort.type}">${sort.name}</label>
      </div>
    `;
  }).join('');

  return `
    <form class="trip-events__trip-sort trip-sort" action="#" method="get">
      ${sortItems}
    </form>
  `;
};

export default class SortView extends AbstractView {
  #currentSortType = null;

  constructor(currentSortType) {
    super();
    this.#currentSortType = currentSortType;
    this._callback = {};
  }

  get template() {
    return createSortTemplate(this.#currentSortType);
  }

  setSortChangeHandler(callback) {
    this._callback.sortChange = callback;
    this.element.querySelectorAll('.trip-sort__input').forEach((input) => {
      if (!input.disabled) {
        input.addEventListener('change', () => callback(input.value.replace('sort-', '')));
      }
    });
  }
}
