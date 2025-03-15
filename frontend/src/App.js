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
import MapPage from './pages/map';
import ResidentDashboard from './components/Dashboard/ResidentDashboard';
import TouristDashboard from './components/Dashboard/TouristDashboard';
import BusinessDashboard from './components/Dashboard/BusinessDashboard';
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
          {/* Add more routes as needed */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
