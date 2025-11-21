import axios from 'axios';
import auth from './auth.js';
import { pluginContexts, pluginActions } from '../constants.js';
import { getRoute } from 'model/routes_store.js';
import { getObjectData, getArrayData } from 'model/objectconversion.js';
import { reAuthenticateOAuth } from '../actions/oauth_util.js';

/**
 * Variável que indica qual é o tipo de autenticação que será utilizada.
 */
let authType = '';

const TEST_AUTH = 'localtest';

/**
 * Função para mudar o tipo de autenticação que será utilizada.
 * 
 * @param {string} type Tipo de autenticação que será utilizada. Pode ser 'jwt' ou 'trello'.
 * 
 */
export const setAuthType = (type) => {
  authType = type;
};

/**
 * Se estivermos no ambiente teste (e2e ou playground),
 * as requisições não alcançarão os servidores do Trello,
 * mas sim serão gerenciadas pelo MockedTrelloApi.
 */
if (process.env.NODE_ENV === 'test' || process.env.MOCKED_API === 'true') {
  authType = TEST_AUTH;
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
  const urlBase = route.url;
  const url = dataTransfer.transformString(urlBase);

  // Monta o objeto que será enviado no body
  const obj = JSON.parse(dataTransfer.transformString(route.body));

  // Se houver dados adicionais em dataTransfer.data, mescla com o body
    if (dataTransfer.data?.processNumber) {
    obj.processNumber = dataTransfer.data.processNumber;
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[INICIO] Rota %o - %o", routeId, url);
    console.log("Body enviado:", obj);
  }

  const verb = route.verb.toLowerCase();
  let headers = {};
  let originalResponse;
  const sendCookie = await shouldSendCookie();
  try {
    // Ajusta o request para autenticação usando JWT
    if (authType === 'jwt') {
      if (!sendCookie) { headers = { Authorization: `Bearer ${await getToken()}` }; }
    }
    // Ajusta o request para autenticação usando Trello
    else if (authType === 'trello') {
      Object.assign(obj, auth.getCredentials());
    }
    // Se não foi identificada a autenticação
    else if (process.env.NODE_ENV !== 'test') {
      console.log("Tipo de autenticação não reconhecido: %o", authType);
      return null;
    }
    // Monta as variáveis que serão enviadas pela URL
    const params = verb === "get" ? obj : {};
    // Monta as variáveis que serão enviadas no corpo (body) da requisição
    const data = verb !== "get" ? obj : {};
    originalResponse = await sendRequest(url, verb, params, data, headers, sendCookie, true);
    if (process.env.NODE_ENV === 'development') {
      console.log("Resposta original da rota %d: %o", routeId, originalResponse);
    }
    // Faz a transformação da resposta de acordo com a configuração da rota
    let responseStruct = JSON.parse(route.response);
    // Verifica se a estrutura de resposta é um objeto com valor válido para fazer a conversão dos dados
    if (typeof responseStruct === 'object' && responseStruct !== null && Object.keys(responseStruct).length > 0) {
      // Se for um objeto, transforma os dados da resposta original de acordo com a estrutura definida
      let newResponse = Array.isArray(responseStruct) ? getArrayData(responseStruct, originalResponse.data) : getObjectData(responseStruct, originalResponse.data);
      // Troca o objeto 'data' da resposta original pelo novo objeto transformado
      originalResponse.data = newResponse;
      if (process.env.NODE_ENV === 'development') {
        console.log("Resposta transformada da rota %d: %o", routeId, newResponse);
      }
    }
  } catch (e) {
    console.log("Ocorreu um erro ao tentar fazer a requisição para o servidor na rota %d: %o", routeId, e);
    return null;
  }
  if (process.env.NODE_ENV === 'development') {
    console.log("[FIM] Rota %o - %o", routeId, url);
  }
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
  return new Promise((resolve, reject) => {
    const msgBackground = getBackgroundMessage({ saveTokenOnCookies: true }, pluginActions.getDataOnStorage);
    chrome.runtime.sendMessage(msgBackground, (response) => {
      if (response && response.success) {
        // console.log("Cookies resolved: %o", response.data.saveTokenOnCookies);
        resolve(response.data.saveTokenOnCookies);
      } else {
        // console.log("Cookies rejected");
        reject(new Error('Failed to send message to background script'));
      }
    })
  });
}

/**
 * Função utilizada para recuperar o token de autorização do usuário.
 * 
 * @returns {Promise} Retorna uma Promise que resolve para o token de autorização do usuário.
 * 
 */
async function getToken() {
  return new Promise((resolve, reject) => {
    console.log("Recuperando token de autenticação do usuário");
    const msgBackground = getBackgroundMessage({ appOauthToken: '' }, pluginActions.getDataOnStorage);
    chrome.runtime.sendMessage(msgBackground, (response) => {
      if (response && response.success) {
        console.log("Token de autenticação recuperado: %o", response.data.appOauthToken);
        resolve(response.data.appOauthToken);
      } else {
        console.log("Token de autenticação não recuperado");
        reject(new Error('Failed to send message to background script'));
      }
    })
  });
}


/**
 * 
 * Função que padroniza a criação da mensagem que será enviada para o background.
 *  
 * @param {Object} data Dados que serão enviados na mensagem.
 * @param {string} action Ação que será executada no background.
 * @return {Object} Retorna um objeto com os dados da mensagem.
 * 
 */
function getBackgroundMessage(data, action) {
  return {
    from: pluginContexts.options,
    action: action,
    data: data
  };
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
