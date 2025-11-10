import DataTransfer from '../model/datatransfer.js';
import routesId from '../model/routes_id.js';
import { doRequestAPI } from './index.js';

export const searchCards = (processNumber) => {
  return doRequestAPI(routesId.searchCards.id, new DataTransfer().setCardDesc(processNumber));
};

export const searchBoardCards = (trelloBoard, processNumber) => {
  const data = new DataTransfer()
    .setBoardId(trelloBoard.id)
    .setProcessNumber(processNumber || '');

  return doRequestAPI(routesId.searchBoardCards.id, data);
};

export const getCardData = (cardID) => {
  return doRequestAPI(routesId.getCardData.id, new DataTransfer().setCardId(cardID));
};

export const createCard = (opts) => {
  return doRequestAPI(
    routesId.createCard.id, 
    new DataTransfer().setCardName(opts.name)
                      .setCardDesc(opts.desc)
                      .setCardProcessNumber(opts.processNumber)
                      .setCardList(opts.defaultList)
                      .setBoardId(opts.defaultBoard.id)
                      .setBoardName(opts.defaultBoard.name)
  );
};

export const updateCard = (cardID, opts) => {
  const dataTransfer = new DataTransfer()
                        .setCardId(cardID)
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
