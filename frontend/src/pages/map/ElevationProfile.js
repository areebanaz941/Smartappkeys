import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as turf from '@turf/turf';

const ElevationProfile = ({ routePath, totalDistance }) => {
  const [elevationData, setElevationData] = useState([]);
  
  useEffect(() => {
    if (!routePath || routePath.length === 0) return;
    
    // Process path data to create elevation profile
    const processElevationData = () => {
      let distance = 0;
      const data = routePath.map((coord, index) => {
        // Calculate distance from start (in km)
        if (index > 0) {
          const from = turf.point([routePath[index-1][0], routePath[index-1][1]]);
          const to = turf.point([coord[0], coord[1]]);
          distance += turf.distance(from, to);
        }
        
        return {
          distance: parseFloat(distance.toFixed(2)),
          elevation: coord[2] || 0,
          // Add point index for hover identification
          pointIndex: index
        };
      });
      
      // Reduce data points for better performance if too many points
      const maxPoints = 200;
      if (data.length > maxPoints) {
        const step = Math.floor(data.length / maxPoints);
        const reducedData = [];
        
        for (let i = 0; i < data.length; i += step) {
          reducedData.push(data[i]);
        }
        
        // Ensure the last point is included
        if (reducedData[reducedData.length - 1] !== data[data.length - 1]) {
          reducedData.push(data[data.length - 1]);
        }
        
        setElevationData(reducedData);
      } else {
        setElevationData(data);
      }
    };
    
    processElevationData();
  }, [routePath]);
  
  // Calculate min/max elevation for Y-axis domain
  const getElevationDomain = () => {
    if (elevationData.length === 0) return [0, 100];
    
    const elevations = elevationData.map(point => point.elevation);
    const minElevation = Math.floor(Math.min(...elevations) / 10) * 10; // Round to nearest 10m below
    const maxElevation = Math.ceil(Math.max(...elevations) / 10) * 10;  // Round to nearest 10m above
    
    return [minElevation, maxElevation];
  };
  
  // Custom tooltip for the chart
  const ElevationTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-xs">
          <p className="font-medium">Elevation: {payload[0].value} m</p>
          <p className="text-gray-500">Distance: {payload[0].payload.distance} km</p>
        </div>
      );
    }
    
    return null;
  };
  
  if (elevationData.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        No elevation data available
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-sm font-medium mb-2">Elevation Profile</h3>
      
      <div className="w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={elevationData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis 
              dataKey="distance" 
              label={{ value: 'Distance (km)', position: 'insideBottomRight', offset: 0 }}
              domain={[0, 'dataMax']}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <YAxis 
              domain={getElevationDomain()}
              label={{ value: 'Elevation (m)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<ElevationTooltip />} />
            <Line 
              type="monotone" 
              dataKey="elevation" 
              stroke="#3b82f6" 
              dot={false} 
              strokeWidth={2} 
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <div>
          <strong>Total Distance:</strong> {totalDistance ? (totalDistance / 1000).toFixed(1) + ' km' : 'N/A'}
        </div>
        <div>
          <strong>Elevation Range:</strong> {getElevationDomain()[0]}m - {getElevationDomain()[1]}m
        </div>
      </div>
    </div>
  );
};

export default ElevationProfile;