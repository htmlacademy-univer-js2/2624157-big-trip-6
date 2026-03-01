import { render, RenderPosition } from '../utils/render.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import EventView from '../view/event-view.js';
import EventEditView from '../view/event-edit-view.js';

export default class TripPresenter {
  constructor(container) {
    this.container = container;
  }

  init() {
    const filtersContainer = document.querySelector('.trip-controls__filters');

    if (filtersContainer) {
        render(new FilterView(), filtersContainer);
    } else {
        console.error('Filter container not found');
    }


    render(new SortView(), this.container, RenderPosition.AFTERBEGIN);

    render(new EventEditView(), this.container);

    for (let i = 0; i < 3; i++) {
      render(new EventView(), this.container);
    }
  }
}
