import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Menu, 
  X, 
  Settings, 
  LogOut, 
  Map, 
  Calendar, 
  Bell, 
  Heart, 
  ShoppingBag, 
  Users, 
  Star, 
  BarChart, 
  Bike,
  MessageCircle,
  HelpCircle,
  Award,
  Home,
  PenTool
} from 'lucide-react';

export const DashboardLayout = ({ userType, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data on component mount
    const fetchUserData = async () => {
      try {
        // Try getting user data from localStorage first as a fallback
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
          
          // If the user is on the wrong dashboard, redirect them
          if (parsedUserData.userType !== userType) {
            redirectToCorrectDashboard(parsedUserData.userType);
            return;
          }
        }
        
        // Then attempt to get fresh data from the API
        const token = localStorage.getItem('token');
        if (!token) {
          // No token, redirect to login
          navigate('/login');
          return;
        }
        
        // Use the correct endpoint from your backend
        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          // If API call fails but we have userData from localStorage, keep using that
          if (!storedUserData) {
            // No stored data and API failed, redirect to login
            navigate('/login');
          }
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        
        // Update user data with fresh data from API
        setUserData(data.user);
        
        // Also update localStorage
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        // Check if user is on the correct dashboard
        if (data.user.userType !== userType) {
          redirectToCorrectDashboard(data.user.userType);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, userType]);

  const redirectToCorrectDashboard = (actualUserType) => {
    console.log(`Redirecting from ${userType} dashboard to ${actualUserType} dashboard`);
    
    switch(actualUserType) {
      case 'resident':
        navigate('/resident-dashboard');
        break;
      case 'tourist':
        navigate('/tourist-dashboard');
        break;
      case 'business':
        navigate('/business-dashboard');
        break;
      default:
        navigate('/login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  // Determine menu items based on user type
  const getMenuItems = () => {
    const commonItems = [
      { name: 'Settings', icon: <Settings className="w-5 h-5" />, path: `/${userType}-settings` },
      { name: 'Help', icon: <HelpCircle className="w-5 h-5" />, path: '/help' },
      { name: 'Logout', icon: <LogOut className="w-5 h-5" />, onClick: handleLogout }
    ];

    switch (userType) {
      case 'resident':
        return [
          { name: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/resident-dashboard' },
          { name: 'Map', icon: <Map className="w-5 h-5" />, path: '/map' },
          { name: 'Host Events', icon: <Calendar className="w-5 h-5" />, path: '/resident-events' },
          { name: 'My Neighborhood', icon: <Users className="w-5 h-5" />, path: '/resident-neighborhood' },
          { name: 'Notifications', icon: <Bell className="w-5 h-5" />, path: '/resident-notifications' },
          { name: 'Tourist Connections', icon: <MessageCircle className="w-5 h-5" />, path: '/resident-connections' },
          { name: 'Rewards', icon: <Award className="w-5 h-5" />, path: '/resident-rewards' },
          { name: 'Saved Places', icon: <Heart className="w-5 h-5" />, path: '/resident-favorites' },
          ...commonItems
        ];
      case 'tourist':
        return [
          { name: 'Explore', icon: <Map className="w-5 h-5" />, path: '/tourist-dashboard' },
          { name: 'Attractions', icon: <Star className="w-5 h-5" />, path: '/tourist-attractions' },
          { name: 'Bike Routes', icon: <Bike className="w-5 h-5" />, path: '/tourist-bike-routes' },
          { name: 'Events', icon: <Calendar className="w-5 h-5" />, path: '/tourist-events' },
          { name: 'Itinerary', icon: <BarChart className="w-5 h-5" />, path: '/tourist-itinerary' },
          { name: 'Connect with Locals', icon: <Users className="w-5 h-5" />, path: '/tourist-locals' },
          { name: 'My Rewards', icon: <Award className="w-5 h-5" />, path: '/tourist-rewards' },
          { name: 'Saved Places', icon: <Heart className="w-5 h-5" />, path: '/tourist-favorites' },
          ...commonItems
        ];
      case 'business':
        return [
          { name: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/business-dashboard' },
          { name: 'Orders', icon: <ShoppingBag className="w-5 h-5" />, path: '/business-orders' },
          { name: 'Listings', icon: <PenTool className="w-5 h-5" />, path: '/business-listings' },
          { name: 'Customers', icon: <Users className="w-5 h-5" />, path: '/business-customers' },
          { name: 'Analytics', icon: <BarChart className="w-5 h-5" />, path: '/business-analytics' },
          { name: 'Promotions', icon: <Star className="w-5 h-5" />, path: '/business-promotions' },
          { name: 'Reviews', icon: <MessageCircle className="w-5 h-5" />, path: '/business-reviews' },
          ...commonItems
        ];
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();

  // Custom background colors based on user type
  const getSidebarButtonColors = () => {
    switch (userType) {
      case 'resident':
        return 'hover:bg-emerald-50 hover:text-emerald-600';
      case 'tourist':
        return 'hover:bg-blue-50 hover:text-blue-600';
      case 'business':
        return 'hover:bg-amber-50 hover:text-amber-600';
      default:
        return 'hover:bg-gray-100 hover:text-gray-800';
    }
  };

  const getBrandColor = () => {
    switch (userType) {
      case 'resident':
        return 'text-emerald-500';
      case 'tourist':
        return 'text-blue-500';
      case 'business':
        return 'text-amber-500';
      default:
        return 'text-[#22c55e]';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className={`inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-${getBrandColor()}`}></div>
          <p className="mt-2 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md text-gray-600 hover:text-[#22c55e] focus:outline-none"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <MapPin className={`h-6 w-6 ${getBrandColor()} mr-2`} />
              <span className={`${getBrandColor()} font-bold text-lg`}>Smart Travel</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User info */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full bg-${getBrandColor().replace('text-', '')}/20 flex items-center justify-center ${getBrandColor()} font-semibold`}>
                {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
              </div>
              <div>
                <h3 className="font-medium text-gray-800">
                  {userData?.firstName} {userData?.lastName}
                </h3>
                <p className="text-xs text-gray-500 capitalize">{userData?.userType}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {menuItems.map((item, index) => (
                <li key={index}>
                  {item.onClick ? (
                    <button
                      onClick={item.onClick}
                      className={`flex items-center w-full px-3 py-2 text-sm rounded-lg text-gray-600 ${getSidebarButtonColors()}`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center px-3 py-2 text-sm rounded-lg text-gray-600 ${getSidebarButtonColors()}`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer info */}
          <div className="p-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              Smart App Key v1.2 &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;