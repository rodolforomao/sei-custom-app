import axios from 'axios';
import auth from './auth.js';
import * as alert from 'view/alert.js';
import { getRoute } from 'model/routes_store.js';
import { getObjectData, getArrayData } from 'model/objectconversion.js';
import { openJWTPopup } from "../actions/jwt_authentication.js";

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
  // Monta a URL e o objeto de requisição já trocando os placeholders pelos valores corretos
  const route = await getRoute(routeId);
  const url = dataTransfer.transformString(route.url);
  console.log("[INICIO] Rota %o - %o", routeId, url);
  const obj = JSON.parse(dataTransfer.transformString(route.body));
  // Monta as outras variáveis que serão usadas na requisição
  const verb = route.verb.toLowerCase();
  const sendCookie = url.indexOf("api.trello.com") < 0;
  if (!sendCookie) {
    Object.assign(obj, auth.getCredentials());
  }
  // Monta as variáveis que serão enviadas pela URL
  const params = verb === "get" ? obj : {};
  // Monta as variáveis que serão enviadas no corpo (body) da requisição
  const data = verb !== "get" ? obj : {};

  console.log(`[REQUEST CONFIG] Verb: ${verb} / Credentials: ${sendCookie} / URL Params: ${Object.keys(params).length > 0} / Body Data: ${Object.keys(data).length > 0}`);
  let originalResponse = await sendRequest(url, verb, params, data, sendCookie, true);
  console.log("Resposta original da rota %d: %o", routeId, originalResponse);

  // Faz a transformação da resposta
  try {
    let responseStruct = JSON.parse(route.response);
    let newResponse = Array.isArray(responseStruct) ? getArrayData(responseStruct, originalResponse.data) : getObjectData(responseStruct, originalResponse.data);
    console.log("Resposta transformada da rota %d: %o", routeId, newResponse);
    originalResponse.data = newResponse;
  } catch (e) {
    console.log("Ocorreu um erro ao tentar transformar a resposta da rota %d: %o", routeId, e);
    return null;
  }
  console.log("[FIM] Rota %o - %o", routeId, url);
  return originalResponse;
};

const sendRequest = async (url, method, params, data, withCredentials, shouldRetry = false) => {
  try {
    const httpResponse = await axios({
      url: url,
      method: method,
      params: params,
      data: data,
      withCredentials: withCredentials
    });
    return httpResponse;
  } catch (e) {
    console.log("Erro ao tentar enviar requisição: %o", e);
    if (e.response.status === 401 && shouldRetry) {
      if (!confirm("Sua sessão expirou. Deseja fazer login novamente?"))
        return null;
      const authUrl = await getAuthURL();
      await openJWTPopup(authUrl, null);
      return await sendRequest(url, method, params, data, withCredentials, false);
    }
    console.log("Erro ao tentar enviar requisição: %o", e);
    return null;
  }
};

const getAuthURL = async () => {
  let authUrl = '';
  try {
    authUrl = await new Promise((resolve, reject) => {
      chrome.storage.sync.get({ authUrl: '' }, (items) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          console.log("Items 2: %o", items);
          resolve(items.authUrl);
        }
      });
    });
    console.log("Auth URL is %o", authUrl);
    return authUrl;
  } catch (e) {
    console.log("Propagando o erro %o", e);
    throw e;
  }
};

export const setCredentials = auth.setCredentials;
export const getCredentials = auth.getCredentials;

export * from './board.js';
export * from './card.js';
export * from './checklist.js';
export * from './label.js';
