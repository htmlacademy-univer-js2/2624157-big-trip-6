// Сервер -> внутренний формат
export const adaptPointFromServer = (serverPoint) => ({
  id: serverPoint.id,
  type: serverPoint.type,
  destination: serverPoint.destination,
  dateFrom: new Date(serverPoint.date_from),
  dateTo: new Date(serverPoint.date_to),
  basePrice: serverPoint.base_price,
  offers: serverPoint.offers,
  isFavorite: serverPoint.is_favorite
});

// Внутренний формат -> сервер
export const adaptPointToServer = (point) => ({
  id: point.id,
  type: point.type,
  destination: point.destination,
  date_from: point.dateFrom.toISOString(),
  date_to: point.dateTo.toISOString(),
  base_price: point.basePrice,
  offers: point.offers,
  is_favorite: point.isFavorite
});

export const adaptDestinationsFromServer = (destinations) => destinations;
export const adaptOffersFromServer = (offers) => offers;
