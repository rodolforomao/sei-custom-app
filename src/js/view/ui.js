import React from 'react';
import ReactDOM from 'react-dom';

import TrelloCard from './components/TrelloCard';
import TrelloRefreshButton from './components/TrelloRefreshButton';
import TrelloFilterButton from './components/TrelloFilterButton';
import TrelloExpandableButton from './components/TrelloExpandableButton';
import CreateTrelloCardButton from './components/CreateTrelloCardButton';

import * as filter from './helper/filter.js';
import updateCurrentData from './helper/current-data.js';

import * as store from 'model/store.js';
import * as actions from 'actions/trello.js';

import { StyleSheetManager } from 'styled-components';
import { allStyles } from './allStyles';

// Cria a folha de estilo global UMA VEZ para todos os Shadow DOMs
let sheet;
if ('adoptedStyleSheets' in Document.prototype) {
  sheet = new CSSStyleSheet();
  sheet.replaceSync(allStyles);
}

const renderInShadow = (placeholder, jsx) => {
  if (!placeholder || !(placeholder instanceof HTMLElement)) {
    console.warn('Placeholder inválido para Shadow DOM:', placeholder);
    return;
  }

  // Cria Shadow DOM se ainda não existir
  if (!placeholder.shadowRoot) {
    placeholder.attachShadow({ mode: 'open' });
  }
  const shadowRoot = placeholder.shadowRoot;

  // Impede que clicks dentro do shadowRoot fechem modais globais
  ['click', 'mousedown'].forEach(evt => {
    shadowRoot.addEventListener(evt, (e) => {
      const path = e.composedPath();
      if (path.includes(shadowRoot)) {
        e.stopPropagation();
      }
    });
  });

  // Aplica CSS raw (SCSS convertido)
  if (sheet) {
    shadowRoot.adoptedStyleSheets = [sheet];
  } else {
    let styleTag = shadowRoot.querySelector('style#shadow-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'shadow-styles';
      styleTag.textContent = allStyles;
      shadowRoot.appendChild(styleTag);
    }
  }

  // Cria container para renderizar o React
  let container = shadowRoot.querySelector('#shadow-root-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'shadow-root-container';
    shadowRoot.appendChild(container);
  }

  // Renderiza JSX dentro do Shadow DOM usando styled-components
  ReactDOM.render(
    <StyleSheetManager target={shadowRoot}>
      {jsx}
    </StyleSheetManager>,
    container
  );
};


// Funções de renderização
const renderRefreshButton = (placeholder, data) => {
  renderInShadow(
    placeholder,
    <TrelloRefreshButton
      onClick={() => actions.refreshCards()}
      isLoading={data.isLoading}
    />
  );
};

const renderFilterButton = (placeholder, data) => {
  renderInShadow(
    placeholder,
    <TrelloFilterButton
      currentLabels={data.currentLabels}
      currentLocations={data.currentLocations}
      filter={data.filter}
      hasFilter={!filter.isFilterEmpty(data.filter)}
      onFilterChange={(type, checked, key) => actions.updateFilter(type, checked, key)}
    />
  );
};

const renderExpandableButton = (placeholder, data) => {
  renderInShadow(
    placeholder,
    <TrelloExpandableButton isExpanded={data.isExpanded} />
  );
};

const renderTrelloCard = (placeholder, card, hasAnotherCard, originalAnchor, canChangeBoard, appendNumberOnTitle, isExpanded, moveChecklistItem) => {
  const fullWidth = placeholder.hasAttribute('data-full-width');

  renderInShadow(
    placeholder,
    <TrelloCard
      {...card}
      refreshCard={(cardID) => actions.refreshCardData(cardID)}
      deleteCard={(cardID) => actions.deleteCard(cardID)}
      onChangeName={(cardID, newName, boardData) => actions.updateCardData(cardID, { name: newName, board: boardData })}
      onChangeDescription={(cardID, newDescription, boardData) => actions.updateCardData(cardID, { description: newDescription, board: boardData, appendNumberOnTitle })}
      onChangeLocation={(cardID, type, newLocation, boardData) => {
        if (type === 'board') actions.updateCardData(cardID, { [type]: newLocation });
        else actions.updateCardData(cardID, { [type]: newLocation, board: boardData });
      }}
      onChangeDue={(cardID, due, dueComplete, boardData) => actions.updateCardData(cardID, { due, dueComplete, board: boardData })}
      hasAnotherCard={hasAnotherCard}
      fullWidth={fullWidth}
      originalAnchor={originalAnchor}
      canChangeBoard={canChangeBoard}
      isExpanded={isExpanded}
      moveChecklistItem={moveChecklistItem}
    />
  );
};

const renderCreateTrelloCardButton = (placeholder, processNumber, data, newCardData) => {
  renderInShadow(
    placeholder,
    <CreateTrelloCardButton
      isAdding={data.isAddingCardFor && processNumber === data.isAddingCardFor}
      processNumber={processNumber}
      onClick={() => actions.addCardFor(processNumber, newCardData, data.appendNumberOnTitle)}
    />
  );
};

const removeSpecialChars = (text) => text.replace(/[^0-9]/g, '').trim();

// Renderização de cada box de processo
const renderTrelloBox = (box, data) => {
  const processNumber = box.getAttribute('data-trello-process-number');
  const processAnchor = box.querySelector('[data-trello-process-anchor]');

  if (!processNumber) return;

  // Criar placeholder DIV para card se não existir
  let cardPlaceholder = box.querySelector('.trello-card');
  if (!cardPlaceholder) {
    cardPlaceholder = document.createElement('div');
    cardPlaceholder.className = 'trello-card';
    box.appendChild(cardPlaceholder);
  }

  // Criar placeholder DIV para create button se não existir
  let createCardPlaceholder = box.querySelector('.trello-create-card-button');
  if (!createCardPlaceholder) {
    createCardPlaceholder = document.createElement('div');
    createCardPlaceholder.className = 'trello-create-card-button';
    if (processAnchor) processAnchor.appendChild(createCardPlaceholder);
    else box.appendChild(createCardPlaceholder);
  }

  const cardsForThisProcess = data.cards.filter(
    (card) =>
      card.processNumber === processNumber ||
      card.processNumber === removeSpecialChars(processNumber)
  );

  const hasTrelloCard = cardsForThisProcess.length > 0;
  const cardToConsider = hasTrelloCard ? cardsForThisProcess[0] : null;
  const passedInFilter = filter.mustShow(data.filter, hasTrelloCard, cardToConsider);

  // Mostrar/ocultar box
  if (passedInFilter) box.classList.remove('hide');
  else box.classList.add('hide');

  if (hasTrelloCard) {
    if (processAnchor) processAnchor.classList.add('hide');
    cardPlaceholder.classList.remove('hide');
    createCardPlaceholder.classList.add('hide');
    ReactDOM.unmountComponentAtNode(createCardPlaceholder);

    renderTrelloCard(
      cardPlaceholder,
      cardToConsider,
      cardsForThisProcess.length > 1,
      processAnchor,
      data.canChangeBoard,
      data.appendNumberOnTitle,
      data.isExpanded,
      data.moveChecklistItem
    );
  } else {
    let newCardData = {};
    if (box.hasAttribute('data-trello-default-name'))
      newCardData.name = box.getAttribute('data-trello-default-name');
    if (box.hasAttribute('data-trello-default-description'))
      newCardData.description = box.getAttribute('data-trello-default-description');

    cardPlaceholder.classList.add('hide');
    if (processAnchor) processAnchor.classList.remove('hide');
    ReactDOM.unmountComponentAtNode(cardPlaceholder);

    createCardPlaceholder.classList.remove('hide');
    renderCreateTrelloCardButton(createCardPlaceholder, processNumber, data, newCardData);
  }
};

// Função principal de render
export const render = () => {
  const data = store.getData();

  const targets = {
    'refresh-button': { selector: '.trello-refresh-button', fn: renderRefreshButton },
    'filter-button': { selector: '.trello-filter-button', fn: renderFilterButton },
    'expandable-button': { selector: '.trello-expandable-button', fn: renderExpandableButton },
    'process-box': { selector: '[data-trello-process-box]', fn: renderTrelloBox },
  };

  Object.values(targets).forEach(({ selector, fn }) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => fn(el, data));
  });

  // Atualiza estado global
  const processBoxes = document.querySelectorAll('[data-trello-process-box]');
  updateCurrentData(data, processBoxes);
};

// Inicializa
render();

