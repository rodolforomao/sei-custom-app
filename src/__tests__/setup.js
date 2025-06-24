import { createChromeMock } from './e2e/html/mock';

window.HTMLElement.prototype.scrollIntoView = jest.fn();

/**
 * Mock da API do Chrome para unit tests
 * Reutiliza a configuração do mock E2E
 */
global.chrome = createChromeMock();
