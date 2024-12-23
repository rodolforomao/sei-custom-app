import DataTransfer from '../model/datatransfer.js';
import routesId from '../model/routes_id.js';
import { doRequestAPI } from './index.js';

export const searchBoardsByName = async (boardName) => {
  return doRequestAPI(routesId.searchBoardsByName.id, new DataTransfer().setBoardName(boardName));
};

export const searchAllBoards = async () => {
  return doRequestAPI(routesId.searchAllBoards.id, new DataTransfer());
};

export const getListsFromBoard = async (boardID) => {
  return doRequestAPI(routesId.getListsFromBoard.id, new DataTransfer().setBoardId(boardID));
};

export const createBoard = async (boardName) => {
  return doRequestAPI(routesId.searchBoardsByName.id, new DataTransfer().setBoardName(boardName));
};

export const createList = (boardID, listName) => {
  return doRequestAPI(routesId.createList.id, new DataTransfer().setBoardId(boardID).setListName(listName));
};