import { createRoot } from 'react-dom/client';
import { App } from './App';
import { css } from './styles';

const host = document.getElementById('jenkins-ai-copilot-root');

if (host && !host.shadowRoot) {
  // The page decorator renders inside Jenkins' footer, which Jenkins hides on narrow screens.
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = css;
  const mount = document.createElement('div');
  mount.className = 'cp-reset';
  shadow.append(style, mount);
  createRoot(mount).render(<App />);
}
