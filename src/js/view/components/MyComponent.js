import React, { useRef, useEffect } from 'react';

function MyComponent() {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      const handleClick = () => {
        console.log('Botão clicado dentro do MyComponent');
        // Aqui você coloca qualquer ação que o botão deve fazer
      };

      element.addEventListener('click', handleClick);

      return () => {
        element.removeEventListener('click', handleClick);
      };
    }
  }, []);

  return <button ref={elementRef} type="button">Botão Fora</button>;
}

export default MyComponent;