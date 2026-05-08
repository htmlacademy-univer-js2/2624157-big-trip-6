import TripPresenter from './presenter/trip-presenter.js';
import EventsModel from './model/events-model.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import 'flatpickr/dist/flatpickr.min.css';
import TripApiService from './trip-api-service.js';

const AUTHORIZATION = `Basic ${Math.random().toString(36).substr(2)}`;
const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';
const apiService = new TripApiService(END_POINT, AUTHORIZATION);

const eventsModel = new EventsModel(apiService);
const filterModel = new FilterModel();

const siteMainElement = document.querySelector('.page-main');
const tripEventsContainer = siteMainElement.querySelector('.trip-events');

const tripPresenter = new TripPresenter(tripEventsContainer, eventsModel, filterModel);
const filterPresenter = new FilterPresenter({
  container: document.querySelector('.trip-controls__filters'),
  filterModel,
  eventsModel,
  onFilterChange: () => {}
});

filterPresenter.init();
tripPresenter.init();

const addButton = document.querySelector('.trip-main__event-add-btn');
if (addButton) {
  addButton.addEventListener('click', () => {
    tripPresenter.createNewEvent();
  });
}
