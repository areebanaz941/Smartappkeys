// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="shrink-0 bg-white border-t">
        <div className="max-w-7xl mx-auto py-3 px-4 text-center text-gray-600">
          © 2025 SmartAppKey
        </div>
      </footer>
    </div>
  );
};

export default Layout;