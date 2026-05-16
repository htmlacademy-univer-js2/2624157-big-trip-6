// src/presenter/trip-presenter.js
import SortView from '../view/sort-view.js';
import EmptyEventsView from '../view/empty-events-view.js';
import EventPresenter from './event-presenter.js';
import { EventType } from '../const.js';
import { render, replace, remove } from '../framework/render.js';
import EventEditView from '../view/event-edit-view.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';

const createNewEvent = (destinations) => ({
  id: `new-event-${Date.now()}`,
  type: EventType.FLIGHT,
  destination: destinations[0]?.id || '',
  dateFrom: new Date(),
  dateTo: new Date(Date.now() + 3600000),
  basePrice: 0,
  offers: [],
  isFavorite: false
});

const SortType = {
  DAY: 'day',
  TIME: 'time',
  PRICE: 'price'
};

// Функции сортировки
const sortByDay = (events) => {
  return [...events].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
};

const sortByTime = (events) => {
  return [...events].sort((a, b) => {
    const durationA = new Date(a.dateTo) - new Date(a.dateFrom);
    const durationB = new Date(b.dateTo) - new Date(b.dateFrom);
    return durationB - durationA;
  });
};

const sortByPrice = (events) => {
  return [...events].sort((a, b) => b.basePrice - a.basePrice);
};

export default class TripPresenter {
  #container = null;
  #eventsModel = null;
  #filterModel = null;
  #sortView = null;
  #emptyView = null;
  #eventPresenters = new Map();
  #currentSort = SortType.DAY;
  #addButtonDisabled = false;
  #isLoading = true;
  #uiBlocker = new UiBlocker({ lowerLimit: 500, upperLimit: 1000 });

  constructor(container, eventsModel, filterModel) {
    if (!container) {
      throw new Error('Container is required for TripPresenter');
    }

    if (!eventsModel) {
      throw new Error('EventsModel is required for TripPresenter');
    }

    if (!filterModel) {
      throw new Error('FilterModel is required for TripPresenter');
    }
    this.#container = container;
    this.#eventsModel = eventsModel;
    this.#filterModel = filterModel;

    this.#eventsModel.addObserver(this.#handleModelUpdate.bind(this));
    this.#filterModel.addObserver(this.#handleFilterModelChange.bind(this));
  }

  async init() {
    this.#renderLoadingMessage();
    try {
      await this.#eventsModel.init();  // загрузка данных
    } catch (error) {
      // показать сообщение об ошибке загрузки (заглушка "Failed to load...")
      this.#renderError();
      return;
    }
    this.#isLoading = false;
    this.#renderEvents();
  }

  createNewEvent() {
    if (this.#addButtonDisabled) return;

    this.#addButtonDisabled = true;
    const addButton = document.querySelector('.trip-main__event-add-btn');
    if (addButton) addButton.disabled = true;

    // сбросить фильтр и сортировку
    this.#filterModel.setFilter('user', 'everything');
    this.#currentSort = SortType.DAY;

    // закрыть все открытые формы редактирования
    this.#handleModeChange();
    const destinations = this.#eventsModel.getDestinations();
    const offers = this.#eventsModel.getOffers();
    const newEvent = createNewEvent(destinations);
    this.#renderNewEvent(newEvent, destinations, offers);
  }

  #handleModelUpdate(updateType, data) {
    this.#renderEvents();
  }

  #renderSort() {
    if (this.#sortView) {
      remove(this.#sortView);
    }

    this.#sortView = new SortView(this.#currentSort);
    render(this.#sortView, this.#container);
    this.#sortView.setSortChangeHandler(this.#handleSortChange.bind(this));
  }

  #renderEmpty() {
    if (this.#emptyView) {
      remove(this.#emptyView);
    }
    const currentFilter = this.#filterModel.filter;
    this.#emptyView = new EmptyEventsView({ filterType: currentFilter });
    render(this.#emptyView, this.#container);
  }

  #renderEvents() {
    this.#clearEventsList();

    const currentFilter = this.#filterModel.filter;
    let events = this.#eventsModel.getFilteredEvents(currentFilter);

    events = this.#getSortedEvents(events);

    const destinations = this.#eventsModel.getDestinations();
    const offers = this.#eventsModel.getOffers();

    if (events.length === 0) {
      this.#renderEmpty();
      if (this.#sortView) {
        remove(this.#sortView);
        this.#sortView = null;
      }
      return;
    }

    if (!this.#sortView) {
      this.#renderSort();
    }

    events.forEach((event) => {
      this.#renderEvent(event, destinations, offers);
    });
  }

  #getSortedEvents(events) {
    switch (this.#currentSort) {
      case SortType.TIME:
        return sortByTime(events);
      case SortType.PRICE:
        return sortByPrice(events);
      default:
        return sortByDay(events);
    }
  }

  #clearEventsList() {
    this.#eventPresenters.forEach((presenter) => {
      presenter.destroy();
    });
    this.#eventPresenters.clear();

    if (this.#emptyView) {
      remove(this.#emptyView);
      this.#emptyView = null;
    }
  }

  #renderEvent(event, destinations, offers) {
    const eventPresenter = new EventPresenter({
      container: this.#container,
      onDataChange: this.#handleEventChange.bind(this),
      onModeChange: this.#handleModeChange.bind(this),
      uiBlocker: this.#uiBlocker
    });

    eventPresenter.init(event, destinations, offers);
    this.#eventPresenters.set(event.id, eventPresenter);
  }

  #renderNewEvent(event, destinations, offers) {
    const editComponent = new EventEditView(event, destinations, offers, true);

    const removeForm = () => {
      remove(editComponent);
      this.#addButtonDisabled = false;
      const addButton = document.querySelector('.trip-main__event-add-btn');
      if (addButton) addButton.disabled = false;
      document.removeEventListener('keydown', onEscKeyDown);
    };

    const onEscKeyDown = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        removeForm();
      }
    };
    document.addEventListener('keydown', onEscKeyDown);

    const setSaveButtonState = (isSaving) => {
      const saveBtn = editComponent.element.querySelector('.event__save-btn');
      if (saveBtn) {
        saveBtn.textContent = isSaving ? 'Saving...' : 'Save';
      }
    };

    editComponent.setFormSubmitHandler(async (state) => {
      const newEventData = {
        ...event,
        type: state.type,
        destination: state.destinationId,
        dateFrom: state.dateFrom,
        dateTo: state.dateTo,
        basePrice: state.basePrice,
        offers: state.selectedOffers
      };

      this.#uiBlocker.block();
      setSaveButtonState(true);
      try {
        await this.#eventsModel.addEvent(newEventData);
        removeForm();
      } catch (err) {
        editComponent.shake();
      } finally {
        this.#uiBlocker.unblock();
        setSaveButtonState(false);
      }
    });

    editComponent.setRollupClickHandler(() => {
      removeForm();
    });

    editComponent.setDeleteClickHandler(() => {
      removeForm();
    });

    editComponent.setTypeChangeHandler(() => {});
    editComponent.setDestinationChangeHandler(() => {});

    render(editComponent, this.#container);
  }

  #handleEventChange = async (updatedEvent, isDelete = false) => {
    try {
      if (isDelete) {
        await this.#eventsModel.deleteEvent(updatedEvent.id);
      } else {
        await this.#eventsModel.updateEvent(updatedEvent);
      }
    } catch (err) {
      throw err;
    }
  }

  #handleModeChange() {
    this.#eventPresenters.forEach((presenter) => {
      presenter.resetView();
    });
  }

  #handleSortChange(sortType) {
    if (this.#currentSort === sortType) {
      return;
    }

    this.#currentSort = sortType;
    this.#renderEvents();
  }

  #handleFilterModelChange(updateType, filterType) {
    if (this.#currentSort !== SortType.DAY) {
      this.#currentSort = SortType.DAY;
    }
    this.#renderEvents();
  }

  #renderLoadingMessage(){
    this.#emptyView = new EmptyEventsView({ message: 'Loading...' });
    render(this.#emptyView, this.#container);
  }

  #renderError(){
    this.#emptyView = new EmptyEventsView({ message: 'Failed to load latest route information' });
    render(this.#emptyView, this.#container);
  }
}
