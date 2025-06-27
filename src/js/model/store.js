import isEqual from 'lodash/isEqual';
import merge from 'lodash/merge';

let initialData = {
  isLoading: false,
  isAddingCardFor: null,
  cards: [],
  filter: {
    locations: null,
    labels: null,
    due: null,
    processes: null,
  },
  currentLabels: [],
  currentLocations: [],
  canChangeBoard: false,
  appendNumberOnTitle: false,
  showCard: false,
  moveChecklistItem: false
};

let data = Object.assign({}, initialData);

let events = [];

const triggerEvent = (type) => {
  events.forEach((event) => {
    if (event.type === type) {
      setTimeout(() => {
        event.callback();
      }, 10);
    }
  });
};

export const clearEvents = () => {
  events = [];
};

export const getData = () => {
  return data;
};

export const resetData = () => {
  data = Object.assign({}, initialData);
};

export const setCards = (cards) => {
  data.cards = cards;
  triggerEvent('onDataChanged');
};

export const updateCardsWithID = (cardID, updatedCards) => {
  // Acha a posição do cartão na lista de cartões
  let cardIndex = data.cards.findIndex((card) => card.cardID === cardID);
  // Se o cartão foi encontrado, atualiza ele
  if (cardIndex !== -1) {
    if (updatedCards.length > 0) {
      data.cards[cardIndex] = updatedCards[0];
    }
    triggerEvent('onDataChanged');
  }
};

export const addCards = (newCards) => {
  data.cards = data.cards.concat(newCards);
  triggerEvent('onDataChanged');
};

export const onDataChanged = (fn) => {
  events.push({
    type: 'onDataChanged',
    callback: fn,
  });
};

export const setIsLoading = (isLoading) => {
  data.isLoading = isLoading;
  data.cards.forEach((card) => {
    card.isLoading = isLoading;
  });
  triggerEvent('onDataChanged');
};

export const setIsAddingFor = (processNumber) => {
  if (!processNumber) {
    data.isLoading = false;
    data.isAddingCardFor = null;
  } else {
    data.isLoading = true;
    data.isAddingCardFor = processNumber;
  }
  triggerEvent('onDataChanged');
};

export const getAllProcesssFromCardID = (cardID) => {
  return data.cards.filter((card) => card.cardID === cardID).map((card) => card.processNumber);
};

export const updateCardsData = (cardID, newData) => {
  data.cards.filter((card) => card.cardID === cardID).map((card) => merge(card, newData));
  triggerEvent('onDataChanged');
};

export const setCurrentLabels = (labels) => {
  if (!isEqual(labels, data.currentLabels)) {
    /* prevent infinite loop */
    data.currentLabels = labels;
    triggerEvent('onDataChanged');
  }
};

export const setCurrentLocations = (locations) => {
  if (!isEqual(locations, data.currentLocations)) {
    /* prevent infinite loop */
    data.currentLocations = locations;
    triggerEvent('onDataChanged');
  }
};

export const updateFilter = (newFilter) => {
  if (!isEqual(newFilter, data.filter)) {
    /* prevent infinite loop */
    data.filter = newFilter;
    triggerEvent('onDataChanged');
  }
};

export const setCanChangeBoard = (canChangeBoard, triggerEvent = false) => {
  if (data.canChangeBoard !== canChangeBoard) {
    data.canChangeBoard = canChangeBoard;
    if (triggerEvent) triggerEvent('onDataChanged');
  }
};

export const setAppendNumberOnTitle = (appendNumberOnTitle, triggerEvent = false) => {
  if (data.appendNumberOnTitle !== appendNumberOnTitle) {
    data.appendNumberOnTitle = appendNumberOnTitle;
    if (triggerEvent) triggerEvent('onDataChanged');
  }
};

export const setShowCard = (isExpanded, triggerEvent = false) => {
  if (data.isExpanded !== isExpanded) {
    data.isExpanded = isExpanded;
    if (triggerEvent) triggerEvent('onDataChanged');
  }
};

export const setMoveChecklistItem = (moveChecklistItem, triggerEvent = false) => {
  console.log("Changing moveChecklistItem to", moveChecklistItem);
  if (data.moveChecklistItem !== moveChecklistItem) {
    data.moveChecklistItem = moveChecklistItem;
    if (triggerEvent) triggerEvent('onDataChanged');
  }
};