import React, { useEffect } from 'react';

function MyComponent() {
  // ID único para o botão
  const buttonId = 'my-component-button';

  useEffect(() => {
    // Função que será chamada quando o botão for clicado
    const handleClick = (e) => {
      const target = e.target.closest(`#${buttonId}`);
      if (target) {
        console.log('Botão clicado via delegação global');
        // Aqui você pode colocar qualquer ação do botão
      }
    };

    // Delegando o clique no document
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <button id={buttonId} type="button">
      Botão Fora
    </button>
  );
}

export default MyComponent;
