import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import IntegratedMap from './IntegratedMap';

const IntegratedMapPage = () => {
  const { i18n } = useTranslation();
  const { id } = useParams(); // For direct route or POI loading
  const [searchParams] = useSearchParams();
  
  // Get URL parameters
  const routeId = searchParams.get('route');
  const poiId = searchParams.get('poi');
  const mode = searchParams.get('mode') || 'all'; // 'all', 'pois', 'routes', 'planner'
  
  // Use the same language settings as the rest of the app
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);
  
  return (
    <div className="h-screen flex flex-col">
      {/* Pass the current language to IntegratedMap */}
      <IntegratedMap 
        initialRouteId={routeId || id} 
        initialPoiId={poiId} 
        initialMode={mode}
        currentLanguage={i18n.language}
      />
    </div>
  );
};

export default IntegratedMapPage;