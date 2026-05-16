import AbstractView from '../framework/view/abstract-view.js';
import dayjs from 'dayjs';

const createTripInfoTemplate = (route, startDate, endDate, totalPrice) => {
  const startFormatted = startDate ? dayjs(startDate).format('MMM D') : '';
  const endFormatted = endDate ? dayjs(endDate).format('MMM D') : '';
  const dateRange = startDate && endDate ? `${startFormatted}&nbsp;&mdash;&nbsp;${endFormatted}` : '';

  return `
    <div class="trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${route}</h1>
      </div>
      <p class="trip-info__dates">${dateRange}</p>
      <p class="trip-info__cost">
        Total: &euro;&nbsp;<span class="trip-info__cost-value">${totalPrice}</span>
      </p>
    </div>
  `;
};

export default class TripInfoView extends AbstractView {
  #route = '';
  #startDate = null;
  #endDate = null;
  #totalPrice = 0;

  constructor({ route, startDate, endDate, totalPrice }) {
    super();
    this.#route = route;
    this.#startDate = startDate;
    this.#endDate = endDate;
    this.#totalPrice = totalPrice;
  }

  get template() {
    return createTripInfoTemplate(this.#route, this.#startDate, this.#endDate, this.#totalPrice);
  }
}
