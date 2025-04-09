import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import IntegratedMap from './IntegratedMap';

const IntegratedMapPage = () => {
  const { id } = useParams(); // For direct route or POI loading
  const [searchParams] = useSearchParams();
  
  // Get URL parameters
  const routeId = searchParams.get('route');
  const poiId = searchParams.get('poi');
  const mode = searchParams.get('mode') || 'all'; // 'all', 'pois', 'routes', 'planner'
  
  return (
    <div className="h-screen flex flex-col">
      {/* You can pass props to IntegratedMap if needed */}
      <IntegratedMap 
        initialRouteId={routeId || id} 
        initialPoiId={poiId} 
        initialMode={mode} 
      />
    </div>
  );
};

export default IntegratedMapPage;