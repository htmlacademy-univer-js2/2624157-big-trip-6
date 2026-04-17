import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import EmptyEventsView from '../view/empty-events-view.js';
import EventPresenter from './event-presenter.js';
import { EventType } from '../const.js';
import { render, replace, remove } from '../framework/render.js';
import EventEditView from '../view/event-edit-view.js';

const createNewEvent = (destinations) => ({
  id: `new-event-${Date.now()}`,
  type: EventType.FLIGHT,
  destination: destinations[0]?.id || '',
  dateFrom: new Date(),
  dateTo: new Date(Date.now() + 3600000),
  basePrice: 0,
  offers: [],
  isFavorite: false
});

const SortType = {
  DAY: 'day',
  TIME: 'time',
  PRICE: 'price'
};

// Функции сортировки
const sortByDay = (events) => {
  return [...events].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
};

const sortByTime = (events) => {
  return [...events].sort((a, b) => {
    const durationA = new Date(a.dateTo) - new Date(a.dateFrom);
    const durationB = new Date(b.dateTo) - new Date(b.dateFrom);
    return durationB - durationA;
  });
};

const sortByPrice = (events) => {
  return [...events].sort((a, b) => b.basePrice - a.basePrice);
};

export default class TripPresenter {
  #container = null;
  #eventsModel = null;
  #filterView = null;
  #sortView = null;
  #emptyView = null;
  #eventPresenters = new Map();
  #currentFilter = 'everything';
  #currentSort = SortType.DAY;

  constructor(container, eventsModel) {
    if (!container) {
      throw new Error('Container is required for TripPresenter');
    }

    if (!eventsModel) {
      throw new Error('EventsModel is required for TripPresenter');
    }
    this.#container = container;
    this.#eventsModel = eventsModel;

    this.#eventsModel.addObserver(this.#handleModelUpdate.bind(this));
  }

  init() {
    this.#renderFilter();
    this.#renderEvents();
  }

  createNewEvent() {
    const destinations = this.#eventsModel.getDestinations();
    const offers = this.#eventsModel.getOffers();
    const newEvent = createNewEvent(destinations);
    this.#renderNewEvent(newEvent, destinations, offers);
  }

  #handleModelUpdate(updateType, data) {
    this.#renderEvents();
  }

  #renderFilter() {
    const filtersContainer = document.querySelector('.trip-controls__filters');
    if (!filtersContainer) return;

    const filters = this.#eventsModel.getFiltersCount();
    this.#filterView = new FilterView(filters, this.#currentFilter);
    render(this.#filterView, filtersContainer);
    this.#filterView.setFilterChangeHandler(this.#handleFilterChange.bind(this));
  }

  #renderSort() {
    if (this.#sortView) {
      remove(this.#sortView);
    }

    this.#sortView = new SortView(this.#currentSort);
    render(this.#sortView, this.#container);
    this.#sortView.setSortChangeHandler(this.#handleSortChange.bind(this));
  }

  #renderEmpty() {
    if (this.#emptyView) {
      remove(this.#emptyView);
    }

    this.#emptyView = new EmptyEventsView();
    render(this.#emptyView, this.#container);
  }

  #renderEvents() {
    this.#clearEventsList();

    let events = this.#eventsModel.getFilteredEvents(this.#currentFilter);

    events = this.#getSortedEvents(events);

    const destinations = this.#eventsModel.getDestinations();
    const offers = this.#eventsModel.getOffers();

    if (events.length === 0) {
      this.#renderEmpty();
      if (this.#sortView) {
        remove(this.#sortView);
        this.#sortView = null;
      }
      return;
    }

    if (!this.#sortView) {
      this.#renderSort();
    }

    events.forEach((event) => {
      this.#renderEvent(event, destinations, offers);
    });
  }

  #getSortedEvents(events) {
    switch (this.#currentSort) {
      case SortType.TIME:
        return sortByTime(events);
      case SortType.PRICE:
        return sortByPrice(events);
      default:
        return sortByDay(events);
    }
  }

  #clearEventsList() {
    this.#eventPresenters.forEach((presenter) => {
      presenter.destroy();
    });
    this.#eventPresenters.clear();

    if (this.#emptyView) {
      remove(this.#emptyView);
      this.#emptyView = null;
    }
  }

  #renderEvent(event, destinations, offers) {
    const eventPresenter = new EventPresenter({
      container: this.#container,
      onDataChange: this.#handleEventChange.bind(this),
      onModeChange: this.#handleModeChange.bind(this)
    });

    eventPresenter.init(event, destinations, offers);
    this.#eventPresenters.set(event.id, eventPresenter);
  }

  #renderNewEvent(event, destinations, offers) {
    const editComponent = new EventEditView(event, destinations, offers, true);

    editComponent.setFormSubmitHandler((state) => {
      const newEventData = {
        ...event,
        type: state.type,
        destination: state.destinationId,
        dateFrom: state.dateFrom,
        dateTo: state.dateTo,
        basePrice: state.basePrice,
        offers: state.selectedOffers
      };
      this.#eventsModel.addEvent(newEventData);
      remove(editComponent);
    });

    editComponent.setRollupClickHandler(() => {
      remove(editComponent);
    });

    editComponent.setDeleteClickHandler(() => {
      remove(editComponent);
    });

    editComponent.setTypeChangeHandler((type) => {
      console.log('New event type changed to', type);
    });

    editComponent.setDestinationChangeHandler((destinationId) => {
      console.log('New event destination changed to', destinationId);
    });

    render(editComponent, this.#container);
  }

  #handleEventChange(updatedEvent, isDelete = false) {
    if (isDelete) {
      this.#eventsModel.deleteEvent(updatedEvent.id);
    } else {
      this.#eventsModel.updateEvent(updatedEvent);
    }
  }

  #handleModeChange() {
    this.#eventPresenters.forEach((presenter) => {
      presenter.resetView();
    });
  }

  #handleFilterChange(filterType) {
    if (this.#currentFilter === filterType) return;
    this.#currentFilter = filterType;
    this.#renderEvents();
    this.#updateFilterView();
  }

  #updateFilterView() {
    const filtersContainer = document.querySelector('.trip-controls__filters');
    if (!filtersContainer) return;

    const filters = this.#eventsModel.getFiltersCount();
    const newFilterView = new FilterView(filters, this.#currentFilter);

    if (this.#filterView) {
      replace(newFilterView, this.#filterView);
    } else {
      render(newFilterView, filtersContainer);
    }

    this.#filterView = newFilterView;
    this.#filterView.setFilterChangeHandler(this.#handleFilterChange.bind(this));
  }

  #handleSortChange(sortType) {
    if (this.#currentSort === sortType) {
      return;
    }

    this.#currentSort = sortType;
    this.#renderEvents();
  }
}
