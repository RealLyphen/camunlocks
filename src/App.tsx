import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Status from './components/Status'
import Footer from './components/Footer'
import ProductPage from './pages/ProductPage'
import OrderHistory from './pages/OrderHistory'
import PopularProducts from './components/PopularProducts'
import Docs from './pages/Docs'
import Maintenance from './components/Maintenance'
import RecentPurchasePopup from './components/RecentPurchasePopup'
import AnnouncementBar from './components/AnnouncementBar'
import StorePopup from './components/StorePopup'
import { useStore } from './context/StoreContext'
import './App.css'

// Admin Imports
import AdminLayout from './admin/components/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import Blacklists from './admin/pages/FraudShield/Blacklists';
import CreateBlacklist from './admin/pages/FraudShield/CreateBlacklist';
import AuditLogs from './admin/pages/FraudShield/AuditLogs';
import CashAppVerification from './admin/pages/FraudShield/CashAppVerification';
import DeliveryEmail from './admin/pages/Settings/DeliveryEmail';
import Notifications from './admin/pages/Settings/Notifications';
import PaymentMethods from './admin/pages/Settings/PaymentMethods';
import CustomizeStore from './admin/pages/Settings/CustomizeStore';
import Products from './admin/pages/Products/Products';
import CreateProduct from './admin/pages/Products/CreateProduct';
import EditProduct from './admin/pages/Products/EditProduct';
import Categories from './admin/pages/Products/Categories';
import CreateCategory from './admin/pages/Products/CreateCategory';
import Coupons from './admin/pages/Products/Coupons';
import CreateCoupon from './admin/pages/Products/CreateCoupon';
import EditCoupon from './admin/pages/Products/EditCoupon';
import StatusManager from './admin/pages/Products/StatusManager';
import GiftCards from './admin/pages/Products/GiftCards';
import CreateGiftCard from './admin/pages/Products/CreateGiftCard';
import EditGiftCard from './admin/pages/Products/EditGiftCard';
import PageBuilder from './admin/pages/Settings/PageBuilder';
import VisitorAnalytics, { trackPageView } from './admin/pages/VisitorAnalytics';
import Analytics from './admin/pages/Analytics';
import Customers from './admin/pages/Customers';
import Referrals from './admin/pages/Customers/Referrals';
import CreateReferral from './admin/pages/Customers/CreateReferral';
import ReferralLeaderboard from './admin/pages/Customers/ReferralLeaderboard';
import SEO from './admin/pages/Settings/SEO';
import CouponAnalytics from './admin/pages/Products/CouponAnalytics';
import DiscordWidget from './components/DiscordWidget';

// Utility for shifting hex to HSL and generating a secondary gradient color
function hexToHSL(hex: string) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1]);
    g = parseInt("0x" + hex[2] + hex[2]);
    b = parseInt("0x" + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2]);
    g = parseInt("0x" + hex[3] + hex[4]);
    b = parseInt("0x" + hex[5] + hex[6]);
  }
  r /= 255; g /= 255; b /= 255;
  const cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin;
  let h = 0, s = 0, l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;
  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return { h, s, l };
}

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const { settings } = useStore();

  // Track every page view for analytics
  useEffect(() => {
    if (!isAdmin) trackPageView(location.pathname);
  }, [location.pathname, isAdmin]);

  useEffect(() => {
    if (settings?.seo) {
      document.title = settings.seo.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', settings.seo.description);
      } else {
        const newMetaDesc = document.createElement('meta');
        newMetaDesc.name = 'description';
        newMetaDesc.content = settings.seo.description;
        document.head.appendChild(newMetaDesc);
      }
      // Favicon
      if (settings.faviconUrl) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = settings.faviconUrl;
      }
    }
  }, [settings?.seo]);

  // Global Accent Color Injection
  useEffect(() => {
    if (settings?.accentColor) {
      try {
        const { h, s, l } = hexToHSL(settings.accentColor);
        // Primary is the exact user picker choice
        document.documentElement.style.setProperty('--primary-color', settings.accentColor);
        document.documentElement.style.setProperty('--primary-color-rgb', `hsl(${h}, ${s}%, ${l}%)`);

        // Secondary is calculated by shifting the hue 30 degrees (gives that blue/purple vaporwave look)
        const secondaryHue = (h - 30 + 360) % 360;
        document.documentElement.style.setProperty('--secondary-color', `hsl(${secondaryHue}, ${s}%, ${l}%)`);
      } catch (e) {
        document.documentElement.style.setProperty('--primary-color', settings.accentColor);
        document.documentElement.style.setProperty('--secondary-color', settings.accentColor);
      }
    }
  }, [settings?.accentColor]);

  return (
    <>
      {settings?.maintenanceMode && !isAdmin && <Maintenance />}
      {!isAdmin && (
        <>
          <StorePopup />
          <AnnouncementBar />
          <Navbar />
        </>
      )}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <>
            {settings?.homeLayout?.map((block) => {
              if (block.type === 'hero') return <Hero key={block.id} config={block.config} />;
              if (block.type === 'popular_products') return <PopularProducts key={block.id} config={block.config} />;
              return null;
            })}
            <div style={{ height: 80 }} />
          </>
        } />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/status" element={<Status />} />
        <Route path="/docs" element={<Docs />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<VisitorAnalytics />} />
          <Route path="store-analytics" element={<Analytics />} />

          {/* Customers */}
          <Route path="customers" element={<Customers />} />
          <Route path="customers/referrals" element={<Referrals />} />
          <Route path="customers/referrals/create" element={<CreateReferral />} />
          <Route path="customers/leaderboard" element={<ReferralLeaderboard />} />

          {/* Settings Routes */}
          <Route path="settings/email" element={<DeliveryEmail />} />
          <Route path="settings/notifications" element={<Notifications />} />
          <Route path="settings/payments" element={<PaymentMethods />} />
          <Route path="settings/customize" element={<CustomizeStore />} />
          <Route path="settings/builder" element={<PageBuilder />} />
          <Route path="settings/seo" element={<SEO />} />

          {/* Fraud Shield Routes */}
          <Route path="fraud/blacklists" element={<Blacklists />} />
          <Route path="fraud/blacklists/create" element={<CreateBlacklist />} />
          <Route path="fraud/audit-logs" element={<AuditLogs />} />
          <Route path="fraud/cashapp" element={<CashAppVerification />} />

          {/* Product Routes */}
          <Route path="products" element={<Products />} />
          <Route path="products/create" element={<CreateProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="products/categories" element={<Categories />} />
          <Route path="products/categories/create" element={<CreateCategory />} />

          {/* Coupon Routes */}
          <Route path="products/coupons" element={<Coupons />} />
          <Route path="products/coupons/create" element={<CreateCoupon />} />
          <Route path="products/coupons/edit/:id" element={<EditCoupon />} />
          <Route path="products/coupon-analytics" element={<CouponAnalytics />} />

          {/* Status Route */}
          <Route path="products/status" element={<StatusManager />} />

          {/* Gift Card Routes */}
          <Route path="products/giftcards" element={<GiftCards />} />
          <Route path="products/giftcards/create" element={<CreateGiftCard />} />
          <Route path="products/giftcards/edit/:id" element={<EditGiftCard />} />

          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
      {!isAdmin && (
        <>
          <RecentPurchasePopup />
          <DiscordWidget />
          <Footer />
        </>
      )}
    </>
  )
}

export default App
