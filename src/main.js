import TripPresenter from './presenter/trip-presenter.js';

console.log("Привет, это JS");

const siteMainElement = document.querySelector('.page-main');
const tripEventsContainer = siteMainElement.querySelector('.trip-events');

const tripPresenter = new TripPresenter(tripEventsContainer);
tripPresenter.init();
