import AbstractView from '../framework/view/abstract-view.js';

const createEmptyEventsTemplate = () => (
  `<p class="trip-events__msg">
    Click New Event to create your first point
  </p>`
);

export default class EmptyEventsView extends AbstractView {
  get template() {
    return createEmptyEventsTemplate();
  }
}
