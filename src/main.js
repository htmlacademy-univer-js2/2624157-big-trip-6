import TripPresenter from './presenter/trip-presenter.js';
import EventsModel from './model/events-model.js';
import { generateDestinations } from './mock/destination.js';
import { generateOffers } from './mock/offer.js';
import { generateEvents } from './mock/event.js';

const destinations = generateDestinations();
console.log('Generated destinations:', destinations.map(d => d.name).join(', '));

const offers = generateOffers();
console.log('Generated offers by type:');

const events = generateEvents(8, destinations, offers);
console.log('Generated events:', events.length);

const eventsModel = new EventsModel();
eventsModel.setDestinations(destinations);
eventsModel.setOffers(offers);
eventsModel.setEvents(events);

console.log('\n=== CHECKING EVENTS ===');
events.forEach((event, index) => {
  const destination = destinations.find(d => d.id === event.destination);
  console.log(`Event ${index + 1}: ${event.type} to ${destination?.name}, price: €${event.basePrice}`);
});

const siteMainElement = document.querySelector('.page-main');
const tripEventsContainer = siteMainElement.querySelector('.trip-events');

const tripPresenter = new TripPresenter(tripEventsContainer, eventsModel);
tripPresenter.init();
