import routesId from '../../../js/model/routes_id';

/**
 * 
 * Cria as rotas que serão utilizadas para simular as chamadas à API.
 * @returns {Array} Retorna um array de rotas mockadas para a API.
 * 
 */
const getMockingRoutes = () => {
  let routes = [];
  let response = {};
  routes.push({ id: routesId.searchAllBoards.id, url: "http://teste.mock/search", body: `{"query":"is:open","modelTypes":"boards","board_fields":"name","boards_limit":"1000"}`, verb: "GET", response: "", response: JSON.stringify(response) });
  routes.push({ id: routesId.searchBoardsByName.id, url: "http://teste.mock/search", body: `{"query":"name:@{board.name} is:open","modelTypes":"boards","board_fields":"name","boards_limit":"1000"}`, verb: "GET", response: JSON.stringify(response) });
  routes.push({ id: routesId.createBoard.id, url: "http://teste.mock/boards", body: `{"name":"@{board.name}","defaultLists":"false"}`, verb: "POST", response: JSON.stringify(response) });
  routes.push({ id: routesId.getListsFromBoard.id, url: "http://teste.mock/boards/@{board.id}", body: `{"lists":"open","list_fields":"id,name"}`, verb: "GET", response: JSON.stringify(response) });
  routes.push({ id: routesId.createList.id, url: "http://teste.mock/lists", body: `{"idBoard":"@{board.id}", "name":"@{list.name}","pos":"bottom"}`, verb: "POST", response: JSON.stringify(response) });
  routes.push({ id: routesId.searchCards.id, url: "http://teste.mock/search", body: `{"query":"description:@{card.desc} is:open","modelTypes":"cards","card_fields":"name,desc,labels,id,due,dueComplete,shortUrl,idChecklists","cards_limit":"1000","card_board":"true","card_list":"true"}`, verb: "GET", response: JSON.stringify(response) });
  routes.push({ id: routesId.searchBoardCards.id, url: "http://teste.mock/boards/@{board.id}/lists", body: `{"cards":"open","filter":"open","card_fields":"name,desc,labels,id,due,dueComplete,shortUrl,idChecklists"}`, verb: "GET", response: JSON.stringify(response) });
  routes.push({ id: routesId.getCardData.id, url: "http://teste.mock/cards/@{card.id}", body: `{"fields":"name,desc,labels,id,due,dueComplete,shortUrl,idChecklists","board":"true","list":"true"}`, verb: "GET", response: JSON.stringify(response) });
  routes.push({ id: routesId.createCard.id, url: "http://teste.mock/cards", body: `{"name":"@{card.name}","desc":"@{card.desc}","pos":"bottom","idList":"@{card.list.id}"}`, verb: "POST", response: JSON.stringify(response) });
  routes.push({ id: routesId.updateCard.id, url: "http://teste.mock/cards/@{card.id}", body: `{"name":"@{card.name}","desc":"@{card.desc}","pos":"bottom","due":"@{card.due}","dueComplete":"@{card.dueComplete}","idList":"@{list.id}","idBoard":"@{board.id}"}`, verb: "PUT", response: JSON.stringify(response) });
  routes.push({ id: routesId.deleteCard.id, url: "http://teste.mock/cards/@{card.id}", body: `{"desc":"@{card.desc}","name":"@{card.name}","due":"@{card.due}","dueComplete":"@{card.dueComplete}","list":"@{list.id}","board":"@{board.id}"}`, verb: "DELETE", response: JSON.stringify(response) });
  routes.push({ id: routesId.getCardChecklistData.id, url: "http://teste.mock/cards/@{card.id}/checklists", body: `{"checkItems":"all","checkItem_fields":"name,pos,state"}`, verb: "GET", response: JSON.stringify(response) });
  routes.push({ id: routesId.createCardChecklist.id, url: "http://teste.mock/checklists", body: `{"idCard":"@{card.id}","name":"@{card.checklist.name}"}`, verb: "POST", response: JSON.stringify(response) });
  routes.push({ id: routesId.createCardChecklistItem.id, url: "http://teste.mock/checklists/@{card.checklist.id}/checkItems", body: `{"name":"@{card.checklist.item.name}","state":"@{card.checklist.item.state}","position":"bottom"}`, verb: "POST", response: JSON.stringify(response) });
  routes.push({ id: routesId.updateCardChecklistItem.id, url: "http://teste.mock/cards/@{card.id}/checkItem/@{card.checklist.item.id}", body: `{"name":"@{card.checklist.item.name}","state":"@{card.checklist.item.state}"}`, verb: "PUT", response: JSON.stringify(response) });
  routes.push({ id: routesId.updateCardChecklistItemPosition.id, url: "http://teste.mock/cards/@{card.id}/checkItem/@{card.checklist.item.id}", body: `{"pos":"@{card.checklist.item.position}"}`, verb: "PUT", response: JSON.stringify(response) });
  routes.push({ id: routesId.deleteCardChecklistItem.id, url: "http://teste.mock/checklists/@{card.checklist.id}/checkItems/@{card.checklist.item.id}", body: `{}`, verb: "DELETE", response: JSON.stringify(response) });
  routes.push({ id: routesId.deleteCardChecklist.id, url: "http://teste.mock/checklists/@{card.checklist.id}", body: `{}`, verb: "DELETE", response: JSON.stringify(response) });
  routes.push({ id: routesId.getBoardLabels.id, url: "http://teste.mock/boards/${board.id}/labels", body: `{}`, verb: "GET", response: JSON.stringify(response) });
  routes.push({ id: routesId.addLabelToCard.id, url: "http://teste.mock/cards/@{card.id}/idLabels", body: `{"value": "@{label.id}"}`, verb: "POST", response: JSON.stringify(response) });
  routes.push({ id: routesId.removeLabelFromCard.id, url: "http://teste.mock/cards/@{card.id}/idLabels/@{label.id}", body: `{}`, verb: "DELETE", response: JSON.stringify(response) });
  routes.push({ id: routesId.createLabel.id, url: "http://teste.mock/labels", body: `{"idBoard":"@{board.id}", "name":"@{label.name}", "color": "@{label.color}"}`, verb: "POST", response: JSON.stringify(response) });
  routes.push({ id: routesId.updateLabel.id, url: "http://teste.mock/labels/@{label.id}", body: `{"name":"@{label.name}", "color": "@{label.color}"}`, verb: "PUT", response: JSON.stringify(response) });
  routes.push({ id: routesId.deleteLabel.id, url: "http://teste.mock/labels/@{label.id}", body: `{}`, verb: "DELETE", response: JSON.stringify(response) });
  return routes;
};

/**
 * Cria a configuração do mock do Chrome API
 * @returns {Object} Configuração do mock do Chrome
 */
export const createChromeMock = () => ({
  storage: {
    sync: {
      get: (data, fn) => {
        fn({
          appKey: 'key',
          appToken: 'token',
          defaultBoard: 'Quadro 1',
          defaultList: 'Lista 1',
          canMoveBoard: true,
          appendNumberOnTitle: true,
          showCard: true,
          moveChecklistItem: true,
          routes: getMockingRoutes(),
        })
      },
    },
  },
  runtime: {
    getManifest: () => ({ name: 'sei+trello' }),
    sendMessage: (data, callback) => { callback({ success: true, data: data.data }); },
    lastError: null
  },
});

/**
 * 
 * Faz o Mock da API do Chrome de armazenamento e runtime para fins de testes E2E.
 * No ambiente de testes estas APIs não estão disponíveis, então criamos uma simulação.
 * 
 */
window.chrome = createChromeMock();

window.infraTooltipMostrar = function () {
  console.log('infraTooltipMostrar');
};
