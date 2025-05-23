import * as ui from 'view/ui.js';
import * as store from 'model/store.js';
import * as api from 'api';
import * as actions from 'actions/trello.js';

export const load = (opts) => {
  chrome.storage.sync.get(
    {
      appKey: '',
      appToken: '',
      authType: '',
      canMoveBoard: false,
      appendNumberOnTitle: false
    },
    (items) => {
      api.setCredentials(items.appKey, items.appToken);
      api.setAuthType(items.authType);

      store.onDataChanged(() => ui.render());
      store.setCanChangeBoard(items.canMoveBoard, false);
      store.setAppendNumberOnTitle(items.appendNumberOnTitle, false);

      if (opts && 'processNumber' in opts) {
        actions.refreshCards(opts['processNumber']);
      } else {
        actions.refreshCards();
      }
    }
  );
};
