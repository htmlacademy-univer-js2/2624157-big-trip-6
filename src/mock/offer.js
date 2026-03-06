import { EventType, OFFER_TITLES } from '../const.js';
import { getRandomInteger, getRandomArrayElement } from '../utils/common.js';

const typeSpecificOffers = {
  [EventType.FLIGHT]: ['Extra legroom', 'Priority boarding', 'Window seat', 'Travel insurance'],
  [EventType.TRAIN]: ['First class', 'Quiet carriage', 'Bike reservation', 'Power outlet'],
  [EventType.TAXI]: ['Child seat', 'Extra luggage', 'Waiting time', 'Phone charger'],
  [EventType.BUS]: ['WiFi', 'USB socket', 'Toilet nearby', 'Extra legroom'],
  [EventType.CHECK_IN]: ['Late checkout', 'Early check-in', 'Room upgrade', 'Breakfast included'],
  [EventType.SIGHTSEEING]: ['Audio guide', 'Private tour', 'Skip the line', 'Photo session'],
  [EventType.RESTAURANT]: ['Window table', 'Wine pairing', 'Private dining', 'Chef\'s special'],
};

export const generateOffers = () => {
  const offers = [];
  let offerId = 1;

  Object.values(EventType).forEach((type) => {
    const offerCount = getRandomInteger(4, 8);

    const specificOffers = typeSpecificOffers[type] || [];
    const allPossibleTitles = [...OFFER_TITLES, ...specificOffers];

    for (let i = 0; i < offerCount; i++) {
      offers.push({
        id: `offer-${offerId++}`,
        type,
        title: allPossibleTitles[i % allPossibleTitles.length] + (i > 2 ? ` ${i}` : ''),
        price: getRandomInteger(5, 200) * (i + 1)
      });
    }
  });

  return offers;
};

export const getOffersByType = (offers, type) =>
  offers.filter((offer) => offer.type === type);

export const getOfferById = (offers, id) =>
  offers.find((offer) => offer.id === id);
