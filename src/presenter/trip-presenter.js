import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import EventView from '../view/event-view.js';
import EventEditView from '../view/event-edit-view.js';
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

export default class TripPresenter {
  #container = null;
  #eventsModel = null;
  #filterView = null;
  #sortView = null;
  #eventComponents = new Map();
  #currentEditComponent = null;
  #currentEventId = null;

  constructor(container, eventsModel) {
    if (!container) {
      throw new Error('Container is required for TripPresenter');
    }

    if (!eventsModel) {
      throw new Error('EventsModel is required for TripPresenter');
    }
    this.#container = container;
    this.#eventsModel = eventsModel;
  }

  init() {
    this.#renderFilter();
    this.#renderSort();
    this.#renderEvents();
  }

  createNewEvent() {
    const destinations = this.#eventsModel.getDestinations();
    const offers = this.#eventsModel.getOffers();
    const newEvent = createNewEvent(destinations);
    this.#renderNewEvent(newEvent, destinations, offers);
  }

  #renderFilter() {
    const filtersContainer = document.querySelector('.trip-controls__filters');
    if (filtersContainer) {
      this.#filterView = new FilterView();
      render(this.#filterView, filtersContainer);
      this.#filterView.setFilterChangeHandler(this.#handleFilterChange.bind(this));
    }
  }

  #renderSort() {
    this.#sortView = new SortView();
    render(this.#sortView, this.#container);
    this.#sortView.setSortChangeHandler(this.#handleSortChange.bind(this));
  }

  #renderEvents() {
    const events = this.#eventsModel.getEvents();
    const destinations = this.#eventsModel.getDestinations();
    const offers = this.#eventsModel.getOffers();

    events.forEach((event) => {
      this.#renderEvent(event, destinations, offers);
    });
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
      console.log('Form submitted', state);
      this.#replaceEditToEvent(editComponent, eventComponent);
    });

    editComponent.setRollupClickHandler(() => {
      this.#replaceEditToEvent(editComponent, eventComponent);
    });

    editComponent.setDeleteClickHandler(() => {
      console.log('Delete clicked for event', event.id);
      this.#replaceEditToEvent(editComponent, eventComponent);
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
      console.log('New event saved', state);
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
    console.log('Filter changed to', filterType);
  }

  #handleSortChange(sortType) {
    console.log('Sort changed to', sortType);
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
