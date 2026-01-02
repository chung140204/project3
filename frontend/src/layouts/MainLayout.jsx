// Main application layout component
// Combines Navbar, main content area, and Footer
// Provides consistent page structure across the application

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function MainLayout({ children, showNavbar = true }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar at the top - conditionally rendered */}
      {showNavbar && <Navbar />}
      
      {/* Main content area - centered with max-width */}
      <main className={`flex-grow ${showNavbar ? 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8' : ''}`}>
        {children}
      </main>
      
      {/* Footer at the bottom - conditionally rendered */}
      {showNavbar && <Footer />}
    </div>
  );
}

