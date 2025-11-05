import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as dom from './dom.js';
import * as controller from 'controller/trello.js';
import 'css/process_content.scss';

(() => {
  if (window._PLUGINSEI_EXT_INITIALIZED) return;
  window._PLUGINSEI_EXT_INITIALIZED = true;

  const CACHE_KEY = 'PLUGIN_SEI_REQUEST_TIME';
  const MIN_INTERVAL_MS = 5000; 

  const getLastRequestTime = () => parseInt(localStorage.getItem(CACHE_KEY) || '0', 10);
  const setLastRequestTime = (time) => localStorage.setItem(CACHE_KEY, time.toString());

  const initTrello = () => {
    dom.prepare();

    const box = document.querySelector('[data-trello-process-box]');
    if (!box) return;

    const processNumber = box.getAttribute('data-trello-process-number');
    if (!processNumber) return;

    const now = Date.now();
    const last = getLastRequestTime();
    if (now - last < MIN_INTERVAL_MS) return;

    setLastRequestTime(now);
    controller.load({ processNumber });
  };

  initTrello();
})();