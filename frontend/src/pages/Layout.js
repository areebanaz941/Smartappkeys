// src/components/Layout.jsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { User } from 'lucide-react';


const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* User profile icon floating in top-right */}
      <Link
        to="/user-profile"
        className="absolute top-4 right-4 bg-white border rounded-full p-2 shadow hover:bg-green-100 transition"
        title="My Profile"
      >
        <User className="w-5 h-5 text-green-600" />
      </Link>
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="shrink-0 bg-white border-t">
        <div className="max-w-7xl mx-auto py-3 px-4 flex justify-center items-center relative">
          <div className="text-gray-600">
            © 2025 SmartAppKey
          </div>
          <Link 
            to="/adminlogin" 
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