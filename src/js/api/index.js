import axios from 'axios';
import auth from './auth.js';
import { getRoute } from 'model/routes_store.js';
import { getObjectData } from 'model/objectconversion.js';

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
  const originalResponse = await axios[verb.toLowerCase()](url, { params: obj }, { withCredentials: true });
  console.log("Resposta original da rota %d: %o", routeId, originalResponse);
  // Faz a transformação da resposta
  let responseStruct;
  let newResponse;
  try {
    responseStruct = JSON.parse(route.response);
    newResponse = getObjectData(responseStruct, originalResponse.data);
    console.log("222 Resposta transformada da rota %d: %o", routeId, newResponse);
    originalResponse.data = newResponse;
  } catch (e) {
    console.log("Ocorreu um erro ao tentar transformar a resposta da rota %d: %o", routeId, e);
    return null;
  }
  return originalResponse;
};

export const setCredentials = auth.setCredentials;
export const getCredentials = auth.getCredentials;

export * from './board.js';
export * from './card.js';
export * from './checklist.js';
export * from './label.js';
