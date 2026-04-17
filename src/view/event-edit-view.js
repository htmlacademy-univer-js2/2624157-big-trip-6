import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { EventType, EventTypeLabels, EventTypeIcons } from '../const.js';
//import { formatDateTime, formatDateForInput } from '../utils/common.js';
import { formatDateTime, formatDateForInput } from '../utils/date.js';
import flatpickr from 'flatpickr';

const createEventEditTemplate = (state, destinations, offers, isNew = false) => {
  const { type, destinationId, dateFrom, dateTo, basePrice, selectedOffers } = state;
  const destination = destinations.find((dest) => dest.id === destinationId);
  const destinationName = destination ? destination.name : '';
  const availableOffers = offers.filter((offer) => offer.type === type);

  const typeItems = Object.values(EventType)
    .map((eventType) => `
      <div class="event__type-item">
        <input id="event-type-${eventType}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${eventType}" ${eventType === type ? 'checked' : ''}>
        <label class="event__type-label event__type-label--${eventType}" for="event-type-${eventType}-1">${EventTypeLabels[eventType]}</label>
      </div>
    `).join('');

  const destinationOptions = destinations
    .map((dest) => `<option value="${dest.name}"></option>`)
    .join('');

  const offerItems = availableOffers
    .map((offer) => `
      <div class="event__offer-selector">
        <input class="event__offer-checkbox visually-hidden" id="event-offer-${offer.id}-1" type="checkbox" name="event-offer-${offer.id}" ${selectedOffers.includes(offer.id) ? 'checked' : ''}>
        <label class="event__offer-label" for="event-offer-${offer.id}-1">
          <span class="event__offer-title">${offer.title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${offer.price}</span>
        </label>
      </div>
    `).join('');

  // Форматирование дат для input
  const dateFromValue = formatDateForInput(dateFrom);
  const dateToValue = formatDateForInput(dateTo);
  const dateFromDisplay = formatDateTime(dateFrom);
  const dateToDisplay = formatDateTime(dateTo);

  const resetButtonText = isNew ? 'Cancel' : 'Delete';

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="${EventTypeIcons[type]}" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${typeItems}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-1">
              ${EventTypeLabels[type]}
            </label>
            <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName}" list="destination-list-1">
            <datalist id="destination-list-1">
              ${destinationOptions}
            </datalist>
          </div>

          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${dateFromDisplay}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${dateToDisplay}">
          </div>

          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
          </div>

          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">${resetButtonText}</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>

        <section class="event__details">
          ${availableOffers.length > 0 ? `
            <section class="event__section event__section--offers">
              <h3 class="event__section-title event__section-title--offers">Offers</h3>
              <div class="event__available-offers">
                ${offerItems}
              </div>
            </section>
          ` : ''}

          ${destination && destination.description ? `
            <section class="event__section event__section--destination">
              <h3 class="event__section-title event__section-title--destination">Destination</h3>
              <p class="event__destination-description">${destination.description}</p>
              ${destination.pictures && destination.pictures.length > 0 ? `
                <div class="event__photos-container">
                  <div class="event__photos-tape">
                    ${destination.pictures.map(pic => `<img class="event__photo" src="${pic.src}" alt="${pic.description}">`).join('')}
                  </div>
                </div>
              ` : ''}
            </section>
          ` : ''}
        </section>
      </form>
    </li>
  `;
};
export default class EventEditView extends AbstractStatefulView {
  dateFromPicker = null;
  dateToPicker = null;

  constructor(event, destinations, offers, isNew = false) {
    super();
    this.destinations = destinations;
    this.offers = offers;
    this.isNew = isNew;
    this._callback = {};

    this._state = this.#parseState(event);
  }

  get template() {
    return createEventEditTemplate(this._state, this.destinations, this.offers, this.isNew);
  }

  #parseState(event) {
    return {
      type: event.type,
      destinationId: event.destination,
      dateFrom: new Date(event.dateFrom),
      dateTo: new Date(event.dateTo),
      basePrice: event.basePrice,
      selectedOffers: [...event.offers]
    };
  }

  reset(event) {
    this.updateElement(this.#parseState(event));
  }

  _restoreHandlers() {
    this.setFormSubmitHandler(this._callback.formSubmit);
    this.setRollupClickHandler(this._callback.rollupClick);
    this.setDeleteClickHandler(this._callback.deleteClick);
    this.setTypeChangeHandler(this._callback.typeChange);
    this.setDestinationChangeHandler(this._callback.destinationChange);
    this.setPriceChangeHandler(this._callback.priceChange);
    this.setDateChangeHandler(this._callback.dateChange);
    this.setOfferChangeHandler(this._callback.offerChange);
    this.#initDatePickers();
  }

  #initDatePickers() {
    if (this.dateFromPicker) {
      this.dateFromPicker.destroy();
      this.dateFromPicker = null;
    }
    if (this.dateToPicker) {
      this.dateToPicker.destroy();
      this.dateToPicker = null;
    }

    const dateFromInput = this.element.querySelector('#event-start-time-1');
    const dateToInput = this.element.querySelector('#event-end-time-1');

    if (!dateFromInput || !dateToInput) {
      return;
    }

    const commonConfig = {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      time_24hr: true,
      locale: { firstDayOfWeek: 1 }
    };

    this.dateFromPicker = flatpickr(dateFromInput, {
      ...commonConfig,
      defaultDate: this._state.dateFrom,
      onChange: (selectedDates) => {
        this.updateElement({ dateFrom: selectedDates[0] });
        this._callback.dateChange?.(this._state.dateFrom, this._state.dateTo);
      }
    });

    this.dateToPicker = flatpickr(dateToInput, {
      ...commonConfig,
      defaultDate: this._state.dateTo,
      minDate: this._state.dateFrom,
      onChange: (selectedDates) => {
        this.updateElement({ dateTo: selectedDates[0] });
        this._callback.dateChange?.(this._state.dateFrom, this._state.dateTo);
      }
    });
  }

  get rollupButton() {
    return this.element.querySelector('.event__rollup-btn');
  }

  setFormSubmitHandler(callback) {
    this._callback.formSubmit = callback;
    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
  }

  setRollupClickHandler(callback) {
    this._callback.rollupClick = callback;
    this.rollupButton.addEventListener('click', this.#rollupClickHandler);
  }

  setDeleteClickHandler(callback) {
    this._callback.deleteClick = callback;
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#deleteClickHandler);
  }

  setTypeChangeHandler(callback) {
    this._callback.typeChange = callback;
    this.element.querySelectorAll('.event__type-input').forEach((input) => {
      input.addEventListener('change', this.#typeChangeHandler);
    });
  }

  setDestinationChangeHandler(callback) {
    this._callback.destinationChange = callback;
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
  }

  setPriceChangeHandler(callback) {
    this._callback.priceChange = callback;
    this.element.querySelector('.event__input--price').addEventListener('input', this.#priceChangeHandler);
  }

  setDateChangeHandler(callback) {
    this._callback.dateChange = callback;
  }

  setOfferChangeHandler(callback) {
    this._callback.offerChange = callback;
    this.element.querySelectorAll('.event__offer-checkbox').forEach((checkbox) => {
      checkbox.addEventListener('change', this.#offerChangeHandler);
    });
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this._callback.formSubmit(this._state);
  };

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.rollupClick();
  };

  #deleteClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.deleteClick();
  };

  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      type: evt.target.value,
      selectedOffers: []
    });
    this._callback.typeChange(this._state.type);
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();
    const destination = this.destinations.find((dest) => dest.name === evt.target.value);
    if (destination) {
      this.updateElement({
        destinationId: destination.id
      });
      this._callback.destinationChange(this._state.destinationId);
    }
  };

  #priceChangeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      basePrice: parseInt(evt.target.value, 10)
    });
    this._callback.priceChange(this._state.basePrice);
  };

  #offerChangeHandler = (evt) => {
    evt.preventDefault();
    const offerId = evt.target.id.replace('event-offer-', '').replace('-1', '');
    let selectedOffers = [...this._state.selectedOffers];

    if (evt.target.checked) {
      selectedOffers.push(offerId);
    } else {
      selectedOffers = selectedOffers.filter((id) => id !== offerId);
    }

    this.updateElement({
      selectedOffers
    });
    this._callback.offerChange(this._state.selectedOffers);
  };
}
