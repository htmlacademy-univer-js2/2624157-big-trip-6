import TripPresenter from './presenter/trip-presenter.js';
import EventsModel from './model/events-model.js';
import { generateDestinations } from './mock/destination.js';
import { generateOffers } from './mock/offer.js';
import { generateEvents } from './mock/event.js';

const destinations = generateDestinations();
const offers = generateOffers();
const events = generateEvents(8, destinations, offers);

const eventsModel = new EventsModel();
eventsModel.setDestinations(destinations);
eventsModel.setOffers(offers);
eventsModel.setEvents(events);

const siteMainElement = document.querySelector('.page-main');
const tripEventsContainer = siteMainElement.querySelector('.trip-events');

const tripPresenter = new TripPresenter(tripEventsContainer, eventsModel);
tripPresenter.init();

const addButton = document.querySelector('.trip-main__event-add-btn');
if (addButton) {
  addButton.addEventListener('click', () => {
    tripPresenter.createNewEvent();
  });
}
