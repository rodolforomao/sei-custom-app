import routesId from "./routes_id";

/**
 * @fileoverview Este arquivo contém as funções para gerenciar as rotas no espaço de armazenamento do plugin.
 * @author Túlio Marinho Guimarães
 * @date 2024-12-16
 */

/**
 * @typedef {Object} values - Lista de nomes que são utilizados para identificar os valores no espaço de armazenamento do plugin.
 * @property {string} routes - Identificador da rota.
 */
const values = {
    routes: "routes"
}

/**
 * Verifica se as rotas já foram inicializadas.
 * @returns {boolean} Retorna true se as rotas já foram inicializadas, false caso contrário.
 */
export const isInitializedRoutes = async () => {
    const routes = await chrome.storage.sync.get([values.routes]);
    return routes.routes !== undefined && Array.isArray(routes.routes) && routes.routes.length > 0;
}

/**
 * Limpa as rotas do espaço de armazenamento do plugin.
 */
export const clearRoutes = async () => {
    await chrome.storage.sync.remove([values.routes]);
}

/**
 * Lista no console as rotas do espaço de armazenamento do plugin.
 */
export const listRoutes = async () => {
    let routes = await chrome.storage.sync.get([values.routes]);
    routes.routes.forEach(element => {
        console.log("Route list: %o", element);
    });
}

/**
 * Salva uma rota no espaço de armazenamento do plugin.
 * @param {Int} routeId número identificador da rota de acordo com o arquivo routes_id.js
 * @param {String} routeURL URL da rota que será salva
 * @param {String} routeBody String JSON representando o corpo da requisição que será feita nesta rota
 * @param {String} routeVerb Verbo HTTP que será utilizado na requisição
 */
export const saveRoute = async (routeId, routeURL, routeBody, routeVerb) => {
    let routes = await chrome.storage.sync.get([values.routes]);
    routes = routes.routes;
    if (!Array.isArray(routes)) {
        routes = [];
    }
    routes.push({id: routeId, url: routeURL, body: routeBody, verb: routeVerb});
    console.log("Saving routes: %o", routes);
    await chrome.storage.sync.set({"routes": routes});
};

/**
 * Recupera e retorna uma rota do espaço de armazenamento do plugin.
 * @param {Int} routeId número identificador da rota de acordo com o arquivo routes_id.js
 * @returns {{id: String, url: String, body: String}} Retorna um objeto representando a rota.
 */
export const getRoute = async (routeId) => {
    const routes = await chrome.storage.sync.get([values.routes]);
    return routes.routes.find((route) => route.id === routeId);
};

/**
 * Carrega as rotas do Trello no espaço de armazenamento do plugin.
 * @returns {void}
 */
export const loadTrelloRoutes = async () => {
    let routes = [];

    routes.push({id: routesId.searchAllBoards.id, url: "https://api.trello.com/1/search", body: `{"query":"is:open","modelTypes":"boards","board_fields":"name","boards_limit":"1000"}`, verb: "GET"});
    routes.push({id: routesId.searchBoardsByName.id, url: "https://api.trello.com/1/search", body: `{"query":"name:@{board.name} is:open","modelTypes":"boards","board_fields":"name","boards_limit":"1000"}`, verb: "GET"});
    routes.push({id: routesId.createBoard.id, url: "https://api.trello.com/1/boards", body: `{"name":"@{board.name}","defaultLists":"false"}`, verb: "POST"});
    routes.push({id: routesId.getListsFromBoard.id, url: "https://api.trello.com/1/boards/@{board.id}", body: `{"lists":"open","list_fields":"id,name"}`, verb: "GET"});
    routes.push({id: routesId.createList.id, url: "https://api.trello.com/1/lists", body: `{"idBoard":"@{board.id}", "name":"@{list.name}","pos":"bottom"}`, verb: "POST"});
    routes.push({id: routesId.searchCards.id, url: "https://api.trello.com/1/search", body: `{"query":"description:@{card.desc} is:open","modelTypes":"cards","card_fields":"name,desc,labels,id,due,dueComplete,shortUrl,idChecklists","cards_limit":"1000","card_board":"true","card_list":"true"}`, verb: "GET"});
    routes.push({id: routesId.searchBoardCards.id, url: "https://api.trello.com/1/boards/@{board.id}/lists", body: `{"cards":"open","filter":"open","card_fields":"name,desc,labels,id,due,dueComplete,shortUrl,idChecklists"}`, verb: "GET"});
    routes.push({id: routesId.getCardData.id, url: "https://api.trello.com/1/cards/@{card.id}", body: `{"fields":"name,desc,labels,id,due,dueComplete,shortUrl,idChecklists","board":"true","list":"true"}`, verb: "GET"});
    routes.push({id: routesId.createCard.id, url: "https://api.trello.com/1/cards", body: `{"name":"@{card.name}","desc":"@{card.desc}","pos":"bottom","idList":"@{card.list.id}"}`, verb: "POST"});
    routes.push({id: routesId.updateCard.id, url: "https://api.trello.com/1/cards/@{card.id}", body: `{"name":"@{card.name}","desc":"@{card.desc}","pos":"bottom","idList":"@{card.list.id}"}`, verb: "PUT"});
    routes.push({id: routesId.deleteCard.id, url: "https://api.trello.com/1/cards/@{card.id}", body: `{"desc":"@{card.desc}","name":"@{card.name}","due":"@{card.due},"dueComplete":"@{card.dueComplete}","list":"@{list.id}","board":"@{board.id}"}`, verb: "DELETE"});
    routes.push({id: routesId.getCardChecklistData.id, url: "https://api.trello.com/1/cards/@{card.id}/checklists", body: `{"checkItems":"all","checkItem_fields":"name,pos,state"}`, verb: "GET"});
    routes.push({id: routesId.createCardChecklist.id, url: "https://api.trello.com/1/checklists", body: `{"idCard":"@{card.id}","name":"@{card.checklist.name}"}`, verb: "POST"});
    routes.push({id: routesId.createCardChecklistItem.id, url: "https://api.trello.com/1/checklists/@{card.checklist.id}/checkItems", body: `{"name":"@{card.checlist.item.name}","state":"@{card.checklist.item.state}","position":"bottom"}`, verb: "POST"});
    routes.push({id: routesId.updateCardChecklistItem.id, url: "https://api.trello.com/1/cards/@{card.id}/checkItem/@{card.checklist.item.id}", body: `{"name":"@{card.checklist.item.name}","state":"@{card.checklist.item.state}","pos":"@{card.checklist.item.position}"}`, verb: "PUT"});
    routes.push({id: routesId.deleteCardChecklistItem.id, url: "https://api.trello.com/1/checklists/@{card.checklist.id}/checkItems/@{card.checklist.item.id}", body: `{}`, verb: "DELETE"});
    routes.push({id: routesId.deleteCardChecklist.id, url: "https://api.trello.com/1/checklists/@{card.checklist.id}", body: `{}`, verb: "DELETE"});

    await chrome.storage.sync.set({[values.routes]: routes});
    
    // await saveRoute(routesId.searchAllBoards.id, "https://api.trello.com/1/search", `{"query":"is:open","modelTypes":"boards","board_fields":"name","boards_limit":"1000"}`, "GET");
    // await saveRoute(routesId.searchBoardsByName.id, "https://api.trello.com/1/search", `{"query":"name:@{board.name} is:open","modelTypes":"boards","board_fields":"name","boards_limit":"1000"}`, "GET");
    // await saveRoute(routesId.createBoard.id, "https://api.trello.com/1/boards", `{"name":"@{board.name}","defaultLists":"false"}`, "POST");
    // await saveRoute(routesId.getListsFromBoard.id, "https://api.trello.com/1/boards/@{board.id}", `{"lists":"open","list_fields":"id,name"}`, "GET");
    // await saveRoute(routesId.createList.id, "https://api.trello.com/1/lists", `{"idBoard":"@{board.id}", "name":"@{list.name}","pos":"bottom"}`, "POST");
    // await saveRoute(routesId.searchCards.id, "https://api.trello.com/1/search", `{"query":"description:@{card.desc} is:open","modelTypes":"cards","card_fields":"name,desc,labels,id,due,dueComplete,shortUrl,idChecklists","cards_limit":"1000","card_board":"true","card_list":"true"}`, "GET");
    // await saveRoute(routesId.searchBoardCards.id, "https://api.trello.com/1/boards/@{board.id}/lists", `{"cards":"open","filter":"open","card_fields":"name,desc,labels,id,due,dueComplete,shortUrl,idChecklists"}`, "GET");
    // await saveRoute(routesId.getCardData.id, "https://api.trello.com/1/cards/@{card.id}", `{"fields":"name,desc,labels,id,due,dueComplete,shortUrl,idChecklists","board":"true","list":"true"}`, "GET");
    // await saveRoute(routesId.createCard.id, "https://api.trello.com/1/cards", `{"name":"@{card.name}","desc":"@{card.desc}","pos":"bottom","idList":"@{card.list.id}"}`, "POST");
    // await saveRoute(routesId.updateCard.id, "https://api.trello.com/1/cards/@{card.id}", `{"name":"@{card.name}","desc":"@{card.desc}","pos":"bottom","idList":"@{card.list.id}"}`, "PUT");
    // await saveRoute(routesId.deleteCard.id, "https://api.trello.com/1/cards/@{card.id}", `{"desc":"@{card.desc}","name":"@{card.name}","due":"@{card.due},"dueComplete":"@{card.dueComplete}","list":"@{list.id}","board":"@{board.id}"}`, "DELETE");
    // await saveRoute(routesId.getCardChecklistData.id, "https://api.trello.com/1/cards/@{card.id}/checklists", `{"checkItems":"all","checkItem_fields":"name,pos,state"}`, "GET");
    // await saveRoute(routesId.createCardChecklist.id, "https://api.trello.com/1/checklists", `{"idCard":"@{card.id}","name":"@{card.checklist.name}"}`, "POST");
    // await saveRoute(routesId.createCardChecklistItem.id, "https://api.trello.com/1/checklists/@{card.checklist.id}/checkItems", `{"name":"@{card.checlist.item.name}","state":"@{card.checklist.item.state}","position":"bottom"}`, "POST");
    // await saveRoute(routesId.updateCardChecklistItem.id, "https://api.trello.com/1/cards/@{card.id}/checkItem/@{card.checklist.item.id}", `{"name":"@{card.checklist.item.name}","state":"@{card.checklist.item.state}","pos":"@{card.checklist.item.position}"}`, "PUT");
    // await saveRoute(routesId.deleteCardChecklistItem.id, "https://api.trello.com/1/checklists/@{card.checklist.id}/checkItems/@{card.checklist.item.id}", `{}`, "DELETE");
    // await saveRoute(routesId.deleteCardChecklist.id, "https://api.trello.com/1/checklists/@{card.checklist.id}", `{}`, "DELETE");
};