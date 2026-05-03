import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen transition-colors duration-500">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative overflow-hidden transition-all duration-300">
        {/* Subtle Background glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#4D6BFF]/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8BA8FF]/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        
        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 pt-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
