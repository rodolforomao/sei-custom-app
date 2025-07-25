import React, { useState } from 'react';
import TrelloButton from 'view/components/TrelloButton';
import { faPlusSquare, faMinusSquare } from '@fortawesome/free-solid-svg-icons';

const TrelloExpandableButton = ({ isExpanded: initialExpanded = false }) => {
   const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const toggleExpand = () => {
    const eventName = isExpanded ? "collapseAllCards" : "expandAllCards";
    window.dispatchEvent(new CustomEvent(eventName));
    setIsExpanded(!isExpanded);
  };

  return (
    <TrelloButton
      title={isExpanded ? 'Esconder cartões' : 'Expandir cartões'}
      icon={isExpanded ? faMinusSquare : faPlusSquare}
      onClick={toggleExpand}
    />
  );
};

export default TrelloExpandableButton;