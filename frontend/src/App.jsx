import { Link, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Home from './pages/Home.jsx'
import Browse from './pages/Browse.jsx'
import CarDetail from './pages/CarDetail.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import DealerProfile from './pages/DealerProfile.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import VerifyBanner from './components/VerifyBanner.jsx'
import NotFound from './pages/NotFound.jsx'
import Profile from './pages/Profile.jsx'

import PostRequest from './pages/buyer/PostRequest.jsx'
import MyOffers from './pages/buyer/MyOffers.jsx'
import Favorites from './pages/buyer/Favorites.jsx'

import ListCar from './pages/seller/ListCar.jsx'
import MyListings from './pages/seller/MyListings.jsx'

import DealerDashboard from './pages/dealer/Dashboard.jsx'
import ManageListings from './pages/dealer/ManageListings.jsx'
import OpenRequests from './pages/dealer/OpenRequests.jsx'

import AdminDashboard from './pages/admin/Dashboard.jsx'
import VerifyDealers from './pages/admin/VerifyDealers.jsx'
import ApproveListings from './pages/admin/ApproveListings.jsx'
import ManageUsers from './pages/admin/ManageUsers.jsx'

function Guard({ roles, children }) {
  return <ProtectedRoute roles={roles}>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <>
      <Navbar />
      <VerifyBanner />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/cars/:id" element={<CarDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/dealers/:id" element={<DealerProfile />} />

          <Route path="/profile" element={<Guard roles={['buyer', 'seller', 'dealer', 'admin']}><Profile /></Guard>} />

          <Route path="/buyer/post-request" element={<Guard roles={['buyer']}><PostRequest /></Guard>} />
          <Route path="/buyer/offers" element={<Guard roles={['buyer']}><MyOffers /></Guard>} />
          <Route path="/buyer/favorites" element={<Guard roles={['buyer']}><Favorites /></Guard>} />

          <Route path="/seller/listings" element={<Guard roles={['seller']}><MyListings /></Guard>} />
          <Route path="/seller/list-car" element={<Guard roles={['seller']}><ListCar /></Guard>} />
          <Route path="/seller/list-car/:id" element={<Guard roles={['seller']}><ListCar /></Guard>} />

          <Route path="/dealer" element={<Guard roles={['dealer']}><DealerDashboard /></Guard>} />
          <Route path="/dealer/listings" element={<Guard roles={['dealer']}><ManageListings /></Guard>} />
          <Route path="/dealer/requests" element={<Guard roles={['dealer']}><OpenRequests /></Guard>} />

          <Route path="/admin" element={<Guard roles={['admin']}><AdminDashboard /></Guard>} />
          <Route path="/admin/dealers" element={<Guard roles={['admin']}><VerifyDealers /></Guard>} />
          <Route path="/admin/listings" element={<Guard roles={['admin']}><ApproveListings /></Guard>} />
          <Route path="/admin/users" element={<Guard roles={['admin']}><ManageUsers /></Guard>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span><b>CarLens</b> - buy, sell and get the best offers for cars in Kenya.</span>
          <span>
            <Link to="/browse" style={{ color: '#cfc3ea' }}>Browse</Link> ·{' '}
            <Link to="/register" style={{ color: '#cfc3ea' }}>Join us</Link>
          </span>
        </div>
      </footer>
    </>
  )
}
