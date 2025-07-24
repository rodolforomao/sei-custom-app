import * as alert from 'view/alert.js';
import { loadTrelloRoutes, loadSimaRoutes, listRoutes, clearRoutes } from "model/routes_store.js";
import routesId from "model/routes_id.js";
import { getRoute } from "model/routes_store.js";
import { reAuthenticateOAuth } from './actions/oauth_util.js';
import { pluginActions, pluginContexts } from './constants.js';
import axios from 'axios';
import 'css/options.scss';

let ui = {};
const base_url = process.env.API_BACKEND;

const defaultTokenUrl =
  'https://trello.com/1/authorize?expiration=never&scope=read,write,account&response_type=token&name=SEITrello';

const mapUI = () => {
  ui.appKey = document.getElementById('txt-app-key');
  ui.appToken = document.getElementById('txt-app-token');
  ui.authType = document.getElementById('authType');
  ui.authUrl = document.getElementById('authUrl');
  ui.tokenUrl = document.getElementById('tokenUrl');
  ui.anchorTokenUrl = document.getElementById('anchor-token-url');
  ui.defaultBoard = document.getElementById('txt-default-board');
  ui.defaultList = document.getElementById('txt-default-list');
  ui.btnTrelloRoutes = document.getElementById('btn-trello-routes');
  ui.btnClearRoutes = document.getElementById('btn-clear-routes');
  ui.btnAuthReq = document.getElementById('btn-auth-req');
  ui.btnUserData = document.getElementById('btn-user-data');
  ui.btnTrello = document.getElementById('btn-link-trello');
  ui.btnJwt = document.getElementById('btn-link-jwt');
  ui.btnSima = document.getElementById('btn-link-sima');
  ui.formTrello = document.getElementById('form-trello');
  ui.formJwt = document.getElementById('form-jwt');
  ui.selectDesktop = document.getElementById("select-default-desktop");
  ui.selectBoard = document.getElementById("select-default-board");
  ui.selectList = document.getElementById("select-default-list");
  ui.checkCookies = document.getElementById("checkCookies");
  ui.checkMove = document.getElementById("checkMove");
  ui.checkCreateTitle = document.getElementById("checkCreateTitle");
  ui.checkShowCard = document.getElementById("checkShowCard");
  ui.checkMoveChecklistItem = document.getElementById("checkMoveChecklistItem");


  for (const btnSave of Array.prototype.slice.call(document.getElementsByClassName('btn-salvar-config'))) {
    btnSave.addEventListener('click', save);
  }
  ui.btnTrelloRoutes.addEventListener('click', loadDefaultRoutes);
  ui.btnClearRoutes.addEventListener('click', clearConfiguredRoutes);
  ui.btnAuthReq.addEventListener('click', openPopup);
  ui.btnTrello.addEventListener('click', openFormTrello);
  ui.btnJwt.addEventListener('click', openFormJWT);
  ui.btnSima.addEventListener('click', loadSimaConfig);

  ui.selectDesktop.addEventListener("change", onChangeDesktop);
  ui.selectBoard.addEventListener("change", onChangeBoard);
  ui.selectList.addEventListener("change", onChangeList);

  ui.appKey.addEventListener('input', () => {
    updateTokenUrl();
  });

  document.addEventListener('DOMContentLoaded', () => {
    updateTokenUrl();
  });
};

const onChangeDesktop = async (event) => {
  const selectedDesktop = event.target.value;
  clearSelect(ui.selectBoard);
  clearSelect(ui.selectList);

  requestBackendData(`${base_url}/api/desktop/${selectedDesktop}/list/projects/`, (response) => {
    const boards = response.data;
    let ids = boards.map(board => board.id);
    let names = boards.map(board => board.name);
    const selectElement = document.getElementById("select-default-board");
    populateSelect(selectElement, ids, names, ui.selectDesktop.value);
  });
}

const onChangeBoard = async (event) => {
  const selectedBoard = event.target.value;
  const boardName = getTextFromSelectValue(ui.selectBoard, selectedBoard);
  ui.defaultBoard.value = boardName;
  clearSelect(ui.selectList);

  requestBackendData(`${base_url}/api/project/${selectedBoard}/lists/`, (response) => {
    const lists = response.data;
    let ids = lists.map(list => list.id);
    let names = lists.map(list => list.name);
    const selectElement = document.getElementById("select-default-list");
    populateSelect(selectElement, ids, names, ui.selectDesktop.value);
  });
}

const onChangeList = async (event) => {
  const selectedList = event.target.value;
  const listName = getTextFromSelectValue(ui.selectList, selectedList);
  ui.defaultList.value = listName;
}

const openFormTrello = () => {
  ui.formJwt.style.display = 'none';
  ui.formTrello.style.display = 'block';
  ui.authType.value = 'trello';
}

const openFormJWT = () => {
  ui.formTrello.style.display = 'none';
  ui.formJwt.style.display = 'block';
  ui.authType.value = 'jwt';
}

const loadSimaConfig = async () => {
  openFormJWT();
  ui.authUrl.value = base_url.replace('-back', '').replace('5055', '5173') + '/menu/?param=pluginValidation&state=true';
  ui.tokenUrl.value = base_url + '/auth/oauth/gettoken/';
  await loadSimaRoutes();
  loadRoutesForm();
  toggleElementDisplay('form-routes', 'block');
  toggleElementDisplay('btn-clear-routes', 'block');
  toggleElementDisplay('btn-trello-routes', 'none');
  toggleElementDisplay('btnSalvarConfig', 'block');
  alert.success('Configuração do SIMA realizada com sucesso.');
};

const validationRoute = async () => {
  const routes = Object.values(routesId);
  const routeId = routes[0]?.id;
  const savedRoute = await getRoute(routeId);

  if (savedRoute && savedRoute.url) {
    return true;
  }
  return false;
};

const toggleFormDisplay = async () => {
  const form = document.getElementById("form-routes");
  const buttonSaveConfiguration = document.getElementById("btnSalvarConfig");
  const btnCarregarRotas = document.getElementById('btn-trello-routes');
  const btnLimparRotas = document.getElementById('btn-clear-routes');


  if (!form) return;

  const isValid = await validationRoute();
  form.style.display = isValid ? "block" : "none";
  buttonSaveConfiguration.style.display = isValid ? "block" : "none";
  btnCarregarRotas.style.display = isValid ? "none" : "block";
  btnLimparRotas.style.display = isValid ? "block" : "none";
};


toggleFormDisplay();


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

const getVerbSelectElement = (index, savedVerb) => {
  const select = document.createElement('select');
  const id = `rota-${index}-verb`;
  select.id = id;
  select.name = id;
  select.className = 'form-control';
  const options = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  options.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    if (option === savedVerb) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
  return select;
};

const updateTokenUrl = () => {
  const appKey = ui.appKey.value;
  if (appKey.length === 0) {
    //ui.lblNoAppKeyInfo.style.display = 'initial';
    const tokenUrl = defaultTokenUrl + '&key=<APP KEY>';
    // ui.lblTokenUrl.textContent = tokenUrl;
    ui.anchorTokenUrl.removeAttribute('href');
    ui.anchorTokenUrl.innerHTML = '';
  } else {
    //ui.lblNoAppKeyInfo.style.display = 'none';
    const tokenUrl = defaultTokenUrl + '&key=' + appKey;
    // ui.lblTokenUrl.textContent = tokenUrl;
    ui.anchorTokenUrl.setAttribute('href', tokenUrl);
    ui.anchorTokenUrl.innerHTML = tokenUrl;
  }
};

const save = async (e) => {
  const filledData = {
    appKey: ui.appKey.value,
    appToken: ui.appToken.value,
    authType: ui.authType.value,
    authUrl: ui.authUrl.value.trim(),
    tokenUrl: ui.tokenUrl.value.trim(),
    defaultDesktop: parseFloat(ui.selectDesktop.value) || 0,
    saveTokenOnCookies: ui.checkCookies.checked,
    canMoveBoard: ui.checkMove.checked,
    appendNumberOnTitle: ui.checkCreateTitle.checked,
    showCard: ui.checkShowCard.checked,
    moveChecklistItem: ui.checkMoveChecklistItem.checked
  };
  // Salva o defaultBoard somente se estiver preenchido para evitar sobrescrever o que está salvo com vazio
  if (ui.defaultBoard.value) {
    filledData.defaultBoard = ui.defaultBoard.value;
  }
  // Salva o defaultList somente se estiver preenchido para evitar sobrescrever o que está salvo com vazio
  if (ui.defaultList.value) {
    filledData.defaultList = ui.defaultList.value;
  }

  e.preventDefault();
  const dataToSave = Object.assign({}, filledData);

  await clearRoutes();
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
  const msgBackground = {
    from: pluginContexts.options,
    action: pluginActions.saveDataOnStorage,
    data: dataToSave
  };
  await chrome.runtime.sendMessage(msgBackground, (response) => {
    if (response && response.success) {
      alert.success('Configurações salvas com sucesso.');
    } else {
      alert.error('Erro ao salvar as configurações.');
    }
  });
};

const clearConfiguredRoutes = async (event) => {

  const formRoutes = document.getElementById('form-routes');
  if (formRoutes) {
    formRoutes.reset(); // Reseta os campos do formulário
  }

  const btnLimparRotas = document.getElementById('btn-clear-routes');
  if (btnLimparRotas) {
    btnLimparRotas.style.display = 'none'; // Esconde o formulário
  }

  const btnCarregarRotas = document.getElementById('btn-trello-routes');
  if (btnCarregarRotas) {
    btnCarregarRotas.style.display = 'block'; // Esconde o formulário
  }

  event.preventDefault();
  clearRoutes();
  alert.success('Rotas configuradas foram removidas com sucesso.');
};

const toggleElementDisplay = (id, display) => {
  const element = document.getElementById(id);
  if (element) element.style.display = display;
};

const loadDefaultRoutes = async (event) => {
  event.preventDefault();

  toggleElementDisplay('form-routes', 'block');
  toggleElementDisplay('btn-clear-routes', 'block');
  toggleElementDisplay('btn-trello-routes', 'none');

  if (confirm('Deseja realmente carregar as configurações padrão? Esta ação não pode ser desfeita.')) {
    if (ui.authType.value === 'jwt') {
      await loadSimaRoutes();
    } else if (ui.authType.value === 'trello') {
      await loadTrelloRoutes();
    } else {
      alert.error('Tipo de autenticação inválido.');
      return;
    }
    loadRoutesForm();

    toggleElementDisplay('btnSalvarConfig', 'block');

    alert.success('Rotas carregadas com sucesso.');
  } else {
    toggleElementDisplay('btn-clear-routes', 'none');
    toggleElementDisplay('btn-trello-routes', 'block');
  }
};
const restore = () => {
  chrome.storage.sync.get(
    {
      authUrl: '',
      tokenUrl: '',
      authType: '',
      appKey: '',
      appToken: '',
      defaultBoard: '',
      defaultList: '',
      defaultDesktop: '',
      saveTokenOnCookies: true,
      canMoveBoard: false,
      appendNumberOnTitle: false,
      showCard: false,
      moveChecklistItem: false
    },
    (items) => {
      ui.authUrl.value = items.authUrl;
      ui.tokenUrl.value = items.tokenUrl;
      ui.authType.value = items.authType;
      ui.appKey.value = items.appKey;
      ui.appToken.value = items.appToken;
      ui.defaultBoard.value = items.defaultBoard;
      ui.defaultList.value = items.defaultList;
      ui.selectDesktop.value = items.defaultDesktop;
      ui.checkCookies.checked = items.saveTokenOnCookies;
      ui.checkMove.checked = items.canMoveBoard;
      ui.checkCreateTitle.checked = items.appendNumberOnTitle;
      ui.checkShowCard.checked = items.showCard;
      ui.checkMoveChecklistItem.checked = items.moveChecklistItem;
      if (ui.authType.value === 'jwt') {
        openFormJWT();
        loadRoutesForm();
      } else if (ui.authType.value === 'trello') {
        openFormTrello();
        loadRoutesForm();
      }
      updateTokenUrl();
    }
  );
};

document.addEventListener('DOMContentLoaded', () => {
  mapUI();
  restore();
});

const buttons = document.querySelectorAll('.nav-item button');

// Função para destacar o botão clicado
buttons.forEach(button => {
  button.addEventListener('click', function () {
    // Remove a classe "highlighted" de todos os botões
    buttons.forEach(btn => btn.classList.remove('highlighted'));

    // Adiciona a classe "highlighted" ao botão clicado
    this.classList.add('highlighted');
  });
});


const openPopup = async (event) => {
  event.preventDefault();
  ui.formJwt.style.display = 'block';
  let currentUrlData = {};
  try {
    // Faz o backup os dados atuais
    currentUrlData = await backpUrlData();
    // Salva as novas URLs
    await saveUrlData(ui.authUrl.value.trim(), ui.tokenUrl.value.trim());
    // Faz a autenticação
    await reAuthenticateOAuth();
    returnDesktop();
    alert.success('Autenticação realizada com sucesso.');
  } catch (error) {
    console.error('Error during authentication:', error);
    alert.error('Erro ao realizar a autenticação. Verifique os dados informados.');
  } finally {
    // Restaura os dados antigos
    saveUrlData(currentUrlData.authUrl, currentUrlData.tokenUrl);
  }
};

const saveUrlData = async (authUrl, tokenUrl) => {
  const msgBackground = {
    from: pluginContexts.options,
    action: pluginActions.saveDataOnStorage,
    data: {
      authUrl: authUrl,
      tokenUrl: tokenUrl
    }
  };
  await new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(msgBackground, (response) => {
      if (response && response.success) {
        //console.log('URL saved successfully:', response.url);
        resolve();
      } else {
        reject(new Error('Failed to send message to background script'));
      }
    })
  });
};

const backpUrlData = async () => {
  const msgBackground = {
    from: pluginContexts.options,
    action: pluginActions.getDataOnStorage,
    data: {
      authUrl: '',
      tokenUrl: ''
    }
  };
  return await new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(msgBackground, (response) => {
      if (response && response.success) {
        resolve(response.data);
      } else {
        reject(new Error('Failed to send message to background script'));
      }
    })
  });
};

const returnDesktop = () => {
  requestBackendData(`${base_url}/api/pluginSei/returnDesktop/`, (response) => {
    const desktops = response.data;
    let ids = desktops.map(desktop => desktop.id);
    let names = desktops.map(desktop => desktop.nameDesktop);
    const selectElement = document.getElementById("select-default-desktop");
    populateSelect(selectElement, ids, names, ui.selectDesktop.value);
  });
};

const populateSelect = (selectElement, valueList, descList, selectedValue) => {
  selectElement.innerHTML = ''; // Limpa as opções existentes
  selectElement.disabled = false; // Habilita o select
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Selecione uma opção';
  selectElement.appendChild(defaultOption);

  valueList.forEach((value, index) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = descList[index];
    if (value === selectedValue) {
      option.selected = true;
    }
    selectElement.appendChild(option);
  });
};

const clearSelect = (selectElement) => {
  selectElement.innerHTML = ''; // Limpa as opções existentes
  selectElement.disabled = true; // Desabilita o select
};

const requestBackendData = (url, callback) => {
  axios.get(url, { withCredentials: true })
    .then(response => { callback(response); })
    .catch((err) => console.log(err));
};

const getTextFromSelectValue = (selectElement, value) => {
  const options = selectElement.options;
  for (let i = 0; i < options.length; i++) {
    if (options[i].value === value) {
      return options[i].textContent;
    }
  }
  return '';
}