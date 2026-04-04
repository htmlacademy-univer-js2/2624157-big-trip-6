import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import EventView from '../view/event-view.js';
import EventEditView from '../view/event-edit-view.js';
import EmptyEventsView from '../view/empty-events-view.js';
import { EventType } from '../const.js';
import { render, replace, remove } from '../framework/render.js';

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

export default class TripPresenter {
  #container = null;
  #eventsModel = null;
  #filterView = null;
  #sortView = null;
  #emptyView = null;
  #eventComponents = new Map();
  #currentEditComponent = null;
  #currentEventId = null;
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

    events = this.#sortEvents(events);

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

  #sortEvents(events) {
    const sortedEvents = [...events];

    switch (this.#currentSort) {
      case SortType.TIME:
        sortedEvents.sort((a, b) => {
          const durationA = new Date(a.dateTo) - new Date(a.dateFrom);
          const durationB = new Date(b.dateTo) - new Date(b.dateFrom);
          return durationB - durationA;
        });
        break;
      case SortType.PRICE:
        sortedEvents.sort((a, b) => b.basePrice - a.basePrice);
        break;
      default:
        sortedEvents.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
        break;
    }

    return sortedEvents;
  }

  #clearEventsList() {
    this.#eventComponents.forEach((components) => {
      remove(components.event);
      if (components.edit) {
        remove(components.edit);
      }
    });
    this.#eventComponents.clear();

    if (this.#emptyView) {
      remove(this.#emptyView);
      this.#emptyView = null;
    }

    if (this.#currentEditComponent) {
      document.removeEventListener('keydown', this.#escKeyDownHandler);
      this.#currentEditComponent = null;
    }
  }

  #renderEvent(event, destinations, offers) {
    const eventComponent = new EventView(event, destinations, offers);
    const editComponent = new EventEditView(event, destinations, offers, false);

    eventComponent.setEditClickHandler(() => {
      this.#replaceEventToEdit(eventComponent, editComponent, event.id);
    });

    eventComponent.setFavoriteClickHandler(() => {
      console.log('Favorite clicked for event', event.id);
    });

    editComponent.setFormSubmitHandler((state) => {
      const updatedEvent = {
        ...event,
        type: state.type,
        destination: state.destinationId,
        dateFrom: state.dateFrom,
        dateTo: state.dateTo,
        basePrice: state.basePrice,
        offers: state.selectedOffers
      };
      this.#eventsModel.updateEvent(updatedEvent);
      this.#replaceEditToEvent(editComponent, eventComponent);
    });

    editComponent.setRollupClickHandler(() => {
      this.#replaceEditToEvent(editComponent, eventComponent);
    });

    editComponent.setDeleteClickHandler(() => {
      this.#eventsModel.deleteEvent(event.id);
    });

    editComponent.setTypeChangeHandler((type) => {
      console.log('Type changed to', type);
    });

    editComponent.setDestinationChangeHandler((destinationId) => {
      console.log('Destination changed to', destinationId);
    });

    editComponent.setPriceChangeHandler((price) => {
      console.log('Price changed to', price);
    });

    editComponent.setDateChangeHandler((dateFrom, dateTo) => {
      console.log('Dates changed', dateFrom, dateTo);
    });

    editComponent.setOfferChangeHandler((selectedOffers) => {
      console.log('Offers changed', selectedOffers);
    });

    render(eventComponent, this.#container);
    this.#eventComponents.set(event.id, {
      event: eventComponent,
      edit: editComponent
    });
  }

  #renderNewEvent(event, destinations, offers) {
    const newEventComponent = new EventEditView(event, destinations, offers, true);

    newEventComponent.setFormSubmitHandler((state) => {
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
      remove(newEventComponent);
      this.#currentEditComponent = null;
    });

    newEventComponent.setRollupClickHandler(() => {
      remove(newEventComponent);
      this.#currentEditComponent = null;
    });

    newEventComponent.setDeleteClickHandler(() => {
      remove(newEventComponent);
      this.#currentEditComponent = null;
    });

    render(newEventComponent, this.#container);
    this.#currentEditComponent = newEventComponent;
  }

  #replaceEventToEdit(eventComponent, editComponent, eventId) {
    replace(editComponent, eventComponent);
    this.#currentEventId = eventId;
    this.#currentEditComponent = editComponent;
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  #replaceEditToEvent(editComponent, eventComponent) {
    replace(eventComponent, editComponent);
    this.#currentEventId = null;
    this.#currentEditComponent = null;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
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
    if (this.#currentSort === sortType) return;
    this.#currentSort = sortType;
    this.#renderEvents();
  }

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' && this.#currentEditComponent && this.#currentEventId) {
      evt.preventDefault();
      const components = this.#eventComponents.get(this.#currentEventId);
      if (components) {
        this.#replaceEditToEvent(this.#currentEditComponent, components.event);
      }
    }
  };
}
