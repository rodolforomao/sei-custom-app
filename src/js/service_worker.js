import { openJWTPopup } from "./actions/jwt_authentication.js";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("Message received: %o", msg);
  if (msg.from === 'content' && msg.subject === 'showPageAction') {
    chrome.pageAction.show(sender.tab.id);
  }
  if (msg.from === 'content' && msg.subject === 'showOptionsPage') {
    chrome.runtime.openOptionsPage();
  }
  
  if (['content', 'options'].includes(msg.from)) {
    if (msg.action == "setCookie") {
      setCookie(msg, sendResponse);
      return true;
    }
    
    if (msg.action == "doAuthentication") {
      console.log("Fazendo autenticação...");
      doAuthentication()
      .then((result) => {
        sendResponse(result);
      })
      .catch((e) => { sendResponse(false); });
      console.log("Returning true");
      return true;
    }
  }
});

async function doAuthentication() {
  const authUrl = await getAuthURL();
  try {
    return await openJWTPopup(authUrl, null);
  } catch (e) {
    console.error("Erro ao abrir popup de autenticação: %o", e);
    return false;
  }
}


function setCookie(msg, sendResponse) {
  chrome.cookies.set({
    url: msg.destinyDomain,
    name: "SIMA",
    value: msg.encodedToken,
    expirationDate: msg.exp,
    secure: true,
    sameSite: "no_restriction"
  }, (cookie) => {
    if (!chrome.runtime.lastError) {
      //console.log("Cookie OK: %o", cookie);
      sendResponse({ success: true });
    } else {
      console.error("Erro ao tentar setar cookie: %o", chrome.runtime.lastError);
      sendResponse({ success: false, error: chrome.runtime.lastError });
    }
  });
}

async function getAuthURL () {
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