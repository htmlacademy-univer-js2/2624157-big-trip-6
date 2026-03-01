// src/const.js
export const EventType = {
  TAXI: 'taxi',
  BUS: 'bus',
  TRAIN: 'train',
  SHIP: 'ship',
  DRIVE: 'drive',
  FLIGHT: 'flight',
  CHECK_IN: 'check-in',
  SIGHTSEEING: 'sightseeing',
  RESTAURANT: 'restaurant'
};

export const EventTypeLabels = {
  [EventType.TAXI]: 'Taxi',
  [EventType.BUS]: 'Bus',
  [EventType.TRAIN]: 'Train',
  [EventType.SHIP]: 'Ship',
  [EventType.DRIVE]: 'Drive',
  [EventType.FLIGHT]: 'Flight',
  [EventType.CHECK_IN]: 'Check-in',
  [EventType.SIGHTSEEING]: 'Sightseeing',
  [EventType.RESTAURANT]: 'Restaurant'
};

export const EventTypeIcons = {
  [EventType.TAXI]: 'img/icons/taxi.png',
  [EventType.BUS]: 'img/icons/bus.png',
  [EventType.TRAIN]: 'img/icons/train.png',
  [EventType.SHIP]: 'img/icons/ship.png',
  [EventType.DRIVE]: 'img/icons/drive.png',
  [EventType.FLIGHT]: 'img/icons/flight.png',
  [EventType.CHECK_IN]: 'img/icons/check-in.png',
  [EventType.SIGHTSEEING]: 'img/icons/sightseeing.png',
  [EventType.RESTAURANT]: 'img/icons/restaurant.png'
};

export const DESTINATIONS = [
  'Amsterdam',
  'Geneva',
  'Chamonix',
  'London',
  'Paris',
  'Berlin',
  'Rome',
  'Madrid',
  'Vienna',
  'Prague'
];

export const OFFER_TITLES = [
  'Add luggage',
  'Switch to comfort class',
  'Add meal',
  'Choose seats',
  'Travel by train',
  'Order Uber',
  'Rent a car',
  'Add breakfast',
  'Book tickets',
  'Lunch in city'
];

export const DESCRIPTION_SENTENCES = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Cras aliquet varius magna, non porta ligula feugiat eget.',
  'Fusce tristique felis at fermentum pharetra.',
  'Aliquam id orci ut lectus varius viverra.',
  'Nullam nunc ex, convallis sed finibus eget, sollicitudin eget ante.',
  'Phasellus eros mauris, condimentum sed nibh vitae, sodales efficitur ipsum.',
  'Sed blandit, eros vel aliquam faucibus, purus ex euismod diam, eu luctus nunc ante ut dui.',
  'Sed sed nisi sed augue convallis suscipit in sed felis.',
  'Aliquam erat volutpat.',
  'Nunc fermentum tortor ac porta dapibus.',
  'In rutrum ac purus sit amet tempus.'
];
