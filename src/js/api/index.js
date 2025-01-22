import axios from 'axios';
import auth from './auth.js';
import { getRoute } from 'model/routes_store.js';
import { getObjectData, getArrayData } from 'model/objectconversion.js';

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
  const sendCookie = url.indexOf("api.trello.com") < 0;
  Object.assign(obj, auth.getCredentials());
  // console.log("Rota %o - %o", routeId, url);
  const originalResponse = await axios({
    method: verb.toLowerCase(),
    url: url,
    params: obj,
    withCredentials: sendCookie
  });

  console.log("Resposta original da rota %d: %o", routeId, originalResponse);
  // Faz a transformação da resposta
  let responseStruct;
  let newResponse;
  try {
    responseStruct = JSON.parse(route.response);
    newResponse = Array.isArray(responseStruct) ? getArrayData(responseStruct, originalResponse.data) : getObjectData(responseStruct, originalResponse.data);
    console.log("333 Resposta transformada da rota %d: %o", routeId, newResponse);
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
