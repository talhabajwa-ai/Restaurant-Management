import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Menu from './pages/menu/Menu';
import Tables from './pages/tables/Tables';
import Orders from './pages/orders/Orders';
import Billing from './pages/billing/Billing';
import Staff from './pages/staff/Staff';
import Reports from './pages/reports/Reports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/menu"
            element={
              <ProtectedRoute roles={['admin', 'manager', 'waiter']}>
                <Layout>
                  <Menu />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/tables"
            element={
              <ProtectedRoute roles={['admin', 'manager', 'waiter']}>
                <Layout>
                  <Tables />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/orders"
            element={
              <ProtectedRoute roles={['admin', 'manager', 'waiter']}>
                <Layout>
                  <Orders />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/billing"
            element={
              <ProtectedRoute roles={['admin', 'manager', 'cashier']}>
                <Layout>
                  <Billing />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/staff"
            element={
              <ProtectedRoute roles={['admin', 'manager']}>
                <Layout>
                  <Staff />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/reports"
            element={
              <ProtectedRoute roles={['admin', 'manager']}>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;