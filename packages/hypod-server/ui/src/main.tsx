import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import './styles.css';

const application = document.querySelector('#hypod-application');

if (!application) {
  throw new Error('The Hypod application mount point is missing.');
}

createRoot(application).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
