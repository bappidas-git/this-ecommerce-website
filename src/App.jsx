import { Route, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout/MainLayout.jsx';

function HomePage() {
  return (
    <main style={{ padding: '24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)' }}>THIS Interiors</h1>
      <p>Open the hamburger to view the mobile drawer (resize below 900px).</p>
    </main>
  );
}

function SearchPage() {
  return (
    <main style={{ padding: '24px' }}>
      <h1>Search results</h1>
    </main>
  );
}

function PlaceholderPage({ title }) {
  return (
    <main style={{ padding: '24px' }}>
      <h1>{title}</h1>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/shop" element={<PlaceholderPage title="Shop" />} />
        <Route path="/new-arrivals" element={<PlaceholderPage title="New Arrivals" />} />
        <Route path="/bestsellers" element={<PlaceholderPage title="Bestsellers" />} />
        <Route path="/story" element={<PlaceholderPage title="Story" />} />
        <Route path="/journal" element={<PlaceholderPage title="Journal" />} />
        <Route path="/login" element={<PlaceholderPage title="Sign in" />} />
        <Route path="/register" element={<PlaceholderPage title="Create account" />} />
        <Route path="/account" element={<PlaceholderPage title="Profile" />} />
        <Route path="/account/orders" element={<PlaceholderPage title="Orders" />} />
        <Route path="/account/wishlist" element={<PlaceholderPage title="Wishlist" />} />
        <Route path="/category/:slug" element={<PlaceholderPage title="Category" />} />
      </Route>
    </Routes>
  );
}
