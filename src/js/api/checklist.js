import DataTransfer from '../model/datatransfer.js';
import routesId from '../model/routes_id.js';
import { doRequestAPI } from './index.js';

/* obter checklists */
export const getCardChecklistData = (cardID) => {
  return doRequestAPI(routesId.getCardChecklistData.id, new DataTransfer().setCardId(cardID));
};

/* cria uma checklist */
export const createCardChecklist = (cardID, checklistName) => {
  return doRequestAPI(routesId.createCardChecklist.id, new DataTransfer().setCardId(cardID).setCardChecklistName(checklistName));
};

/* adicionar item ao checklist */
export const createCardChecklistItem = (checklistID, opts) => {
  return doRequestAPI(routesId.createCardChecklistItem.id, new DataTransfer().setCardChecklistId(checklistID).setCardChecklistItemName(opts.name).setCardChecklistItemState(opts.state));
};

/* atualizar item do checklist */
export const updateCardChecklistItem = (cardID, checkItemID, opts) => {
  return doRequestAPI(routesId.updateCardChecklistItem.id, new DataTransfer().setCardId(cardID).setCardChecklistItemId(checkItemID).setCardChecklistItemName(opts.name).setCardChecklistItemState(opts.state));
};

/* atualizar item do checklist */
export const updateCardChecklistItemPosition = (cardID, checkItemID, opts) => {
  return doRequestAPI(routesId.updateCardChecklistItem.id, new DataTransfer().setCardId(cardID).setCardChecklistItemId(checkItemID).setCardChecklistItemPos(opts.pos));
};

/* remover item do checklist */
export const deleteCardChecklistItem = (checklistID, checkItemID) => {
  return doRequestAPI(routesId.deleteCardChecklistItem.id, new DataTransfer().setCardChecklistId(checklistID).setCardChecklistItemId(checkItemID));
};

/* remover uma checklist */
export const deleteCardChecklist = (checklistID) => {
  return doRequestAPI(routesId.deleteCardChecklist.id, new DataTransfer().setCardChecklistId(checklistID));
};
