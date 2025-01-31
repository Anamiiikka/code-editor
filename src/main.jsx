import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // Remove .tsx extension
import './index.css';

// Get the root element
const rootElement = document.getElementById('root');

// Check if the root element exists before rendering
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error('Root element not found');
}