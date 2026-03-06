import { render, RenderPosition } from '../utils/render.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import EventView from '../view/event-view.js';
import EventEditView from '../view/event-edit-view.js';
import { EventType } from '../const.js';

const createNewEvent = () => ({
  id: `new-event-${Date.now()}`,
  type: EventType.FLIGHT,
  destination: '',
  dateFrom: new Date(),
  dateTo: new Date(),
  basePrice: 0,
  offers: [],
  isFavorite: false
});
export default class TripPresenter {
  constructor(container, eventsModel) {
    if (!container) {
      throw new Error('Container is required for TripPresenter');
    }

    if (!eventsModel) {
      throw new Error('EventsModel is required for TripPresenter');
    }
    this.container = container;
    this.eventsModel = eventsModel;

    console.log('TripPresenter created with model:', this.eventsModel);
  }

  init() {
    console.log('TripPresenter init started');

    const destinations = this.eventsModel.getDestinations();
    const offers = this.eventsModel.getOffers();
    const events = this.eventsModel.getEvents();

    console.log('Destinations count:', destinations.length);
    console.log('Offers count:', offers.length);
    console.log('Events count:', events.length);

    const filtersContainer = document.querySelector('.trip-controls__filters');

    if (filtersContainer) {
      render(new FilterView(), filtersContainer);
    } else {
      console.error('Filter container not found');
    }

    render(new SortView(), this.container, RenderPosition.AFTERBEGIN);
    console.log('Sort rendered');

    const newEvent = createNewEvent();

    render(new EventEditView(newEvent, destinations, offers, true), this.container);
    console.log('New event form rendered');

    events.forEach((event, index) => {
      render(new EventView(event, destinations, offers), this.container);
      console.log(`Event ${index + 1} rendered`);
    });

    console.log('TripPresenter init completed');
  }
}
