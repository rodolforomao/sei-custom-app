import axios from 'axios';
import auth from './auth.js';
import { getRoute } from 'model/routes_store.js';
import { getObjectData, getArrayData } from 'model/objectconversion.js';
import { reAuthenticateOAuth } from '../actions/oauth_util.js';

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

/**
 * 
 * Função que concentra todas as requisições para a API do backend, todos os requests feitos passam por este método.
 * 
 * @param {int} routeId Valor inteiro indicando o ID da rota que será utilizada na requisição. Para saber mais sobre o ID das rotas, consulte o arquivo routes_id.js.
 * @param {DataTransfer} dataTransfer Objeto DataTransfer que contém os dados que serão utilizados na requisição.
 * @returns {Object} Retorna um objeto com os dados da requisição e a resposta do servidor.
 * 
 */
export const doRequestAPI = async (routeId, dataTransfer) => {
  const route = await getRoute(routeId);
  // Monta a URL e o objeto de requisição já trocando os placeholders pelos valores corretos
  const url = dataTransfer.transformString(route.url);
  console.log("[INICIO] Rota %o - %o", routeId, url);
  const obj = JSON.parse(dataTransfer.transformString(route.body));
  // Monta as outras variáveis que serão usadas na requisição
  const verb = route.verb.toLowerCase();
  let headers = {};
  const sendCookie = await shouldSendCookie;
  if (!sendCookie) { Object.assign(obj, auth.getCredentials()); }
  else { headers = { Authorization: `Bearer ${await getToken()}` }; }
  // Monta as variáveis que serão enviadas pela URL
  const params = verb === "get" ? obj : {};
  // Monta as variáveis que serão enviadas no corpo (body) da requisição
  const data = verb !== "get" ? obj : {};
  let originalResponse;
  try {
    // console.log(`[REQUEST CONFIG] Verb: ${verb} / Credentials: ${sendCookie} / URL Params: ${Object.keys(params).length > 0} / Body Data: ${Object.keys(data).length > 0}`);
    originalResponse = await sendRequest(url, verb, params, data, headers, sendCookie, true);
    // console.log("Resposta original da rota %d: %o", routeId, originalResponse);
    // Faz a transformação da resposta de acordo com a configuração da rota
    let responseStruct = JSON.parse(route.response);
    let newResponse = Array.isArray(responseStruct) ? getArrayData(responseStruct, originalResponse.data) : getObjectData(responseStruct, originalResponse.data);
    // Troca o objeto 'data' da resposta original pelo novo objeto transformado
    originalResponse.data = newResponse;
    // console.log("Resposta transformada da rota %d: %o", routeId, newResponse);
  } catch (e) {
    console.log("Ocorreu um erro ao tentar fazer a requisição para o servidor na rota %d: %o", routeId, e);
    return null;
  }
  console.log("[FIM] Rota %o - %o", routeId, url);
  return originalResponse;
};

/**
 * 
 * Função para recuperar a configuração de envio de cookies.
 * 
 * @returns {Promise} Retorna uma Promise que resolve para true se o cookie deve ser enviado, false caso contrário.
 * 
 */
async function shouldSendCookie() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      {
        defaultCheckCookies: true
      },
      (items) => {
        resolve(items.defaultCheckCookies);
      }
    );
  });
}

/**
 * Função utilizada para recuperar o token de autorização do usuário.
 * 
 * @returns {Promise} Retorna uma Promise que resolve para o token de autorização do usuário.
 * 
 */
async function getToken() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      {
        appOauthToken: ''
      },
      (items) => {
        resolve(items.appOauthToken);
      }
    );
  });
}

/**
 * 
 * Função que de fato faz a requisição para o backend, utilizando o axios.
 * 
 * @param {string} url URL que será utilizada para fazer a requisição. 
 * @param {string} method Indicação de qual método HTTP será utilizado na requisição. 
 * @param {Object} params Objeto com os parâmetros que serão enviados na URL da requisição.
 * @param {Object} data Objeto com os dados que serão enviados no corpo (body) da requisição.
 * @param {Object} headers Objeto com os cabeçalhos (headers) que serão enviados na requisição.
 * @param {boolean} withCredentials True se a requisição deve ser feita com os cookies, false caso contrário.
 * @param {boolean} shouldRetry True caso queira tentar novamente a requisição em caso de erro 401 (não autorizado), false caso contrário.
 * @returns {Object} Retorna um objeto com os dados da requisição e a resposta do servidor.
 * 
 */
const sendRequest = async (url, method, params, data, headers, withCredentials, shouldRetry = false) => {
  try {
    // Tenta fazer a requisição para o backend com os dados passados
    const httpResponse = await axios({
      url: url,
      method: method,
      params: params,
      data: data,
      headers: headers,
      withCredentials: withCredentials
    });
    return httpResponse;
  } catch (e) {
    // console.log("Erro ao tentar enviar requisição: %o", e);
    // Se deu erro, vamos verificar se o erro foi 401 (não autorizado) e se devemos tentar novamente
    if (shouldRetry && e.response && e.response.status && e.response.status === 401) {
      if (!confirm("Sua sessão expirou. Deseja fazer login novamente?"))
        return null;
      // Faz a autenticação novamente e refaz a requisição
      await reAuthenticateOAuth();
      return await sendRequest(url, method, params, data, headers, withCredentials, false);
    }
    // Se não for 401, ou se não quis fazer login novamente, retorna o erro
    console.log("Erro ao tentar enviar requisição: %o", e);
    return null;
  }
};

export const setCredentials = auth.setCredentials;
export const getCredentials = auth.getCredentials;

export * from './board.js';
export * from './card.js';
export * from './checklist.js';
export * from './label.js';
