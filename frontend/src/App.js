import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './i18n'; 
import HomePage from './pages/home';
import Layout from './pages/Layout';

import "./index.css";

import AdminPage from './pages/adminpage';
import POIManagementPage from './components/admin/POIManagementPage';
import POIAnalyticsPage from './components/admin/POIAnalyticsPage';
import BulkUploadPage from './components/admin/BulkUploadPage';
import MapPage from './pages/map/map';
import ResidentDashboard from './components/Dashboard/ResidentDashboard';
import TouristDashboard from './components/Dashboard/TouristDashboard';
import BusinessDashboard from './components/Dashboard/BusinessDashboard';

import RouteCreationPage from './pages/navigation/RouteCreationPage';
import BikeWalkNavigation from './components/admin/BikeWalkNavigation';
import RouteManagementPage from './components/admin/RouteManagementPage';
import NavigationAnalyticsPage from './components/admin/NavigationAnalyticsPage';
import NavigationSettingsPage from './components/admin/NavigationSettingsPage';

import BikeRouteUpload from './components/admin/GpxUploadForm';
import BikeRouteManagement from './components/admin/BikeRouteManagement';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/admin" element={<AdminPage/>} />
          <Route path="/admin/poi" element={<POIManagementPage />} />
          <Route path="/admin/poi/new" element={<POIManagementPage initialView="add" />} />
          <Route path="/admin/poi/bulk-upload" element={<BulkUploadPage />} />
          <Route path="/admin/poi/analytics" element={<POIAnalyticsPage />} />
          <Route path="/map" element={<MapPage/>} />
          <Route path="/resident-dashboard" element={<ResidentDashboard/>} />
          <Route path="/tourist-dashboard" element={<TouristDashboard/>} />
          <Route path="/business-dashboard" element={<BusinessDashboard/>} />

          {/* Bike Route Management Routes */}
          <Route path="/admin/bike-routes" element={<BikeRouteManagement />} />
          <Route path="/admin/bike-routes/upload" element={<BikeRouteUpload />} />
          <Route path="/admin/bike-routes/new" element={<BikeRouteManagement mode="create" />} />
          <Route path="/admin/bike-routes/edit/:id" element={<BikeRouteManagement mode="edit" />} />
          <Route path="/admin/bike-routes/statistics" element={<BikeRouteManagement mode="statistics" />} />
          {/* Add more routes as needed */}

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
