import React from 'react';
import styles from './styles.scss';
import classNames from 'classnames';
import loadingImg from './loading.svg';
import dueFormatter from './due.js';

import DuePanel from 'view/components/DuePanel';
import EditableParagraph from 'view/components/EditableParagraph';
import CardLocationSelector from 'view/components/CardLocationSelector';
import ChecklistPanel from 'view/components/ChecklistPanel';
import LabelPanel from 'view/components/LabelPanel';

import * as alert from 'view/alert.js';

import { OptionIcon, FooterIcon, HasAnotherCardIndicator } from './styles.js';

import { faCalendarAlt, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { faSyncAlt, faExternalLinkAlt, faCheckSquare, faAlignLeft, faTags, faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

class TrelloCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showOptions: false,
      isEditingDescription: false,
      isEditingDue: false,
      isEditingChecklist: false,
      isEditingLabel: false,
      isExpanded: false,
      processTooltip: {
        show: false,
        x: 0,
        y: 0,
      },
      isHovering: false,
    };
    this.refreshCard = this.refreshCard.bind(this);
    this.closeChecklistPanel = this.closeChecklistPanel.bind(this);
    this.closeLabelPanel = this.closeLabelPanel.bind(this);
  }

   componentDidMount() {
    window.addEventListener('expandAllCards', this.expandCard);
    window.addEventListener('collapseAllCards', this.collapseCard);
  }

  componentWillUnmount() {
    window.removeEventListener('expandAllCards', this.expandCard);
    window.removeEventListener('collapseAllCards', this.collapseCard);
  }

  expandCard = () => {
    this.setState({ isExpanded: true });
  };

  collapseCard = () => {
    this.setState({ isExpanded: false });
  };

  showTooltip(e) {
    this.setState({
      processTooltip: {
        show: true,
        x: e.target.offsetLeft,
        y: e.target.offsetTop,
      },
    });
    e.preventDefault();
  }

  hideTooltip(e) {
    this.setState({
      processTooltip: {
        show: false,
        x: 0,
        y: 0,
      },
    });
    e.preventDefault();
  }

  refreshCard(e) {
    if (!this.props.refreshCard) return;
    if (this.props.isLoading) return;
    this.props.refreshCard(this.props.cardID);
    if (e) e.preventDefault();
  }

  deleteCard() {
    if (!this.props.deleteCard) return;
    alert.confirm('Você deseja mesmo remover este cartão?').then((willDelete) => {
      if (willDelete.isConfirmed) this.props.deleteCard(this.props.cardID);
    });
  }

  extractProcessInfo() {
    const defaultInfo = { type: '', specification: '' };
    const info = this.props.originalAnchor.getAttribute('onmouseover');
    if (!info) return defaultInfo;
    const infosSplited = info.split("'");
    if (infosSplited.length !== 5) return defaultInfo;
    return {
      type: infosSplited[3],
      specification: infosSplited[1] || '(sem especificação)',
    };
  }

  onChangeName(newName) {
    if (this.props.onChangeName) this.props.onChangeName(this.props.cardID, newName, this.props.location.board);
  }

  onChangeDescription(newDescription) {
    if (this.props.onChangeDescription) this.props.onChangeDescription(this.props.cardID, newDescription, this.props.location.board);
  }

  onChangeLocation(type, newLocation) {
    if (this.props.onChangeLocation) this.props.onChangeLocation(this.props.cardID, type, newLocation, this.props.location.board);
  }

  onChangeDue(due, dueComplete) {
    this.setState({ isEditingDue: false });
    if (this.props.onChangeDue) this.props.onChangeDue(this.props.cardID, due, dueComplete, this.props.location.board);
  }

  onMouseEnter() {
    this.setState({ isHovering: true });
  }

  onMouseLeave(e) {
    if (e.buttons > 0) return; /* se tiver pressionando algum botão, não considera (ex.: dragging...) */
    this.setState({
      isHovering: false,
      isEditingDue: false /* close due panel on hover out */,
      isEditingChecklist: false /* close checklist panel on hover out */,
      isEditingLabel: false /* close label panel on hover out */,
    });
  }

  openDuePanel(e) {
    this.setState({
      isEditingDue: true,
      isEditingChecklist: false,
      isEditingLabel: false,
    });
    e.stopPropagation();
    e.preventDefault();
  }

  closeDuePanel() {
    this.setState({ isEditingDue: false });
  }

  openChecklistPanel(e) {
    this.setState({ isEditingChecklist: true, isEditingLabel: false, isEditingDue: false });
    e.stopPropagation();
    e.preventDefault();
  }

  closeChecklistPanel() {
    this.setState({ isEditingChecklist: false });
  }

  openLabelPanel(e) {
    this.setState({ isEditingLabel: true, isEditingChecklist: false, isEditingDue: false });
    e.stopPropagation();
    e.preventDefault();
  }

  closeLabelPanel() {
    this.setState({ isEditingLabel: false });
  }

  renderLabels() {
    if (this.props.labels.length === 0) return null;
    let uiLabels = [];
    this.props.labels.forEach((label, idx) => {
      uiLabels.push(
        <span
          key={idx}

          style={{ backgroundColor: label.color, marginLeft: '2px', marginRight: '2px', color: '#FFFFFF', padding: '2px 3px' }}
        >
          {label.name}
        </span>
      );
    });
    return (
      <div className={styles.labels} data-testid="card-labels">
        {uiLabels}
      </div>
    );
  }

  renderDue() {
    if (!this.props.due) return null;
    const due = dueFormatter(this.props.due, this.props.dueComplete);
    return (
      <>
        <FooterIcon icon={faCalendarAlt} />
        <span>
          {due.date}{' '}
          <span className={classNames(styles['due-message'], styles['due-' + due.class])}>{due.message}</span>
        </span>
      </>
    );
  }

  renderProcessTooltip() {
    const processInfo = this.extractProcessInfo();

    const elementStyle = {
      left: this.state.processTooltip.x,
      top: this.state.processTooltip.y + 20,
    };

    return (
      <div
        className={classNames(styles.processTooltip, { hide: !this.state.processTooltip.show })}
        style={elementStyle}
      >
        <h3>{processInfo.specification}</h3>
        <p>{processInfo.type}</p>
      </div>
    );
  }

  renderLoadingOverlay() {
    if (!this.props.isLoading) return null;
    return (
      <div className={styles.loadingOverlay}>
        <img src={loadingImg} className={loadingImg} />
      </div>
    );
  }

  renderProcessAnchor() {
  // Se originalAnchor existir, renderiza normalmente
  if (this.props.originalAnchor) {
    const relevantClasses = this.props.originalAnchor
      .getAttribute('class')
      .split(' ')
      .filter((className) => className.startsWith('processo'));

    return (
      <li className={styles.iconExpand}>
        <FooterIcon icon={faAlignLeft} />
        <a
          className={classNames(relevantClasses)}
          onMouseOver={this.showTooltip.bind(this)}
          onMouseOut={this.hideTooltip.bind(this)}
          href={this.props.originalAnchor.getAttribute('href')}
        >
          {this.props.originalAnchor.textContent.trim()}
        </a>
        {this.renderProcessTooltip()}
      </li>
    );
  }

  // Se originalAnchor for null, mas tiver processNumber
  if (!this.props.originalAnchor && this.props.processNumber) {
    return (
      <li className={styles.iconExpand}>
        <FooterIcon icon={faAlignLeft} />
         <span className={styles.processoNumber}>{this.props.processNumber}</span>
      </li>
    );
  }

  return null;
}

  render() {
    const isDescriptionEmpty = !(typeof this.props.description === 'string' && this.props.description.length > 0);

    const highlightCard =
      this.props.originalAnchor && this.props.originalAnchor.classList.contains('processoNaoVisualizado');

    return (
      <div
        className={classNames(styles.card, {
          [styles['full-width']]: this.props.fullWidth,
          [styles['highlight']]: highlightCard,
        })}
        onMouseEnter={this.onMouseEnter.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
        data-testid="card"
      >
        {/* Conteúdo escondido se não estiver expandido */}
        {this.state.isExpanded && (
          <>
            {this.renderLoadingOverlay()}

            {this.state.isEditingDue && (
              <DuePanel
                due={this.props.due}
                dueComplete={this.props.dueComplete}
                onClose={this.closeDuePanel.bind(this)}
                onChangeDue={this.onChangeDue.bind(this)}
              />
            )}

            {this.state.isEditingChecklist && (
              <ChecklistPanel cardID={this.props.cardID} onClose={this.closeChecklistPanel} />
            )}

            {this.state.isEditingLabel && (
              <LabelPanel
                cardID={this.props.cardID}
                boardID={this.props.location.board.id}
                cardLabels={this.props.labels}
                onClose={this.closeLabelPanel}
              />
            )}

            <div className={styles.options}>
              <a data-tooltip="Etiquetas" target="#" onClick={this.openLabelPanel.bind(this)}>
                <OptionIcon icon={faTags} $highlight={this.props.labels.length > 0} />
              </a>
              {/*<a data-tooltip="Checklist" target="#" onClick={this.openChecklistPanel.bind(this)}>
                <OptionIcon icon={faCheckSquare} $highlight={this.props.hasChecklist} />
              </a>*/}
              <a data-tooltip="Especificar data de entrega" target="#" onClick={this.openDuePanel.bind(this)}>
                <OptionIcon icon={faCalendarAlt} $highlight={!!this.props.due} />
              </a>
              <a data-tooltip="Remover Cartão" target="#" onClick={this.deleteCard.bind(this)}>
                <OptionIcon icon={faTrashAlt} />
              </a>
              <a data-tooltip="Atualizar Cartão" target="#" onClick={this.refreshCard}>
                <OptionIcon icon={faSyncAlt} />
              </a>
              <a data-tooltip="Abrir no Trello" target="_blank" rel="noreferrer" href={this.props.url}>
                <OptionIcon icon={faExternalLinkAlt} />
              </a>
              <a data-tooltip="Esconder cartão" onClick={() => this.setState({ isExpanded: false })}>
                <OptionIcon icon={faMinusSquare} />
              </a>
            </div>

            {this.props.hasAnotherCard && <HasAnotherCardIndicator />}

            <EditableParagraph
              paragraphClass={styles.name}
              value={this.props.name}
              onChange={(value) => {
                this.onChangeName(value);
              }}
            ></EditableParagraph>

            {this.renderLabels()}

            <div className={styles.location} data-testid="card-location">
              em{' '}
              <CardLocationSelector
                type="board"
                canChangeBoard={this.props.canChangeBoard}
                showSelector={this.state.isHovering}
                onChange={this.onChangeLocation.bind(this)}
                selected={this.props.location.board}
              ></CardLocationSelector>{' '}
              /{' '}
              <CardLocationSelector
                type="list"
                showSelector={this.state.isHovering}
                onChange={this.onChangeLocation.bind(this)}
                selected={this.props.location.list}
                currentBoard={this.props.location.board}
              ></CardLocationSelector>
            </div>

            <EditableParagraph
              wrapperClass={classNames(styles['descr-wrapper'], {
                [styles['hide']]: isDescriptionEmpty && !this.state.isEditingDescription,
              })}
              paragraphClass={styles.descr}
              value={this.props.description}
              onChangeState={(status) => {
                this.setState({ isEditingDescription: status === 'edit' });
              }}
              onChange={(value) => {
                this.onChangeDescription(value);
              }}
            ></EditableParagraph>
          </>
        )}

        {/* Footer sempre visível */}
        <div className={styles.footer}>
          <ul className={!this.state.isExpanded ? styles.processExpand : ''}>
              {this.renderProcessAnchor()}
              {!this.state.isExpanded && (
                <a data-tooltip="Mostrar cartão"  onClick={() => this.setState({ isExpanded: true })}>
                  <OptionIcon icon={faPlusSquare} $margin="5px" />
                </a>
              )}
            {this.state.isExpanded && (
              <li style={{}}>{this.renderDue()}</li>
            )}
          </ul>
        </div>
      </div>

    );
  }
}

export default TrelloCard;
