import { pluginContexts, pluginActions } from '../constants.js';

const SIMA_TOKEN_NAME = "SIMA";
// const EXTENSION_ID = "inmniboeooddjgipkkodoageimggnbka"; // ID local
const EXTENSION_ID = "idgpfcigpineakeljpkhfbeilhagjgfa"; // ID da store


/**
 * 
 * Função responsável por abrir uma janela de autenticação para o usuário, utilizando o fluxo de autenticação OAuth 2.0 e retornar os códigos de autenticação.
 * 
 * @param {string} authUrl URL base para autenticação OAuth 2.0, os parâmetros 'response_type', 'client_id', 'code_challenge' e 'code_challenge_method' serão adicionados automaticamente.
 * @returns {Promise} Retorna uma Promise que resolve com o código de autenticação e o codeVerifier, ou rejeita com um erro caso ocorra algum problema.
 * 
 */
export const getOAuthCodes = async (authUrl) => {
    return new Promise(async (resolve, reject) => {
        // Gera os dois códigos necessários para a autenticação OAuth 2.0
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        // Monta a URL que será feito o request para o servidor de autenticação
        const fullAuthUrl = new URL(authUrl);
        fullAuthUrl.searchParams.set("response_type", "code");
        fullAuthUrl.searchParams.set("client_id", "chrome_extension");
        fullAuthUrl.searchParams.set("redirect_uri", `https%3A%2F%2F${EXTENSION_ID}.chromiumapp.org%2F`);
        fullAuthUrl.searchParams.set("code_challenge", codeChallenge);
        fullAuthUrl.searchParams.set("code_challenge_method", "S256");
        // Faz a configuração da janela de autenticação
        const authWindowConfig = {
            url: fullAuthUrl.toString(),
            interactive: true
        };
        // Faz a chamada para abrir a janela de autenticação
        chrome.identity.launchWebAuthFlow(authWindowConfig,
            // Ao concluir a autenticação com sucesso, passa a URL para o handler tratar
            (redirectUrl) => { handleOAuthCodeResponse(redirectUrl, codeVerifier, resolve, reject); }
        );
    });
};

/**
 * 
 * Função que vai tratar a resposta do servidor de autenticação, verificando se a URL de redirecionamento foi retornada e se contém o código de autenticação.
 * 
 * @param {string} redirectUrl URL de redirecionamento retornada pelo servidor de autenticação. Esta URL contém o código de autenticação.
 * @param {function} resolve Função para resolver a Promise com o código de autenticação e o codeVerifier.
 * @param {function} reject Função para rejeitar a Promise com um erro caso ocorra algum problema.
 * 
 */
function handleOAuthCodeResponse(redirectUrl, codeVerifier, resolve, reject) {
    // Faz as validações iniciais
    if (chrome.runtime.lastError) {
        reject({ success: false, data: chrome.runtime.lastError.message });
        return;
    }
    if (!redirectUrl) {
        reject({ success: false, data: "A URL de redirecionamento não foi retornada." });
        return;
    }
    // Recupera o código da URL de retorno da autenticação
    const urlParams = new URLSearchParams(new URL(redirectUrl).search);
    const code = urlParams.get('code');
    if (code === null) {
        reject({ success: false, data: "O código de autenticação não foi retornado." });
        return;
    }
    // Finaliza a Promise com o código de autenticação e o codeVerifier
    resolve({ code: code, codeVerifier: codeVerifier });
}

/**
 * 
 * Função responsável por fazer a requisição para o servidor de autenticação, passando o código de autenticação e o codeVerifier, e retornando o token JWT.
 * 
 * @param {string} tokenUrl URL que será utilizada para obter o token JWT. Os parâmetros 'code', 'grant_type' e 'code_verifier' serão adicionados dentro deste método.
 * @param {string} code Código de autenticação retornado pelo servidor de autenticação.
 * @param {string} codeVerifier Código de verificação gerado aleatoriamente e enviado para o servidor de autenticação.
 * @returns {Promise} Retorna uma Promise que resolve com o token JWT ou rejeita com um erro caso ocorra algum problema.
 * 
 */
export const getOauthToken = (tokenUrl, code, codeVerifier) => {
    return new Promise((resolve, reject) => {
        // Adicionar os parâmetros necessários na URL para obter o token JWT.
        const fullTokenUrl = new URL(tokenUrl);
        fullTokenUrl.searchParams.set("code", code);
        fullTokenUrl.searchParams.set("grant_type", "token");
        fullTokenUrl.searchParams.set("code_verifier", codeVerifier);
        const fetchParams = {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        };
        // Faz a requisição para o backend solicitando o token JWT.
        fetch(fullTokenUrl.toString(), fetchParams)
            .then((httpResponse) => {
                // Se não teve nenhum retorno da requisição, retorna uma exceção.
                if (httpResponse === null) {
                    reject({ success: false, data: "No data on http response" });
                    return;
                }
                // Aqui sabemos que houve um retorno da requisição
                httpResponse.json()
                    // Transforma a resposta do backend em um objeto JSON e devolve para o plugin
                    .then((response) => { resolve({ success: true, data: response }); })
                    // Se não conseguiu transformar a resposta em JSON, então retorna o erro para o plugin.
                    .catch((error) => { reject({ success: false, data: error }); });
            })
            // Se ocorreu algum erro ao tentar fazer a requisição, então retorna o erro para o plugin.
            .catch((error) => { reject({ success: false, data: error }); });
    });
}

/**
 * 
 * Faz a codificação de uma string em base64url
 * 
 * @param {string} str String a ser codificada em base64url.
 * @returns {string} String codificada em base64url.
 * 
 */
function base64urlencode(str) {
    try {
        // Essa primeira tentativa de codificação utiliza o objeto window para chamar a função 'btoa()'
        return window.btoa(String.fromCharCode(...new Uint8Array(str)))
            .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } catch (e) {
        // Se der uma exceção é porque o objeto window não existe, então tenta chamar a função direto 'btoa()'.
        // Dependendo do contexto do plugin que essa função for chamada, o objeto window pode não existir.
        return btoa(String.fromCharCode(...new Uint8Array(str)))
            .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
}

/**
 * O code verifier é um código gerado aleatoriamente com 32 bytes (caracteres) de comprimento.
 * 
 * Dentro do fluxo de autenticação OAuth 2.0, o code verifier é enviado primeiramente criptografado com uma função de hash e depois ele é verificado pelo servidor de autenticação.
 * Na primeira parte do fluxo fazemos o hash do code verifier e o enviamos como code challenge. Na segunda parte do fluxo, enviamos o code verifier e o servidor de autenticação
 * verifica se o hash do code verifier é igual ao code challenge que foi enviado na primeira parte do fluxo.
 * 
 * @returns {string} Retorna um código de verificação (codeVerifier) gerado aleatoriamente.
 */
function generateCodeVerifier() {
    return base64urlencode(crypto.getRandomValues(new Uint8Array(32)));
}

/**
 * 
 * Função responsável por gerar o code challenge a partir do code verifier. O code challenge é basicamente o hash do code verifier e depois codificado em base64url.
 * 
 * @param {string} codeVerifier String a ser hasheada e enviada para o servidor de autenticação como code challenge.
 * @returns {string} Retorna o code challenge gerado a partir do code verifier e codificado em base64url.
 * 
 */
async function generateCodeChallenge(codeVerifier) {
    try {
        const msgBuffer = new TextEncoder().encode(codeVerifier);
        const digest = await crypto.subtle.digest('SHA-256', msgBuffer);
        return base64urlencode(digest);
    } catch (e) {
        console.error("Erro ao gerar o code challenge: %o", e);
        throw e;
    }
}

/**
 * 
 * Função responsável por fazer a reautenticação do usuário, pegando os códigos de autenticação e o token JWT.
 * Esta função é chamada quando o usuário tenta fazer uma requisição e recebe um erro 401 (não autorizado).
 * 
 */
export const reAuthenticateOAuth = async () => {
    try {
        // Envia uma mensagem para o background pedindo os códigos de autenticação
        const oauthCodes = await new Promise((resolve, reject) => {
            let backgroundMsg = mountMessage(pluginActions.getOAuthCodes, {});
            chrome.runtime.sendMessage(backgroundMsg, (responseData) => { genericResponseHandler(responseData, resolve, reject); });
        });
        // Pega o Token de autenticação
        //console.log("[REAUTH] Recuperando o token de autenticação...");
        let responseToken = await new Promise((resolve, reject) => {
            let backgroundMsg = mountMessage(pluginActions.getOAuthToken, oauthCodes);
            chrome.runtime.sendMessage(backgroundMsg, (responseData) => { genericResponseHandler(responseData, resolve, reject); });
        });
        responseToken = responseToken.data;
        //console.log("[REAUTH] Token de autenticação recuperado.");
        // Salva o token de autenticação no localStorage
        await new Promise((resolve, reject) => {
            let backgroundMsg = mountMessage(pluginActions.saveDataOnStorage, { data: { appOauthToken: responseToken.token } });
            chrome.runtime.sendMessage(backgroundMsg, (responseData) => { genericResponseHandler(responseData, resolve, reject); });
        });
        // Salva o token de autenticação nos cookies
        await new Promise((resolve, reject) => {
            const encodedToken = JSON.stringify({ token: responseToken.token });
            const exp = JSON.parse(atob(responseToken.token.split('.')[1])).exp;
            const fieldsToAdd = {
                name: SIMA_TOKEN_NAME,
                value: encodedToken,
                exp: exp
            }
            Object.assign(responseToken, fieldsToAdd);
            let backgroundMsg = mountMessage(pluginActions.saveCookie, responseToken);
            chrome.runtime.sendMessage(backgroundMsg, (responseData) => { genericResponseHandler(responseData, resolve, reject); });
        });
        console.log("[REAUTH] ReAuth concluído com sucesso.");
    } catch (e) {
        // console.error("[REAUTH] Erro ao tentar autenticar: %o", e);
        throw e;
    }
};

/**
 * 
 * Função genérica criada apenas para tratar a resposta das Promises geradas no método reAuthenticateOAuth.
 * 
 * @param {Object} responseData Objeto com a resposta do Promise.
 * @param {function} resolve function para resolver a Promise.
 * @param {function} reject function para rejeitar a Promise.
 * 
 */
const genericResponseHandler = (responseData, resolve, reject) => {
    if (!responseData.success) {
        reject(responseData.error);
        return;
    }
    resolve(responseData.data);
};

/**
* 
* Função que padroniza a forma como as mensagens são enviadas para o background worker.
* 
* @param {string} action String indicando a ação que será realizada pelo background worker.
* @param {Object} data Dados que serão anexados aos campos padrões da mensagem que será enviada para o background worker.
* @returns {Object} Retorna um objeto com os dados que serão enviados para o background worker.
* 
*/
const mountMessage = (action, data) => {
    return Object.assign(data, {
        from: pluginContexts.content,
        action: action
    });
};