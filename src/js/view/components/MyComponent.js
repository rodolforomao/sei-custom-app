import React, { useEffect, useRef } from 'react';

function MyComponent() {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      const handleClick = (e) => {
        const elementHolder = element.parentElement.parentElement.parentElement;
        console.log('Current element: ' + element);
        console.log('Element holder: ' + elementHolder);
        // console.log('Data testid: ' + elementHolder.getAttribute('data-testid'));
        // console.log('[BEF] Parent element class list: ' + elementHolder.classList);
        // elementHolder.classList.add('expanded-card');
        // console.log('[AFT] Parent element class list: ' + elementHolder.classList);

        //setState({ isExpanded: !state });
        //console.log('FIM');
      };

      // Add event listener directly to the DOM element
      element.addEventListener('click', handleClick);

      // Cleanup
      return () => {
        element.removeEventListener('click', handleClick);
      };
    }
  }, []);

  return <div ref={elementRef}>Click me</div>;
}

// function MyComponent({ state, setState, cardId }) {
//   // ID único para o botão
//   const elementRef = useRef(null);

//   useEffect(() => {
//     // Função que será chamada quando o botão for clicado
//     const element = elementRef.current;
//     if (element) {
//       const handleClick = (e) => {
//         console.log('Clicou no botão');
//       };
//     }

//     // Delegando o clique no document
//     element.addEventListener('click', handleClick);

//     return () => {
//       element.removeEventListener('click', handleClick);
//     };
//   }, []);

//   return (
//     <button id={cardId} type="button">
//       Botão Fora
//     </button>
//   );
// }

export default MyComponent;
