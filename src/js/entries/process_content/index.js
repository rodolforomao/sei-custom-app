import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as dom from './dom.js';
import * as controller from 'controller/trello.js';
import 'css/process_content.scss';

(() => {
  // Validação conflito SEI PRO
  const globalScope = window.top || window;

  // Se já rodou nesta aba, não executa de novo
  if (globalScope._PLUGINSEI_EXT_ALREADY_LOADED) {
    console.log('[PLUGIN SEI] já inicializado nesta aba.');
    return;
  }
  globalScope._PLUGINSEI_EXT_ALREADY_LOADED = true;

  // Gera um ID novo a cada reload
  const pageId = crypto.randomUUID();
  globalScope._PLUGINSEI_PAGE_ID = pageId;
  console.log('[PLUGIN SEI] Page ID:', pageId);

  const initTrello = () => {
    dom.prepare();

    const box = document.querySelector('[data-trello-process-box]');
    if (!box) {
      console.log('[PLUGIN SEI] Nenhum box encontrado.');
      return;
    }

    const processNumber = box.getAttribute('data-trello-process-number');
    if (!processNumber) {
      console.log('[PLUGIN SEI] Nenhum número de processo encontrado.');
      return;
    }

    console.log('[PLUGIN SEI] Chamando controller.load para', processNumber);
    controller.load({ processNumber });
  };

  initTrello();
})();
