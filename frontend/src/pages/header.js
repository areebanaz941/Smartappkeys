import React from "react";

const Header = () => {
  return (
    <header className="bg-green-800 border-b">
      <nav className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <a href="/" className="text-gray-50 font-bold">
              Smart App Key
            </a>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="/about" className="text-gray-50">
              About
            </a>
            <a href="/find-roads" className="text-gray-50">
              Find POI
            </a>
            <a href="/upload" className="text-gray-50">
              Upload POI
            </a>
            <a href="/contact" className="text-gray-50">
              Contact
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;