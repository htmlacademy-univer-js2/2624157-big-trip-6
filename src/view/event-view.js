import AbstractView from '../framework/view/abstract-view.js';
import { EventTypeIcons, EventTypeLabels } from '../const.js';
import { formatEventDate, formatTime, formatDuration } from '../utils/common.js';

const createOfferTemplate = (offer) => {
  if (!offer) return '';

  return `
    <li class="event__offer">
      <span class="event__offer-title">${offer.title}</span>
      &plus;&euro;&nbsp;
      <span class="event__offer-price">${offer.price}</span>
    </li>
  `;
};

const createEventTemplate = (event, destination, offers) => {
  const { type, dateFrom, dateTo, basePrice, isFavorite } = event;
  const destinationName = destination ? destination.name : '';
  const selectedOffers = offers
    .filter((offer) => event.offers.includes(offer.id))
    .map((offer) => createOfferTemplate(offer))
    .join('');

  const favoriteClass = isFavorite ? 'event__favorite-btn--active' : '';

  return `<li class="trip-events__item">
    <div class="event">
      <time class="event__date" datetime="${dateFrom.toISOString()}">${formatEventDate(dateFrom)}</time>
      <div class="event__type">
        <img class="event__type-icon" width="42" height="42" src="${EventTypeIcons[type]}" alt="Event type icon">
      </div>
      <h3 class="event__title">${EventTypeLabels[type]} ${destinationName}</h3>
      <div class="event__schedule">
        <p class="event__time">
          <time class="event__start-time" datetime="${dateFrom.toISOString()}">${formatTime(dateFrom)}</time>
          &mdash;
          <time class="event__end-time" datetime="${dateTo.toISOString()}">${formatTime(dateTo)}</time>
        </p>
        <p class="event__duration">${formatDuration(dateFrom, dateTo)}</p>
      </div>
      <p class="event__price">
        &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
      </p>
      ${selectedOffers ? `
        <h4 class="visually-hidden">Offers:</h4>
        <ul class="event__selected-offers">
          ${selectedOffers}
        </ul>
      ` : ''}
      <button class="event__favorite-btn ${favoriteClass}" type="button">
        <span class="visually-hidden">Add to favorite</span>
        <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
          <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
        </svg>
      </button>
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    </div>
  </li>`;
};

export default class EventView extends AbstractView {
  constructor(event, destinations, offers) {
    super();
    this.event = event;
    this.destinations = destinations;
    this.offers = offers;
  }

  get template() {
    const destination = this.destinations.find((dest) => dest.id === this.event.destination);
    return createEventTemplate(this.event, destination, this.offers);
  }

  get rollupButton() {
    return this.element.querySelector('.event__rollup-btn');
  }

  setEditClickHandler(callback) {
    this._callback.editClick = callback;
    this.rollupButton.addEventListener('click', this.#editClickHandler);
  }

  setFavoriteClickHandler(callback) {
    this._callback.favoriteClick = callback;
    this.element.querySelector('.event__favorite-btn').addEventListener('click', this.#favoriteClickHandler);
  }

  #editClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.editClick();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.favoriteClick();
  };
}
