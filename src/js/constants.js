/**
 * Armazena as constantes utilizadas para identificar os contextos do plugin.
 */
export const pluginContexts = {
    options: "options",
    background: "background",
    content: "content"
};

/**
 * Armazena as constantes utilizadas para identificar as ações que podem ser executadas no background worker.
 */
export const pluginActions = {
    getOAuthCodes: "getOAuthCodes",
    getOAuthToken: "getOAuthToken",
    saveDataOnStorage: "saveDataOnStorage",
    saveCookie: "saveCookie",
    getCookie: "getCookie",
    setCookie: "setCookie",
    saveAuthUrl: "saveAuthUrl"
};