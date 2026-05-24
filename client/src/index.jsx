import { createRoot } from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import App from './App';
import './styles/global.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
  <AppProvider>
    <App />
  </AppProvider>,
);
