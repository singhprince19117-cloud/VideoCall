import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
// 1. Import your AuthProvider (adjust the path if your file is located elsewhere)
import { AuthProvider } from './contexts/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    {/* 2. Wrap App with AuthProvider so its functions are available everywhere */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)