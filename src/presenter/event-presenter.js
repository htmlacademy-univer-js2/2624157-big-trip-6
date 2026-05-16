// src/presenter/event-presenter.js
import EventView from '../view/event-view.js';
import EventEditView from '../view/event-edit-view.js';
import { render, replace, remove } from '../framework/render.js';

export default class EventPresenter {
  #container = null;
  #event = null;
  #destinations = null;
  #offers = null;
  #eventComponent = null;
  #editComponent = null;
  #handleDataChange = null;
  #handleModeChange = null;
  #uiBlocker = null;
  #isEditMode = false;

  constructor({ container, onDataChange, onModeChange, uiBlocker }) {
    this.#container = container;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
    this.#uiBlocker = uiBlocker;
  }

  init(event, destinations, offers) {
    this.#event = event;
    this.#destinations = destinations;
    this.#offers = offers;

    const prevEventComponent = this.#eventComponent;
    const prevEditComponent = this.#editComponent;

    this.#eventComponent = new EventView(this.#event, this.#destinations, this.#offers);
    this.#editComponent = new EventEditView(this.#event, this.#destinations, this.#offers, false);

    this.#eventComponent.setEditClickHandler(() => {
      this.#replaceEventToEdit();
    });

    this.#eventComponent.setFavoriteClickHandler(() => {
      const updatedEvent = {
        ...this.#event,
        isFavorite: !this.#event.isFavorite
      };
      this.#handleDataChange(updatedEvent);
    });

    this.#editComponent.setFormSubmitHandler(async (state) => {
      const updatedEvent = {
        ...this.#event,
        type: state.type,
        destination: state.destinationId,
        dateFrom: state.dateFrom,
        dateTo: state.dateTo,
        basePrice: state.basePrice,
        offers: state.selectedOffers
      };

      this.#uiBlocker.block();
      this.#setSaveButtonState(true);
      try {
        await this.#handleDataChange(updatedEvent, false);
        this.#replaceEditToEvent();
      } catch (err) {
        this.#editComponent.shake();
      } finally {
        this.#uiBlocker.unblock();
        this.#setSaveButtonState(false);
      }
    });

    this.#editComponent.setRollupClickHandler(() => {
      this.#replaceEditToEvent();
    });

    this.#editComponent.setDeleteClickHandler(async () => {
      this.#uiBlocker.block();
      this.#setDeleteButtonState(true);
      try {
        await this.#handleDataChange(this.#event, true);
        // После успешного удаления компонент будет уничтожен при перерисовке списка
      } catch (err) {
        this.#editComponent.shake();
      } finally {
        this.#uiBlocker.unblock();
        // Восстанавливаем текст кнопки только если компонент ещё в DOM
        if (this.#editComponent && this.#editComponent.element && this.#editComponent.element.isConnected) {
          this.#setDeleteButtonState(false);
        }
      }
    });

    this.#editComponent.setTypeChangeHandler((type) => {
      console.log('Type changed to', type);
    });

    this.#editComponent.setDestinationChangeHandler((destinationId) => {
      console.log('Destination changed to', destinationId);
    });

    this.#editComponent.setPriceChangeHandler((price) => {
      console.log('Price changed to', price);
    });

    this.#editComponent.setDateChangeHandler((dateFrom, dateTo) => {
      console.log('Dates changed', dateFrom, dateTo);
    });

    this.#editComponent.setOfferChangeHandler((selectedOffers) => {
      console.log('Offers changed', selectedOffers);
    });

    if (prevEventComponent === null || prevEditComponent === null) {
      render(this.#eventComponent, this.#container);
      return;
    }

    if (this.#isEditMode) {
      replace(this.#editComponent, prevEditComponent);
      remove(prevEventComponent);
    } else {
      replace(this.#eventComponent, prevEventComponent);
      remove(prevEditComponent);
    }

    remove(prevEventComponent);
    remove(prevEditComponent);
  }

  destroy() {
    if (this.#eventComponent) {
      remove(this.#eventComponent);
    }
    if (this.#editComponent) {
      remove(this.#editComponent);
    }
  }

  resetView() {
    if (this.#isEditMode) {
      this.#replaceEditToEvent();
    }
  }

  #setSaveButtonState(isSaving) {
    const saveBtn = this.#editComponent.element.querySelector('.event__save-btn');
    if (saveBtn) {
      saveBtn.textContent = isSaving ? 'Saving...' : 'Save';
    }
  }

  #setDeleteButtonState(isDeleting) {
    const deleteBtn = this.#editComponent.element.querySelector('.event__reset-btn');
    if (deleteBtn) {
      deleteBtn.textContent = isDeleting ? 'Deleting...' : 'Delete';
    }
  }

  #replaceEventToEdit() {
    this.#handleModeChange();
    replace(this.#editComponent, this.#eventComponent);
    this.#isEditMode = true;
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  #replaceEditToEvent() {
    replace(this.#eventComponent, this.#editComponent);
    this.#isEditMode = false;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#replaceEditToEvent();
    }
  };
}
