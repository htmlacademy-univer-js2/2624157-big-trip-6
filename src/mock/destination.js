import { DESTINATIONS, DESCRIPTION_SENTENCES } from '../const.js';
import { getRandomArrayElement, getRandomInteger } from '../utils/common.js';

const PHOTO_COUNTS = [3, 4, 5, 6];
const DESCRIPTION_COUNTS = [2, 3, 4, 5];
const getRandomArraySlice = (array, maxLength) => {
  const count = getRandomArrayElement(maxLength);
  return array.slice(0, count);
};
const generatePictures = () => {
  const count = getRandomArrayElement(PHOTO_COUNTS);
  return Array.from({ length: count }, (_, index) => ({
    src: `https://loremflickr.com/248/152?random=${getRandomInteger(1, 1000)}`,
    description: `Random photo ${index + 1}`
  }));
};
const generateDescription = (cityName) => {
  const specialDescriptions = {
    'Amsterdam': 'Amsterdam is known for its artistic heritage, elaborate canal system and narrow houses with gabled facades.',
    'Geneva': 'Geneva is a global city, a financial centre, and a worldwide centre for diplomacy due to the presence of numerous international organizations.',
    'Chamonix': 'Chamonix, nestled in the shadow of Mont Blanc, is a world-renowned destination for skiing, hiking, and mountain climbing.',
    'London': 'London, the capital of England and the United Kingdom, is a 21st-century city with history stretching back to Roman times.',
    'Paris': 'Paris, France\'s capital, is a major European city and a global center for art, fashion, gastronomy and culture.',
    'Berlin': 'Berlin, Germany\'s capital, dates to the 13th century. Reminders of the city\'s turbulent 20th-century history include its Holocaust memorial.',
    'Rome': 'Rome, Italy\'s capital, is a sprawling, cosmopolitan city with nearly 3,000 years of globally influential art, architecture and culture.',
    'Madrid': 'Madrid, Spain\'s central capital, is a city of elegant boulevards and expansive, maniculated parks such as the Buen Retiro.',
    'Vienna': 'Vienna, Austria\'s capital, lies in the country\'s east on the Danube River. Its artistic and intellectual legacy was shaped by residents.',
    'Prague': 'Prague, capital of the Czech Republic, is bisected by the Vltava River. Nicknamed "the City of a Hundred Spires," it\'s known for its Old Town.'
  };

  return specialDescriptions[cityName] || getRandomArraySlice(DESCRIPTION_SENTENCES, DESCRIPTION_COUNTS).join(' ');
};

export const generateDestinations = () => {
  const destinations = [];

  DESTINATIONS.forEach((name, index) => {
    destinations.push({
      id: `destination-${index + 1}`,
      name,
      description: generateDescription(name),
      pictures: generatePictures()
    });
  });

  return destinations;
};

export const getDestinationById = (destinations, id) =>
  destinations.find((destination) => destination.id === id);

export const getDestinationByName = (destinations, name) =>
  destinations.find((destination) => destination.name === name);
