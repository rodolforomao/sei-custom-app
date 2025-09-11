import React from 'react';
import ReactDOM from 'react-dom';
import { StyleSheetManager } from 'styled-components';
import { allStyles } from '../js/view/allStyles';

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
        shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, sheet];
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

export default renderInShadow;