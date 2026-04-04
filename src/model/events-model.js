export default class EventsModel {
  constructor() {
    this.events = [];
    this.destinations = [];
    this.offers = [];
    this._observers = [];
  }

  addObserver(observer) {
    this._observers.push(observer);
  }

  removeObserver(observer) {
    this._observers = this._observers.filter((obs) => obs !== observer);
  }

  _notify(event, payload) {
    this._observers.forEach((observer) => observer(event, payload));
  }

  setEvents(events) {
    this.events = events;
    this._notify('update', { action: 'setEvents' });
  }

  getEvents() {
    return this.events;
  }

  getFilteredEvents(filterType) {
    const now = new Date();

    switch (filterType) {
      case 'future':
        return this.events.filter((event) => new Date(event.dateFrom) > now);
      case 'past':
        return this.events.filter((event) => new Date(event.dateTo) < now);
      case 'present':
        return this.events.filter((event) => {
          const eventStart = new Date(event.dateFrom);
          const eventEnd = new Date(event.dateTo);
          return eventStart <= now && eventEnd >= now;
        });
      default:
        return [...this.events];
    }
  }

  getFiltersCount() {
    const now = new Date();

    const filters = [
      { type: 'everything', name: 'Everything', count: this.events.length },
      { type: 'future', name: 'Future', count: this.events.filter((event) => new Date(event.dateFrom) > now).length },
      { type: 'present', name: 'Present', count: this.events.filter((event) => {
        const eventStart = new Date(event.dateFrom);
        const eventEnd = new Date(event.dateTo);
        return eventStart <= now && eventEnd >= now;
      }).length },
      { type: 'past', name: 'Past', count: this.events.filter((event) => new Date(event.dateTo) < now).length }
    ];

    return filters;
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

  updateEvent(updatedEvent) {
    const index = this.events.findIndex((event) => event.id === updatedEvent.id);
    if (index !== -1) {
      this.events[index] = { ...this.events[index], ...updatedEvent };
      this._notify('update', { action: 'updateEvent', event: updatedEvent });
    }
  }

  addEvent(newEvent) {
    this.events.push(newEvent);
    this._notify('update', { action: 'addEvent', event: newEvent });
  }

  deleteEvent(eventId) {
    const index = this.events.findIndex((event) => event.id === eventId);
    if (index !== -1) {
      this.events.splice(index, 1);
      this._notify('update', { action: 'deleteEvent', eventId });
    }
  }
}
