import axios from 'axios';
import auth from './auth.js';
import { getRoute } from 'model/routes_store.js';

/**
 * Se estivermos no ambiente teste (e2e ou playground),
 * as requisições não alcançarão os servidores do Trello,
 * mas sim serão gerenciadas pelo MockedTrelloApi.
 */
if (process.env.NODE_ENV === 'test' || process.env.MOCKED_API === 'true') {
  const MockedApi = require('tests/e2e/MockedTrelloApi').default;
  window.MockedTrelloApi = MockedApi;
  MockedApi.setup();
}

export const doRequestAPI = async (routeId, dataTransfer) => {
  const route = await getRoute(routeId);
  const url = dataTransfer.transformString(route.url);
  const obj = JSON.parse(dataTransfer.transformString(route.body));
  const verb = route.verb;
  Object.assign(obj, auth.getCredentials());
  // Faz a requisição HTTP usando o verbo indicado
  return axios[verb.toLowerCase()](url, { params: obj });
};

export const setCredentials = auth.setCredentials;
export const getCredentials = auth.getCredentials;

export * from './board.js';
export * from './card.js';
export * from './checklist.js';
export * from './label.js';
