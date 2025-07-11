import merge from 'lodash/merge';
import isEqual from 'lodash/isEqual';

import * as api from 'api';
import * as store from 'model/store.js';
import * as handler from 'model/handler.js';
import * as alert from 'view/alert.js';
import { getDefaultBoardAndListFromStorage } from './utils.js';

const DEFAULT_SYNC_ERROR_MSG = `Erro durante a sincronização dos dados. Verifique se as credenciais informadas nas <a href="#" class="btn-open-extension-option">opções</a> estão corretas e se o quadro e a lista padrão foram informados. Caso positivo, tente novamente mais tarde, pois os servidores podem estar fora do ar. Se o problema persistir, entre em contato com o suporte.`;

const doRefreshCards = async (processNumber) => {
  const { defaultBoard } = await getDefaultBoardAndList();

  /* Primeiro, busca todos os cartões do quadro padrão. */
  const { data: boardLists } = await api.searchBoardCards(defaultBoard);
  const foundCards = handler.getCardsFromBoard(boardLists, defaultBoard);
  
  /* Depois, busca todos os cartões de todos os quadros pelo método search (que tem delay/cache) */
  const {
    data: { cards: searchedCards },
  } = await api.searchCards(processNumber);

  /**
   * Adiciona os cartões localizados pelo método search aos cartões previamente encontrados no cartão
   * (somente os que já não existirem)
   */

  for (const searchedCard of searchedCards) {
    const foundCard = foundCards.find((boardCard) => boardCard.id === searchedCard.id);
    if (!foundCard) foundCards.push(searchedCard);
  }

  /* Converte o padrão retornado pela API do trello no formato da store */
  const storeCards = handler.getCards(foundCards, processNumber);

  store.setCards(storeCards);
};

export const doRefreshCardsWithID = (cardID) => {
  return new Promise((resolve, reject) => {
    api
      .getCardData(cardID)
      .then((response) => {
        store.updateCardsWithID(cardID, handler.getCards([response.data]));
        resolve();
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status !== undefined && error.response.status === 404) {
          /* cartão não existe mais, removê-lo da lista */
          store.updateCardsWithID(cardID, []);
          resolve();
        } else {
          reject(error);
        }
      });
  });
};

const doCreateCard = (options) => {
  return new Promise((resolve, reject) => {
    api
      .createCard(options)
      .then((response) => {
        store.addCards(
          handler.getCards([response.data]).map((card) => {
            card.location.list = options.defaultList;
            card.location.board = options.defaultBoard;
            return card;
          })
        );
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getDefaultBoardAndList = async () => {
  const { defaultBoardName, defaultListName } = await getDefaultBoardAndListFromStorage();
  const {
    data: { boards },
  } = await api.searchBoardsByName(defaultBoardName);
  const defaultBoard = boards.find((board) => board.name.trim() === defaultBoardName.trim());
  if (defaultBoard) {
    const {
      data: { lists },
    } = await api.getListsFromBoard(defaultBoard.id);
    const defaultList = lists.find((list) => list.name.trim() === defaultListName.trim());
    if (defaultList) {
      return {
        defaultBoard: defaultBoard,
        defaultList: defaultList,
      };
    } else {
      try {
        const { data: createdList } = await api.createList(defaultBoard.id, defaultListName);
        return {
          defaultBoard: defaultBoard,
          defaultList: createdList,
        };
      } catch (e) {
        throw new Error('lista padrão não encontrada e não foi possível criá-la');
      }
    }
  } else {
    try {
      const { data: createdBoard } = await api.createBoard(defaultBoardName);
      const { data: createdList } = await api.createList(createdBoard.id, defaultListName);
      return {
        defaultBoard: createdBoard,
        defaultList: createdList,
      };
    } catch (e) {
      throw new Error('quadro padrão não encontrado e não foi possível criá-lo');
    }
  }
};

export const refreshCardData = (cardID) => {
  store.updateCardsData(cardID, { isLoading: true });
  doRefreshCardsWithID(cardID).catch((error) => {
    store.setIsLoading(false);
    console.log(error);
    alert.error(DEFAULT_SYNC_ERROR_MSG);
  });
};

export const refreshCards = (processNumber) => {
  store.setIsLoading(true);
  doRefreshCards(processNumber)
    .then(() => {
      store.setIsLoading(false);
    })
    .catch((error) => {
      store.setIsLoading(false);
      console.log(error);
      alert.error(DEFAULT_SYNC_ERROR_MSG);
      store.resetData();
    });
};

export const updateCardData = (cardID, newCardData) => {
  Object.assign(newCardData, { isLoading: true });
  store.updateCardsData(cardID, newCardData);
  const trelloData = {};

  /* adicionar os processos na descrição nova */
  if ('description' in newCardData) {
    if ((newCardData.appendNumberOnTitle == undefined) || (newCardData.appendNumberOnTitle === true)) {
      // Monta um array com o número dos processos que não estão presentes na nova descrição
      let processNumbers = store.getAllProcesssFromCardID(cardID).filter((processNumber) => !newCardData['description'].includes(processNumber)).map((processNumber) => 'SEI ' + processNumber);
      if (processNumbers.length > 0) {
        trelloData['desc'] = processNumbers.join('\n') + '\n' + newCardData['description'];
      } else {
        trelloData['desc'] = newCardData['description'];
      }
    } else {
      trelloData['desc'] = newCardData['description'];
    }
  }

  if ('name' in newCardData) trelloData['name'] = newCardData['name'];
  if ('due' in newCardData) trelloData['due'] = newCardData['due'] === null ? 'null' : newCardData['due'];
  if ('dueComplete' in newCardData) trelloData['dueComplete'] = newCardData['dueComplete'];

  if ('list' in newCardData) trelloData['idList'] = newCardData['list'].id;

  if ('board' in newCardData) trelloData['idBoard'] = newCardData['board'].id;

  api
    .updateCard(cardID, trelloData)
    .then(() => doRefreshCardsWithID(cardID))
    .catch((error) => {
      store.setIsLoading(false);
      console.log(error);
      alert.error('Erro ao atualizar o cartão.');
    });
};

export const addCardFor = (processNumber, newCardData, appendNumberOnTitle) => {
  const isAdding = store.getData().isAddingCardFor;
  const isLoading = store.getData().isLoading;
  if (isAdding || isLoading) return;
  store.setIsAddingFor(processNumber);
  let options = {
    name: processNumber,
    desc: '',
    processNumber: processNumber
  };
  if (appendNumberOnTitle) options.desc = 'SEI ' + processNumber;
  if ('name' in newCardData) options['name'] = newCardData['name'];
  if ('description' in newCardData) {
    options['desc'] += '\n' + newCardData['description'];
  }

  getDefaultBoardAndList()
    .then((response) => {
      options.defaultBoard = response.defaultBoard;
      options.defaultList = response.defaultList;
      doCreateCard(options)
        .then(() => {
          store.setIsAddingFor(null);
        })
        .catch((error) => {
          store.setIsAddingFor(null);
          console.log(error);
          alert.error(DEFAULT_SYNC_ERROR_MSG);
        });
    })
    .catch((error) => {
      store.setIsAddingFor(null);
      console.log(error);
      alert.error(
        'Ocorreu um erro ao adicionar o cartão. Verifique se você preencheu corretamente os dados do quadro e da lista padrão nas <a href="#" class="btn-open-extension-option">opções</a>.'
      );
    });
};

export const deleteCard = (cardID) => {
  store.updateCardsData(cardID, { isLoading: true });
  api
    .deleteCard(cardID)
    .then(() => { doRefreshCards(); doRefreshCardsWithID(cardID)})
    .catch((error) => {
      store.setIsLoading(false);
      console.log(error);
      alert.error('Ocorreu um erro ao remover o cartão.');
    });
};

export const updateFilter = (type, checked, key) => {
  let filter = merge({}, store.getData().filter);

  if (type === 'due') filter.due = checked ? key : null;

  if (type === 'labels') {
    if (checked) {
      if (!filter.labels) filter.labels = [];
      filter.labels.push(key);
    } else {
      if (filter.labels) {
        filter.labels = filter.labels.filter((label) => !isEqual(label, key));
        if (filter.labels.length === 0) filter.labels = null;
      }
    }
  }

  if (type === 'locations') {
    if (checked) {
      if (!filter.locations) filter.locations = [];
      filter.locations.push(key);
    } else {
      if (filter.locations) {
        filter.locations = filter.locations.filter((location) => !isEqual(location, key));
        if (filter.locations.length === 0) filter.locations = null;
      }
    }
  }

  if (type === 'processes') filter.processes = checked ? key : null;

  store.updateFilter(filter);
};
