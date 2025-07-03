import DataTransfer from '../model/datatransfer.js';
import routesId from '../model/routes_id.js';
import { doRequestAPI } from './index.js';

/* obter labels de um quadro */
export const getBoardLabels = (boardID, cardID) => {
  return doRequestAPI(routesId.getBoardLabels.id, new DataTransfer().setCardId(cardID).setBoardId(boardID));
};

/* adicionar label a um cartão  */
export const addLabelToCard = (cardID, labelID) => {
  return doRequestAPI(routesId.addLabelToCard.id, new DataTransfer().setCardId(cardID).setLabelId(labelID));
};

/* remover um label de um cartão  */
export const removeLabelFromCard = (cardID, labelID) => {
  return doRequestAPI(routesId.removeLabelFromCard.id, new DataTransfer().setCardId(cardID).setLabelId(labelID));
};

/* criar um label vinculado a um quadro  */
export const createLabel = (boardID, cardID, opts) => {
  return doRequestAPI(routesId.createLabel.id, new DataTransfer().setCardId(cardID).setBoardId(boardID).setLabelName(opts.name).setLabelColor(opts.color));
};

/* editar um label */
export const updateLabel = (labelID, opts) => {
  return doRequestAPI(routesId.updateLabel.id, new DataTransfer().setLabelId(labelID).setLabelName(opts.name).setLabelColor(opts.color));
};

/* deletar um label */
export const deleteLabel = (labelID) => {
  return doRequestAPI(routesId.deleteLabel.id, new DataTransfer().setLabelId(labelID));
};
