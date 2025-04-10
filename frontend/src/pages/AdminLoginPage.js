import React, { useState } from 'react';
import { ChevronLeft, Calendar, Bike, User, Phone, Mail } from 'lucide-react';
const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Hardcoded admin credentials
    const adminEmail = 'admin1@gmail.com';
    const adminPassword = '12345@12345';

    if (email === adminEmail && password === adminPassword) {
      // Successful login, redirect or update state
      console.log('Admin logged in successfully');
      // Add your login logic here
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      

      <div className="w-full max-w-md">

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded px-6 py-8">
        <div className="px-4 py-3 flex items-center border-b">
        <button 
          className="p-1 mr-3 rounded-full hover:bg-gray-100"
          aria-label="Go back"
          onClick={() => window.location.href = '/admin'}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <img 
                src="/logo.png" 
                alt="San Lorenzo Nuovo Logo" 
                className="h-16 w-auto mr-3" 
              />
        <h1 className="text-lg font-medium">Admin Login</h1>
        </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              onClick={() => window.location.href = '/admin'}
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;