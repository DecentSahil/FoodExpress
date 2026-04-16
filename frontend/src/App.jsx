import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import RestaurantList from './pages/RestaurantList';
import RestaurantMenu from './pages/RestaurantMenu';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import ProductRegister from './pages/ProductRegister';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantRegister from './pages/RestaurantRegister';
import OrderStatus from './pages/OrderStatus';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import RestaurantDashboard from './pages/RestaurantDashboard';
import SetPassword from './pages/SetPassword';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <div className="app">
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/restaurants" element={<RestaurantList />} />
                  <Route path="/restaurant/:id" element={<RestaurantMenu />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/product-register" element={<ProductRegister />} />
                  <Route path="/register-restaurant" element={<RestaurantRegister />} />
                  <Route path="/set-password" element={<SetPassword />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/order-status" element={<OrderStatus />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
                </Routes>
              </Layout>
            </Router>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
