export default class EventsModel {
  constructor() {
    this.events = [];
    this.destinations = [];
    this.offers = [];
  }

  setEvents(events) {
    this.events = events;
  }

  getEvents() {
    return this.events;
  }

  setDestinations(destinations) {
    this.destinations = destinations;
  }

  getDestinations() {
    return this.destinations;
  }

  getDestinationById(id) {
    return this.destinations.find((destination) => destination.id === id);
  }

  setOffers(offers) {
    this.offers = offers;
  }

  getOffers() {
    return this.offers;
  }

  getOffersByType(type) {
    return this.offers.filter((offer) => offer.type === type);
  }

  getOfferById(id) {
    return this.offers.find((offer) => offer.id === id);
  }
}
