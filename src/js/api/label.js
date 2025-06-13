import axios from 'axios';
import auth from './auth.js';
import DataTransfer from '../model/datatransfer.js';
import routesId from '../model/routes_id.js';
import { doRequestAPI } from './index.js';

/* obter labels de um quadro */
export const getBoardLabels = (boardID, cardID) => {
  console.log("[API] Obtendo labels do quadro:", boardID);
  return doRequestAPI(routesId.getBoardLabels.id, new DataTransfer().setCardId(cardID).setBoardId(boardID));
};

/* adicionar label a um cartão  */
export const addLabelToCard = (cardID, labelID) => {
  // const url = `https://api.trello.com/1/cards/${cardID}/idLabels`;
  const url = `http://teste.mock/cards/${cardID}/idLabels`;
  let params = Object.assign({}, auth.getCredentials(), {
    value: labelID,
  });
  return axios.post(url, params);
};

/* remover um label de um cartão  */
export const removeLabelFromCard = (cardID, labelID) => {
  // const url = `https://api.trello.com/1/cards/${cardID}/idLabels/${labelID}`;
  const url = `http://teste.mock/cards/${cardID}/idLabels/${labelID}`;
  let params = Object.assign({}, auth.getCredentials());
  return axios.delete(url, { params: params });
};

/* criar um label vinculado a um quadro  */
export const createLabel = (boardID, opts) => {
  if (opts.color === null) opts.color = 'null';
  // const url = `https://api.trello.com/1/labels`;
  const url = `http://teste.mock/labels`;
  let params = Object.assign({}, auth.getCredentials(), {
    idBoard: boardID,
    name: opts.name,
    color: opts.color,
  });
  return axios.post(url, params);
};

/* editar um label */
export const updateLabel = (labelID, opts) => {
  if (opts.color === null) opts.color = 'null';
  // const url = `https://api.trello.com/1/labels/${labelID}`;
  const url = `http://teste.mock/labels/${labelID}`;
  let params = Object.assign({}, auth.getCredentials(), opts);
  return axios.put(url, params);
};

/* deletar um label */
export const deleteLabel = (labelID) => {
  // const url = `https://api.trello.com/1/labels/${labelID}`;
  const url = `http://teste.mock/labels/${labelID}`;
  let params = Object.assign({}, auth.getCredentials());
  return axios.delete(url, { params: params });
};
