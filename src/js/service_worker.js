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
      return true;
    }
  }
});
