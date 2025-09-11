// allStyles.js
import buttonStyles from './components/Button/styles.scss?raw';
import cardLocationSelectorStyles from './components/CardLocationSelector/styles.scss?raw';
import checkboxListStyles from './components/CheckboxList/styles.scss?raw';
import contextMenuStyles from './components/ContextMenu/styles.scss?raw';
import createCardButtonStyles from './components/CreateTrelloCardButton/styles.scss?raw';
import duePanelStyles from './components/DuePanel/styles.scss?raw';
import editableParagraphStyles from './components/EditableParagraph/styles.scss?raw';
import trelloButtonStyles from './components/TrelloButton/styles.scss?raw';
import trelloCardStyles from './components/TrelloCard/styles.scss?raw';
import trelloFilterButtonStyles from './components/TrelloFilterButton/styles.scss?raw';
import trelloRefreshButtonStyles from './components/TrelloRefreshButton/styles.scss?raw';

import commonStyles from '../../css/common.scss?raw';
import optionsStyles from '../../css/options.scss?raw';
import process_contentStyles from '../../css/process_content.scss?raw';
import process_listStyles from '../../css/process_list.scss?raw';
import utilitiesStyles from '../../css/utilities.css?raw';


// concatena todos os SCSS raw em uma única string
export const allStyles = `
${buttonStyles}
${cardLocationSelectorStyles}
${checkboxListStyles}
${contextMenuStyles}
${createCardButtonStyles}
${duePanelStyles}
${editableParagraphStyles}
${trelloButtonStyles}
${trelloCardStyles}
${trelloFilterButtonStyles}
${trelloRefreshButtonStyles}
${commonStyles}
${optionsStyles}
${process_contentStyles}
${process_listStyles}
${utilitiesStyles}
`;
