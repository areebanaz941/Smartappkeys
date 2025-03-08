import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MapPage from './components/Map';
import HomePage from './pages/home';
import Layout from './pages/Layout';
import ColoradoRoutes from './pages/colorado';
import "./index.css";
import RouteUploadForm from './components/UploadRoutes';
import RouteDetail from './components/RouteDetail';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="find-roads" element={<MapPage />} />
          <Route path="upload" element={<RouteUploadForm />} />
          <Route path="colorado" element={<ColoradoRoutes/>}/>
          <Route path="/route/:id" element={<RouteDetail />} />
          {/* Add more routes as needed */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
