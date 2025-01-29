import * as alert from 'view/alert.js';
import { loadTrelloRoutes, listRoutes, clearRoutes } from "model/routes_store.js";
import routesId from "model/routes_id.js";
import { getRoute } from "model/routes_store.js";
import axios from 'axios';
import 'css/options.scss';

let ui = {};

const defaultTokenUrl =
  'https://trello.com/1/authorize?expiration=never&scope=read,write,account&response_type=token&name=SEITrello';

const mapUI = () => {
  ui.appKey = document.getElementById('txt-app-key');
  ui.appToken = document.getElementById('txt-app-token');
  ui.anchorTokenUrl = document.getElementById('anchor-token-url');
  ui.lblTokenUrl = document.getElementById('lbl-token-url');
  ui.lblNoAppKeyInfo = document.getElementById('lbl-no-app-key-info');
  ui.defaultBoard = document.getElementById('txt-default-board');
  ui.defaultList = document.getElementById('txt-default-list');
  //ui.btnSave = document.getElementsByClassName('btn-salvar-config');
  ui.btnTrelloRoutes = document.getElementById('btn-trello-routes');
  ui.btnClearRoutes = document.getElementById('btn-clear-routes');
  ui.btnAuthReq = document.getElementById('btn-auth-req');
  ui.btnUserData = document.getElementById('btn-user-data');
  

  for (const btnSave of Array.prototype.slice.call(document.getElementsByClassName('btn-salvar-config'))) {
    btnSave.addEventListener('click', save);
  }
  ui.btnTrelloRoutes.addEventListener('click', loadDefaultRoutes);
  ui.btnClearRoutes.addEventListener('click', clearConfiguredRoutes);
  ui.btnAuthReq.addEventListener('click', openPopup);
  ui.btnUserData.addEventListener('click', getUserData);

  ui.appKey.addEventListener('input', () => {
    updateTokenUrl();
  });

  document.addEventListener('DOMContentLoaded', () => {
    updateTokenUrl();
  });
};

const loadRoutesForm = () => {
  document.forms['form-routes'].innerHTML = '';
  const routes = Object.values(routesId);
  routes.forEach(async (route) => {
    const routeId = route.id;
    const routeShortDesc = route.shortdesc;
    const savedRoute = await getRoute(routeId);
    const routeFieldset = document.createElement('fieldset');
    routeFieldset.className = 'border p-2';
    const routeLegend = document.createElement('legend');
    routeLegend.textContent = routeShortDesc;
    routeLegend.className = 'w-auto';
    const routeOuterDiv = document.createElement('div');
    routeOuterDiv.className = 'form-row';
    routeOuterDiv.appendChild(getRouteUrlField(routeId, savedRoute.url));
    routeOuterDiv.appendChild(getRouteVerbField(routeId, savedRoute.verb));
    routeOuterDiv.appendChild(getRouteBodyField(routeId, savedRoute.body));
    routeOuterDiv.appendChild(getRouteResponseField(routeId, savedRoute.response));
    routeFieldset.appendChild(routeLegend);
    routeFieldset.appendChild(routeOuterDiv);
    document.forms['form-routes'].appendChild(routeFieldset);
  });
};

const getRouteResponseField = (index, savedBody) => {
  const ident = `rota-${index}-response`;
  const outerdiv = document.createElement('div');
  outerdiv.className = 'form-row';
  const innerDiv = document.createElement('div');
  innerDiv.className = 'col';
  // Monta o label do campo
  const label = document.createElement('label');
  label.textContent = 'Response Data';
  label.htmlFor = ident;
  // Monta o campo de texto
  const textarea = document.createElement('textarea');
  textarea.className = 'form-control';
  textarea.id = ident;
  textarea.name = ident;
  textarea.rows = 7;
  textarea.placeholder = 'Response JSON';
  if (savedBody !== undefined) {
    textarea.value = savedBody;
  }
  //Adiciona os elementos ao div
  innerDiv.appendChild(label);
  innerDiv.appendChild(textarea);
  return innerDiv;
};

const getRouteBodyField = (index, savedBody) => {
  const ident = `rota-${index}-body`;
  const outerdiv = document.createElement('div');
  outerdiv.className = 'form-row';
  const innerDiv = document.createElement('div');
  innerDiv.className = 'col';
  // Monta o label do campo
  const label = document.createElement('label');
  label.textContent = 'Request Body';
  label.htmlFor = ident;
  // Monta o campo de texto
  const textarea = document.createElement('textarea');
  textarea.className = 'form-control';
  textarea.id = ident;
  textarea.name = ident;
  textarea.rows = 7;
  textarea.placeholder = 'Response JSON';
  if (savedBody !== undefined) {
    textarea.value = savedBody;
  }
  //Adiciona os elementos ao div
  innerDiv.appendChild(label);
  innerDiv.appendChild(textarea);
  return innerDiv;
};

const getRouteVerbField = (index, savedVerb) => {
  const ident = `rota-${index}-verb`;
  const div = document.createElement('div');
  div.className = 'col-md-3';
  // Monta o label do campo
  const label = document.createElement('label');
  label.textContent = 'Verbo';
  label.htmlFor = ident;
  // Monta o campo do select
  const select = getVerbSelectElement(index, savedVerb);
  //Adiciona os elementos ao div
  div.appendChild(label);
  div.appendChild(select);
  return div;
};

const getRouteUrlField = (index, savedUrl) => {
  const ident = `rota-${index}-url`;
  const div = document.createElement('div');
  div.className = 'col-md-9';
  // Monta o label do campo
  const label = document.createElement('label');
  label.textContent = 'Rota';
  label.htmlFor = ident;
  // Monta o campo de texto
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'form-control';
  input.id = ident;
  input.name = ident;
  input.placeholder = 'URL da rota';
  if (savedUrl !== undefined) {
    input.value = savedUrl;
  }
  //Adiciona os elementos ao div
  div.appendChild(label);
  div.appendChild(input);
  return div;
};

const getVerbSelectElement = (index, savedBody) => {
  const select = document.createElement('select');
  const id = `rota-${index}-verb`;
  select.id = id;
  select.name = id;
  select.className = 'form-control';
  const options = ['GET', 'POST', 'PUT', 'DELETE'];
  options.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    if (option === savedBody) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
  return select;
};

const updateTokenUrl = () => {
  const appKey = ui.appKey.value;
  if (appKey.length === 0) {
    ui.lblNoAppKeyInfo.style.display = 'initial';
    const tokenUrl = defaultTokenUrl + '&key=<APP KEY>';
    ui.lblTokenUrl.textContent = tokenUrl;
    ui.anchorTokenUrl.removeAttribute('href');
  } else {
    ui.lblNoAppKeyInfo.style.display = 'none';
    const tokenUrl = defaultTokenUrl + '&key=' + appKey;
    ui.lblTokenUrl.textContent = tokenUrl;
    ui.anchorTokenUrl.setAttribute('href', tokenUrl);
  }
};

const save = async (e) => {
  e.preventDefault();
  const dataToSave = Object.assign({}, {
    appKey: ui.appKey.value,
    appToken: ui.appToken.value,
    defaultBoard: ui.defaultBoard.value,
    defaultList: ui.defaultList.value,
  });
  //await clearRoutes();
  const newRoutes = [];
  const values = Object.values(routesId);
  for (const value of values) {
    const routeId = value.id;
    const routeUrl = document.getElementById(`rota-${routeId}-url`).value;
    const routeBody = document.getElementById(`rota-${routeId}-body`).value;
    const routeVerb = document.getElementById(`rota-${routeId}-verb`).value;
    const routeResponse = document.getElementById(`rota-${routeId}-response`).value;
    newRoutes.push({ id: routeId, url: routeUrl, body: routeBody, verb: routeVerb, response: routeResponse });
  }
  Object.assign(dataToSave, { routes: newRoutes });
  chrome.storage.sync.set(dataToSave);
  alert.success('As configurações foram salvas com sucesso.');
};

const clearConfiguredRoutes = async (event) => {
  event.preventDefault();
  clearRoutes();
  alert.success('Rotas configuradas foram removidas com sucesso.');
};

const loadDefaultRoutes = async (event) => {
  event.preventDefault();
  if (confirm('Deseja realmente carregar as configurações do Trello? Esta ação não pode ser desfeita.')) {
    await loadTrelloRoutes();
    loadRoutesForm();
    await listRoutes();
    alert.success('Rotas do Trello carregadas com sucesso.');
  } else {
    console.log('Rotas do Trello canceladas.');
  }
}

const restore = () => {
  chrome.storage.sync.get(
    {
      appKey: '',
      appToken: '',
      defaultBoard: '',
      defaultList: '',
    },
    (items) => {
      ui.appKey.value = items.appKey;
      ui.appToken.value = items.appToken;
      ui.defaultBoard.value = items.defaultBoard;
      ui.defaultList.value = items.defaultList;
      updateTokenUrl();
    }
  );
};

document.addEventListener('DOMContentLoaded', () => {
  mapUI();
  restore();
  loadRoutesForm();
});


const openPopup = () => {
  window.open('http://localhost:5173/jwt_temp.html', 'popup', 'width=600,height=400');
  // Este evento receberá a mensagem de volta do popup após o usuário ser autenticado com sucesso
  window.addEventListener('message', (event) => {
    if (event.origin !== 'http://localhost:5173') {
      return;
    }
    const data = event.data;
    if (data && data.token) {
      const encodedToken = JSON.stringify({ token: data.token });
      const exp = JSON.parse(window.atob(data.token.split('.')[1])).exp;
      chrome.cookies.set({
        url: "http://localhost:5055",
        name: "SIMA",
        value: encodedToken,
        expirationDate: exp,
        secure: true,
        sameSite: "no_restriction"
      });
      alert.success(`Token recuperado com sucesso.`);
    }
  });
};

const getUserData = () => {
  console.log("Request sem header bla");
  axios.get('http://localhost:5055/api/user/authUser', {}, {withCredentials: true})
        .then((response) => {console.log(response.data);})
        .catch((err) => console.log(err));
};