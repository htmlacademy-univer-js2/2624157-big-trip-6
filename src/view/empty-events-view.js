import AbstractView from '../framework/view/abstract-view.js';

const createEmptyEventsTemplate = (filterType, customMessage) => {
  const messages = {
    everything: 'Click New Event to create your first point',
    future: 'There are no future events now',
    present: 'There are no present events now',
    past: 'There are no past events now'
  };
  const message = customMessage || messages[filterType] || messages.everything;
  return `<p class="trip-events__msg">${message}</p>`;
};

export default class EmptyEventsView extends AbstractView {
  #filterType = 'everything';
  #customMessage = null;

  constructor({ filterType = 'everything', message = null } = {}) {
    super();
    this.#filterType = filterType;
    this.#customMessage = message;
  }

  get template() {
    return createEmptyEventsTemplate(this.#filterType, this.#customMessage);
  }
}
