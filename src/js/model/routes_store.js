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
 * @param {String} responseTransformation String que será utilizada na transformação da resposta da requisição
 */
export const saveRoute = async (routeId, routeURL, routeBody, routeVerb, responseTransformation) => {
    let routes = await chrome.storage.sync.get([values.routes]);
    routes = routes.routes;
    if (!Array.isArray(routes)) {
        routes = [];
    }
    routes.push({id: routeId, url: routeURL, body: routeBody, verb: routeVerb, response: responseTransformation});
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
    let response = {
        boards: [{
            id: "@{boards.id}",
            name: "@{boards.name}"
        }]
    };
    routes.push({id: routesId.searchAllBoards.id, url: "https://api.trello.com/1/search", body: `{"query":"is:open","modelTypes":"boards","board_fields":"name","boards_limit":"1000"}`, verb: "GET", response: "", response: JSON.stringify(response)});
    response = {
        boards: [{
            id: "@{boards.id}",
            name: "@{boards.name}"
        }] 
    };
    routes.push({id: routesId.searchBoardsByName.id, url: "https://api.trello.com/1/search", body: `{"query":"name:@{board.name} is:open","modelTypes":"boards","board_fields":"name","boards_limit":"1000"}`, verb: "GET", response: JSON.stringify(response)});
    response = {
        id: "@{boards.id}",
        name: "@{boards.name}"
    };
    routes.push({id: routesId.createBoard.id, url: "https://api.trello.com/1/boards", body: `{"name":"@{board.name}","defaultLists":"false"}`, verb: "POST", response: JSON.stringify(response)});
    response = {
        lists: [{
            id: "@{lists.id}",
            name: "@{lists.name}"
        }]
    };
    routes.push({id: routesId.getListsFromBoard.id, url: "https://api.trello.com/1/boards/@{board.id}", body: `{"lists":"open","list_fields":"id,name"}`, verb: "GET", response: JSON.stringify(response)});
    response = {
        id: "@{id}",
        name: "@{name}"
    };
    routes.push({id: routesId.createList.id, url: "https://api.trello.com/1/lists", body: `{"idBoard":"@{board.id}", "name":"@{list.name}","pos":"bottom"}`, verb: "POST", response: JSON.stringify(response)});
    response = {
        cards: [{
            id: "@{cards.id}",
            name: "@{cards.name}",
            desc: "@{cards.desc}",
            labels: "@{cards.labels}",
            due: "@{cards.due}",
            dueComplete: "@{cards.dueComplete}",
            shortUrl: "@{cards.shortUrl}",
            idChecklists: "@{cards.idChecklists}"
        }]
    };
    routes.push({id: routesId.searchCards.id, url: "https://api.trello.com/1/search", body: `{"query":"description:@{card.desc} is:open","modelTypes":"cards","card_fields":"name,desc,labels,id,due,dueComplete,shortUrl,idChecklists","cards_limit":"1000","card_board":"true","card_list":"true"}`, verb: "GET", response: JSON.stringify(response)});
    response = [{
        name: "@{this.name}",
        id: "@{this.id}",
        cards: [{
            name: "@{this.cards.name}",
            desc: "@{this.cards.desc}",
            labels: "@{this.cards.labels}",
            id: "@{this.cards.id}",
            due: "@{this.cards.due}",
            dueComplete: "@{this.cards.dueComplete}",
            shortUrl: "@{this.cards.shortUrl}",
            idChecklists: "@{this.cards.idChecklists}"
        }]
    }];
    routes.push({id: routesId.searchBoardCards.id, url: "https://api.trello.com/1/boards/@{board.id}/lists", body: `{"cards":"open","filter":"open","card_fields":"name,desc,labels,id,due,dueComplete,shortUrl,idChecklists"}`, verb: "GET", response: JSON.stringify(response)});
    response = {
        id:"@{id}",
        name:"@{name}",
        desc:"@{desc}",
        labels: [{
          id:"@{labels.id}",
          color:"@{labels.color}"
        }],
        due:"@{due}",
        dueComplete:"@{dueComplete}",
        shortUrl:"@{shortUrl}",
        idChecklists:"@{idChecklists}",
        board: { 
          id: "@{board.id}"
        },
        list: {
          name: "@{list.name}"
        }
    };
    routes.push({id: routesId.getCardData.id, url: "https://api.trello.com/1/cards/@{card.id}", body: `{"fields":"name,desc,labels,id,due,dueComplete,shortUrl,idChecklists","board":"true","list":"true"}`, verb: "GET", response: JSON.stringify(response)});
    response = {
        id: "@{id}",
        name: "@{name}",
        desc: "@{desc}",
        labels: "@{labels}",
        due: "@{due}",
        dueComplete: "@{dueComplete}",
        shortUrl: "@{shortUrl}",
        idChecklists: "@{idChecklists}"
    };
    routes.push({id: routesId.createCard.id, url: "https://api.trello.com/1/cards", body: `{"name":"@{card.name}","desc":"@{card.desc}","pos":"bottom","idList":"@{card.list.id}"}`, verb: "POST", response: JSON.stringify(response)});
    response = {
    };
    routes.push({id: routesId.updateCard.id, url: "https://api.trello.com/1/cards/@{card.id}", body: `{"name":"@{card.name}","desc":"@{card.desc}","pos":"bottom","idList":"@{card.list.id}"}`, verb: "PUT", response: JSON.stringify(response)});
    response = {
    };
    routes.push({id: routesId.deleteCard.id, url: "https://api.trello.com/1/cards/@{card.id}", body: `{"desc":"@{card.desc}","name":"@{card.name}","due":"@{card.due},"dueComplete":"@{card.dueComplete}","list":"@{list.id}","board":"@{board.id}"}`, verb: "DELETE", response: JSON.stringify(response)});
    response = [{
        id: "@{this.id}",
        name: "@{this.name}",
        idBoard: "@{this.idBoard}",
        idCard: "@{this.idCard}",
        pos: "@{this.pos}",
        checkItems: [{
            id: "@{this.checkItems.id}",
            name: "@{this.checkItems.name}",
            pos: "@{this.checkItems.pos}",
            state: "@{this.checkItems.state}",
            idChecklist: "@{this.checkItems.idChecklist}"
        }]
    }];
    routes.push({id: routesId.getCardChecklistData.id, url: "https://api.trello.com/1/cards/@{card.id}/checklists", body: `{"checkItems":"all","checkItem_fields":"name,pos,state"}`, verb: "GET", response: JSON.stringify(response)});
    response = {
        id: "@{id}",
        name: "@{name}",
        idBoard: "@{idBoard}",
        idCard: "@{idCard}",
        pos: "@{pos}"
    };
    routes.push({id: routesId.createCardChecklist.id, url: "https://api.trello.com/1/checklists", body: `{"idCard":"@{card.id}","name":"@{card.checklist.name}"}`, verb: "POST", response: JSON.stringify(response)});
    response = {
        id: "@{id}",
        name: "@{name}",
        pos: "@{pos}",
        state: "@{state}",
        idChecklist: "@{idChecklist}"
    };
    routes.push({id: routesId.createCardChecklistItem.id, url: "https://api.trello.com/1/checklists/@{card.checklist.id}/checkItems", body: `{"name":"@{card.checlist.item.name}","state":"@{card.checklist.item.state}","position":"bottom"}`, verb: "POST", response: JSON.stringify(response)});
    response = {
    };
    routes.push({id: routesId.updateCardChecklistItem.id, url: "https://api.trello.com/1/cards/@{card.id}/checkItem/@{card.checklist.item.id}", body: `{"name":"@{card.checklist.item.name}","state":"@{card.checklist.item.state}""}`, verb: "PUT", response: JSON.stringify(response)});
    response = {
    };
    routes.push({id: routesId.updateCardChecklistItemPosition.id, url: "https://api.trello.com/1/cards/@{card.id}/checkItem/@{card.checklist.item.id}", body: `{"pos":"@{card.checklist.item.position}"}`, verb: "PUT", response: JSON.stringify(response)});
    response = {
    };
    routes.push({id: routesId.deleteCardChecklistItem.id, url: "https://api.trello.com/1/checklists/@{card.checklist.id}/checkItems/@{card.checklist.item.id}", body: `{}`, verb: "DELETE", response: JSON.stringify(response)});
    response = {
    };
    routes.push({id: routesId.deleteCardChecklist.id, url: "https://api.trello.com/1/checklists/@{card.checklist.id}", body: `{}`, verb: "DELETE", response: JSON.stringify(response)});

    await chrome.storage.sync.set({[values.routes]: routes});
};