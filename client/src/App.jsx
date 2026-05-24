import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AppContext';

import Navbar from './components/layout/Navbar/Navbar';
import Footer from './components/layout/Footer/Footer';
import AdminSidebar from './components/layout/AdminSidebar/AdminSidebar';
import NotificationSnackbar from './components/common/NotificationSnackbar/NotificationSnackbar';
import Loader from './components/common/Loader/Loader';

import Home from './pages/Home/Home';
import Catalog from './pages/Catalog/Catalog';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import Wishlist from './pages/Wishlist/Wishlist';
import Orders from './pages/Orders/Orders';
import Profile from './pages/Profile/Profile';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import About from './pages/About/About';
import Checkout from './pages/Checkout/Checkout';
import AdminDashboard from './pages/admin/Dashboard/Dashboard';
import AdminProducts from './pages/admin/Products/Products';
import AdminOrders from './pages/admin/Orders/Orders';
import AdminUsers from './pages/admin/Users/Users';
import AdminReports from './pages/admin/Reports/Reports';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { token, isAdmin } = useAuth();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-topbar" />
        <div className="admin-main">{children}</div>
      </div>
    </div>
  );
}

function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ flexGrow: 1 }}>{children}</main>
      <Footer />
    </>
  );
}

function AuthGate({ children }) {
  const { authLoading, token, user } = useAuth();
  if (authLoading && token && !user) {
    return <Loader message="Загрузка..." />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthGate>
        <Routes>
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/catalog" element={<MainLayout><Catalog /></MainLayout>} />
          <Route path="/products/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<MainLayout><About /></MainLayout>} />

          <Route path="/cart" element={<MainLayout><PrivateRoute><Cart /></PrivateRoute></MainLayout>} />
          <Route path="/checkout" element={<MainLayout><PrivateRoute><Checkout /></PrivateRoute></MainLayout>} />
          <Route path="/wishlist" element={<MainLayout><PrivateRoute><Wishlist /></PrivateRoute></MainLayout>} />
          <Route path="/orders" element={<MainLayout><PrivateRoute><Orders /></PrivateRoute></MainLayout>} />
          <Route path="/profile" element={<MainLayout><PrivateRoute><Profile /></PrivateRoute></MainLayout>} />

          <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminLayout><AdminProducts /></AdminLayout></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminLayout><AdminReports /></AdminLayout></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <NotificationSnackbar />
      </AuthGate>
    </BrowserRouter>
  );
}
