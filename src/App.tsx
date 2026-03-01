import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header, BottomNav, ToastContainer } from './components/Layout';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import DealDetailPage from './pages/DealDetailPage';
import MyCouponsPage from './pages/MyCouponsPage';
import FavoritesPage from './pages/FavoritesPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import MapPage from './pages/MapPage';
import AdminDashboard from './pages/AdminPages';
import BusinessDashboard from './pages/BusinessPages';
import DeployGuidePage from './pages/DeployGuidePage';
import InstallPrompt from './components/InstallPrompt';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative shadow-2xl">
          <Header />
          <ToastContainer />
          <main className="pb-2">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/deal/:id" element={<DealDetailPage />} />
              <Route path="/my-coupons" element={<MyCouponsPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/business" element={<BusinessDashboard />} />
              <Route path="/deploy-guide" element={<DeployGuidePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Routes>
          </main>
          <BottomNav />
          <InstallPrompt />
        </div>
      </HashRouter>
    </AppProvider>
  );
}
