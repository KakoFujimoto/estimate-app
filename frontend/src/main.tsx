import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';
import { DemoApp } from './pages/demo/DemoApp';
import { DemoDashboard } from './pages/demo/DemoDashboard';
import { DemoEstimateEditor } from './pages/demo/DemoEstimateEditor';
import { DemoEstimateList } from './pages/demo/DemoEstimateList';
import { DemoLogin } from './pages/demo/DemoLogin';
import { DemoCustomerDetail } from './pages/demo/DemoCustomerDetail';
import { DemoMasters } from './pages/demo/DemoMasters';
import { DemoSettings } from './pages/demo/DemoSettings';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/demo" replace />} />
            <Route path="/demo" element={<DemoApp />}>
              <Route index element={<DemoDashboard />} />
              <Route path="login" element={<DemoLogin />} />
              <Route path="estimates" element={<DemoEstimateList />} />
              <Route path="estimates/:id" element={<DemoEstimateEditor />} />
              <Route path="masters" element={<DemoMasters />} />
              <Route path="masters/customers/:id" element={<DemoCustomerDetail />} />
              <Route path="settings" element={<DemoSettings />} />
            </Route>
            <Route path="*" element={<Navigate to="/demo" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
