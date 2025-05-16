import { getOAuthCodes, getOauthToken } from "./actions/oauth_util.js";
import { pluginContexts, pluginActions } from "./constants.js";

/**
 * Adiciona novo ouvinte de mensagens para tratar as mensagens vindas de outros contextos do plugin.
 */
chrome.runtime.onMessage.addListener(handleNewMessage);

/**
 * Handler para mensagens recebidas do conteúdo ou da página de opções ou
 * do content script (scripts que o plugin injetou na página do SEI).
 * 
 * Como o plugin funciona com contextos diferentes (background, content e options),
 * algumas funcionalidades não estão disponíveis em todos os contextos, essas funcionalidades
 * são acessadas através de mensagens entre os contextos.
 * 
 * Esta função receberá uma mensagem e executará uma ação dependendo do conteúdo da mensagem.
 * 
 * @function addListener
 * @param {Object} msg - Mensagem recebida com as orientações de qual ação executar.
 * @param {string} msg.from - Origem da mensagem geralmente content ou options.
 * @param {string} msg.action - Identifica a ação a ser executada.
 * @param {Object} sender - Informações sobre o remetente da mensagem.
 * @param {function} sendResponse - Função que foi passada como argumento e que
 * será executada para mandar uma menagem de volta para o remetente.
 */
function handleNewMessage(msg, sender, sendResponse) {
  //console.log(`[Message received] Context: ${msg.from} - Action: ${msg.action}`);
  // Função responsável por recuperar o cookie armazenado no navegador.
  if (msg.from === pluginContexts.options && msg.action === pluginActions.getCookie) {
    handleGetCookie(msg, sendResponse);
    // Retorno obrigatório para manter a comunicação aberta com o plugin até terminar o processamento
    return true;
  }
  // Função responsável por salvar a URL de autenticação no storage do navegador.
  // Função responsável por fazer a autenticação do usuário usando OAuth 2.0.
  if (msg.from === pluginContexts.content && msg.action === pluginActions.getOAuthCodes) {
    handleGetOAuthCodes(sendResponse);
    // Retorno obrigatório para manter a comunicação aberta com o plugin até terminar o processamento
    return true;
  }
  // Função responsável por fazer a autenticação do usuário usando OAuth 2.0.
  if (msg.from === pluginContexts.content && msg.action === pluginActions.getOAuthToken) {
    handleGetOAuthToken(msg.code, msg.codeVerifier, sendResponse);
    // Retorno obrigatório para manter a comunicação aberta com o plugin até terminar o processamento
    return true;
  }
  // Função responsável por salvar dados no local storage do navegador.
  if ([pluginContexts.content, pluginContexts.options].includes(msg.from) && msg.action === pluginActions.saveDataOnStorage) {
    handleSaveData(msg.data, sendResponse);
    // Retorno obrigatório para manter a comunicação aberta com o plugin até terminar o processamento
    return true;
  }
  // Função responsável por recuperar dados do local storage do navegador.
  if ([pluginContexts.content, pluginContexts.options].includes(msg.from) && msg.action === pluginActions.getDataOnStorage) {
    handleGetData(msg.data, sendResponse);
    // Retorno obrigatório para manter a comunicação aberta com o plugin até terminar o processamento
    return true;
  }
  // Função responsável por salvar o cookie no navegador.
  if (msg.from === pluginContexts.content && msg.action === pluginActions.saveCookie) {
    handleSetCookie(msg, sendResponse);
    // Retorno obrigatório para manter a comunicação aberta com o plugin até terminar o processamento
    return true;
  }
}

/**
 * Função chamada quando o plugin necessita fazer a autenticação do usuário usando OAuth 2.0. Como
 * a autenticação via OAuth utiliza a API 'chrome.identity.launchWebAuthFlow()' que só está disponível
 * no background context, então essa função é chamada pelo content script quando necessita de autenticação.
 * 
 * Essa função realiza apenas a primeira parte da autenticação OAuth 2.0 que é a geração do código de autorização,
 * depois é necessário fazer uma requisição para o backend solicitando o Token JWT.
 * 
 * @param {function} sendResponse - Função utilizada para mandar a resposta de volta para o plugin após a autenticação.
 * A resposta para o plugin será um objeto contendo um campo 'success' que indica se a autenticação foi realizada com sucesso ou não
 * e um campo 'data' que contém os dados retornados pelo backend ou o erro caso a autenticação tenha falhado.
 * 
 */
function handleGetOAuthCodes(sendResponse) {
  //console.log("[WORKER-CODES] Solicitando os códigos de autenticação do backend.");
  // Recupera a URL de autenticação do backend configurado no plugin.
  getAuthURL()
    .then((authUrl) => {
      // Se conseguiu recuperar a URL com sucesso então chama a função openJWTPopup que irá abrir o popup de autenticação.
      getOAuthCodes(authUrl)
        .then((oauthCodes) => {
          // Neste ponto sabemos que a autenticação ocorreu com sucesso. Retorna os códigos para o plugin.
          sendResponse({ success: true, data: oauthCodes });
        })
        // Se o popup foi fechado ou ocorreu algum erro ao tentar autenticar, então retorna o erro para o plugin.
        .catch((e) => { sendResponse({ success: false, data: e }); });

    })
    // Se não conseguiu recuperar a URL de autenticação então retorna o erro para o plugin.
    .catch((e) => { sendResponse({ success: false, data: e }); });
}

/**
 * 
 * Função responsável por fazer a requisição para o backend solicitando o Token JWT.
 * 
 * @param {string} url URL que será usada para obter o token JWT.
 * @param {string} code Código de autorização retornado pelo backend após a autenticação do usuário.
 * @param {string} codeVerifier Verificador de código que é usado para validar o código de autorização e recuperar o token JWT.
 * @param {function} sendResponse Função que será chamada para enviar a resposta de volta para o plugin.
 * 
 */
async function handleGetOAuthToken(code, codeVerifier, sendResponse) {
  getTokenURL()
  .then((tokenUrl) => {
    // Se conseguiu recuperar a URL com sucesso então chama a função getOauthToken que irá abrir o popup de autenticação.
    getOauthToken(tokenUrl, code, codeVerifier)
      .then((oauthToken) => {
        // Neste ponto sabemos que a autenticação ocorreu com sucesso. Retorna os códigos para o plugin.
        sendResponse({ success: true, data: oauthToken });
      })
      // Se o popup foi fechado ou ocorreu algum erro ao tentar autenticar, então retorna o erro para o plugin.
      .catch((e) => { sendResponse({ success: false, data: e }); });
  });
}

/**
 * 
 * Função responsável por recuperar a URL de autenticação do backend configurada no plugin.
 * 
 * @returns {Promise} Uma Promise que será resolvida com a URL de autenticação do backend configurada no plugin
 * ou rejeitada com o erro ocorrido ao tentar recuperar a URL.
 * 
 */
function getAuthURL() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get({ authUrl: '' }, (items) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(items.authUrl);
      }
    });
  });
};

/**
 * 
 * Função responsável por recuperar a URL para pegar o Token JWT.
 * 
 * @returns {Promise} Uma Promise que será resolvida com a URL de autenticação do backend configurada no plugin
 * ou rejeitada com o erro ocorrido ao tentar recuperar a URL.
 * 
 */
function getTokenURL() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get({ tokenUrl: '' }, (items) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(items.tokenUrl);
      }
    });
  });
};

/**
 * 
 * Função responsável por armazenar os dados no local storage do navegador.
 * 
 * @param {Object} data Objeto com os dados que serão armazenados no local storage do navegador.
 * @param {function} sendResponse Função que será chamada para enviar a resposta de volta para o plugin.
 * 
 */
function handleSaveData(data, sendResponse) {
  chrome.storage.sync.set(data, () =>{
    if (chrome.runtime.lastError) {
      sendResponse({ success: false, data: chrome.runtime.lastError });
      return;
    }
    sendResponse({ success: true, data: "OK" });
  });
}

/**
 * 
 * Função responsável por recuperar os dados no local storage do navegador.
 * 
 * @param {Object} data Objeto com os dados que serão recuperados no local storage do navegador. Já deve ter o valor default caso a chave não seja encontrada no local storage.
 * @param {function} sendResponse Função que será chamada para enviar a resposta de volta para o plugin.
 * 
 */
function handleGetData(data, sendResponse) {
  chrome.storage.sync.get(data, (items) => {
    if (chrome.runtime.lastError) {
      sendResponse({ success: false, data: chrome.runtime.lastError });
      return;
    }
    sendResponse({ success: true, data: items });
  });
}

/**
 * 
 * Função responsável por armazenar o cookie no navegador.
 * 
 * @param {Object} msg Objeto com os dados que serão usados para recuperar o Cookie
 * @param {function} sendResponse Função que será chamada para enviar a resposta de volta para o plugin.
 * A resposta para o plugin será um objeto contendo um campo 'success' que indica se a autenticação foi realizada com sucesso ou não
 * e um campo 'data' que contém a string "OK" em caso de sucesso ou o erro ocorrido.
 * 
 */
function handleSetCookie(msg, sendResponse) {
  // Configuração do cookie que será armazenado
  const cookieConfig = {
    url: msg.domain,
    name: msg.name,
    value: encodeURIComponent(msg.value),
    expirationDate: msg.exp,
    secure: true,
    sameSite: "no_restriction",
    httpOnly: true
  };
  // Armazena o cookie e manda a resposta para o plugin
  chrome.cookies.set(cookieConfig, (cookie) => {
    if (!chrome.runtime.lastError) {
      sendResponse({ success: true, data: "OK" });
    } else {
      sendResponse({ success: false, data: chrome.runtime.lastError });
    }
  });
}

/**
 * 
 * Função responsável por recuperar o cookie armazenado no navegador.
 * 
 * @param {object} msg Objeto com os dados que serão usados para recuperar o Cookie
 * @param {function} sendResponse Função que será chamada para enviar a resposta de volta para o plugin.
 * A resposta para o plugin será um objeto contendo um campo 'success' que indica se a autenticação foi realizada com sucesso ou não
 * e um campo 'data' que contém o cookie ou o erro ocorrido.
 * 
 */
function handleGetCookie(msg, sendResponse) {
  chrome.cookies.get({ url: msg.domain, name: msg.name }, (cookie) => {
    if (!chrome.runtime.lastError) {
      sendResponse({ success: true, data: cookie });
    } else {
      sendResponse({ success: false, data: chrome.runtime.lastError });
    }
  });
}

/**
 * 
 * Função que armazena a URL utilizada para fazer o request para o backend e solicitar
 * os códigos de validação OAuth 2.0.
 * 
 * Importante, os seguintes parâmetros NÃO devem estar presesentes na URL pois são adicionados dinicamente:
 * - client_id
 * - response_type
 * - code_challenge
 * - code_challenge_method
 * 
 * @param {string} authUrl URL para recuperar os códigos da autenticação OAuth 2.0. 
 * 
 */
const saveAuthUrl = (authUrl) => {
  // Tenta salvar a URL de autenticação no storage do navegador
  return chrome.storage.sync.set({ authUrl: sanitizeUrl(authUrl) });
};

/**
 * 
 * Faz a sanitização da URL com as seguintes ações:
 * - Remover espaços em branco no início e no final da URL.
 * - Remove a barra (/) do final da URL caso exista.
 * 
 * @param {string} url URL a ser sanitizada.
 * @returns Remove espaços em branco no início e no final da URL e remove a barra (/) do final da URL caso exista.
 * 
 */
const sanitizeUrl = (url) => {
  url = url.trim();
  return url.endsWith("/") ? url.slice(0, -1) : url;
}