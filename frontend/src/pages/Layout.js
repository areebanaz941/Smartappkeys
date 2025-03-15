// src/components/Layout.jsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="shrink-0 bg-white border-t">
        <div className="max-w-7xl mx-auto py-3 px-4 flex justify-center items-center relative">
          <div className="text-gray-600">
            © 2025 SmartAppKey
          </div>
          <Link 
            to="/admin" 
            className="bg-[#032c60] hover:bg-[#16a34a] text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors absolute right-4"
          >
            Admin
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Layout;