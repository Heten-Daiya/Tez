import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { lazy, Suspense } from 'react';
import { AppProvider } from './contexts/AppContext';
import { NotesProvider } from './contexts/NotesContext';
const App = lazy(() => import('./app.tsx'));
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <NotesProvider>
        <Suspense fallback={<div className="loading-indicator">Loading...</div>}>
          <App />
        </Suspense>
      </NotesProvider>
    </AppProvider>
  </StrictMode>
);