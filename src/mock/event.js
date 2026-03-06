import { EventType } from '../const.js';
import { getRandomArrayElement, getRandomInteger } from '../utils/common.js';

const getRandomDate = (dayOffset = 0) => {
  const baseDay = 18 + dayOffset;
  const day = Math.min(baseDay, 22);
  const hours = getRandomInteger(0, 23);
  const minutes = getRandomInteger(0, 59);

  return new Date(2019, 2, day, hours, minutes);
};

let eventCounter = 0;

export const generateEvent = (destinations, offers, index) => {
  eventCounter++;
  const typeValues = Object.values(EventType);
  const typeIndex = (index * 7 + eventCounter) % typeValues.length;
  const type = typeValues[typeIndex];
  const destinationIndex = (index * 3) % destinations.length;
  const destination = destinations[destinationIndex];
  const availableOffers = offers.filter((offer) => offer.type === type);

  const selectedOffers = availableOffers
    .filter((_, offerIndex) => {
      if (index % 3 === 0) {
        return offerIndex % 2 === 0;
      }
      if (index % 3 === 1) {
        return offerIndex % 3 === 0;
      }
      return offerIndex % 4 === 0;
    })
    .map((offer) => offer.id);

  const dayOffset = Math.floor(index / 2);
  const dateFrom = getRandomDate(dayOffset);

  let durationMinutes;
  switch(type) {
    case EventType.TAXI:
    case EventType.BUS:
      durationMinutes = getRandomInteger(10, 45);
      break;
    case EventType.FLIGHT:
      durationMinutes = getRandomInteger(90, 240);
      break;
    case EventType.TRAIN:
      durationMinutes = getRandomInteger(60, 180);
      break;
    case EventType.SHIP:
      durationMinutes = getRandomInteger(120, 300);
      break;
    case EventType.CHECK_IN:
      durationMinutes = getRandomInteger(60, 180);
      break;
    case EventType.SIGHTSEEING:
      durationMinutes = getRandomInteger(30, 120);
      break;
    case EventType.RESTAURANT:
      durationMinutes = getRandomInteger(45, 90);
      break;
    default:
      durationMinutes = getRandomInteger(30, 120);
  }

  const dateTo = new Date(dateFrom.getTime() + durationMinutes * 60 * 1000);
  const basePrice = getRandomInteger(15, 900) + (index * 15);

  return {
    id: `event-${Date.now()}-${eventCounter}-${Math.random()}`,
    type,
    destination: destination.id,
    dateFrom,
    dateTo,
    basePrice,
    offers: selectedOffers,
    isFavorite: index % 4 === 0
  };
};

export const generateEvents = (count, destinations, offers) => {
  console.log('Generating events...');

  eventCounter = 0;

  const events = [];

  for (let i = 0; i < count; i++) {
    const event = generateEvent(destinations, offers, i);
    events.push(event);

    console.log(`Event ${i + 1}:`, {
      type: event.type,
      destination: destinations.find(d => d.id === event.destination)?.name,
      date: `${event.dateFrom.toLocaleDateString()} ${event.dateFrom.toLocaleTimeString()}`,
      duration: `${(event.dateTo - event.dateFrom) / (1000 * 60)} min`,
      price: event.basePrice,
      offers: event.offers.length
    });
  }

  return events;
};
