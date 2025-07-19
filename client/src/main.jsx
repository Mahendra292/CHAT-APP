import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import AuthContextProvider from '../context/AuthContext.jsx'; // ✅ Correct default import

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthContextProvider> {/* ✅ This matches default export */}
        <App />
      </AuthContextProvider>
    </BrowserRouter>
  </StrictMode>
);
