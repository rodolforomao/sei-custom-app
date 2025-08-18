/* show page action icon */

import 'css/common.scss';

/*chrome.runtime.sendMessage(null, {
  from: 'content',
  subject: 'showPageAction',
});

document.addEventListener('click', (el) => {
  if (el.target.classList.contains('btn-open-extension-option')) {
    chrome.runtime.sendMessage(null, {
      from: 'content',
      subject: 'showOptionsPage',
    });
  }
});*/

window.addEventListener("error", (e) => {
  console.warn("[Minha extensão] Erro capturado (ignorado):", e.message);
  return true; // evita propagação que poderia quebrar
});

window.addEventListener("unhandledrejection", (e) => {
  console.warn("[Minha extensão] Promise rejeitada sem tratamento:", e.reason);
});

// Seu código normal vem depois...
console.log("[Minha extensão] common.js carregado com segurança!");
