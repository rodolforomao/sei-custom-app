import DataTransfer from '../model/datatransfer.js';
import routesId from '../model/routes_id.js';
import { doRequestAPI } from './index.js';

export const searchCards = (processNumber) => {
  return doRequestAPI(routesId.searchCards.id, new DataTransfer().setCardDesc(processNumber));
};

export const searchBoardCards = (trelloBoard) => {
  return doRequestAPI(routesId.searchBoardCards.id, new DataTransfer().setBoardId(trelloBoard.id));
};

export const getCardData = (cardID) => {
  return doRequestAPI(routesId.getCardData.id, new DataTransfer().setCardId(cardID));
};

export const createCard = (opts) => {
  return doRequestAPI(routesId.createCard.id, new DataTransfer().setCardName(opts.name).setCardDesc(opts.desc).setCardList(opts.defaultList));
};

export const updateCard = (cardID, opts) => {
  const dataTransfer = new DataTransfer()
                        .setCardDesc(opts.desc)
                        .setCardName(opts.name)
                        .setCardDue(opts.due)
                        .setCardDueComplete(opts.dueComplete)
                        .setListId(opts.idList)
                        .setBoardId(opts.idBoard);
  
  return doRequestAPI(routesId.updateCard.id, dataTransfer);
};

export const deleteCard = (cardID) => {
  return doRequestAPI(routesId.deleteCard.id, new DataTransfer().setCardId(cardID));
};
