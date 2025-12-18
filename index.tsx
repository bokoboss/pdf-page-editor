import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  const msg = "FATAL ERROR: Could not find root element 'root' in index.html";
  console.error(msg);
  document.body.innerHTML = `<div style="color:red; padding: 20px;">${msg}</div>`;
  throw new Error(msg);
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("App mounted successfully");
} catch (error) {
  console.error("Failed to mount React app:", error);
}