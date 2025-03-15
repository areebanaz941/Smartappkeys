// src/pages/admin/POIAnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const POIAnalyticsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalPOIs: 0,
    poiByType: {},
    poiViews: [],
    topPOIs: [],
    recentPOIs: []
  });
  const [timeframe, setTimeframe] = useState('month'); // 'week', 'month', 'year', 'all'
  const [pois, setPois] = useState([]);

  // Fetch all POIs data
  useEffect(() => {
    const fetchPois = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const apiUrl = 'http://localhost:5000/api/pois';
        console.log('Fetching POIs from:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('POIs data received:', data);
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch POIs');
        }
        
        setPois(data.data || []);
        processAnalytics(data.data || [], timeframe);
      } catch (err) {
        console.error('Error fetching POIs:', err);
        setError(`Failed to load POI data: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPois();
  }, [timeframe]);

  // Process the POI data to generate analytics
  const processAnalytics = (poisData, currentTimeframe) => {
    if (!poisData || poisData.length === 0) {
      setAnalytics({
        totalPOIs: 0,
        poiByType: {},
        poiViews: generateTimeframeLabels(currentTimeframe).map(label => ({ date: label, views: 0 })),
        topPOIs: [],
        recentPOIs: []
      });
      return;
    }

    // Calculate POIs by type/category
    const typeCounter = {};
    const typeColors = {
      'business': '#10B981',
      'cultural': '#3B82F6',
      'landscape': '#F59E0B',
      'religious': '#8B5CF6',
      'landscape_religious': '#EC4899'
    };

    poisData.forEach(poi => {
      const category = poi.category || 'unknown';
      if (!typeCounter[category]) {
        typeCounter[category] = { 
          count: 0, 
          color: typeColors[category] || '#6B7280' 
        };
      }
      typeCounter[category].count++;
    });

    // For the POI views data, we'll generate random data based on the timeframe
    // In a real implementation, this would come from actual view tracking
    const viewsData = generateMockViewsData(currentTimeframe, poisData.length);

    // Sort POIs by most recently added
    const sortedByDate = [...poisData].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Get the 5 most recently added POIs
    const recentPOIs = sortedByDate.slice(0, 5).map(poi => ({
      id: poi._id,
      name: poi.name_en,
      type: poi.type_en,
      // Convert MongoDB date to YYYY-MM-DD format
      created: new Date(poi.createdAt).toISOString().split('T')[0],
      // In a real app, you would have creator info
      creator: 'admin'
    }));

    // For top POIs, we'll create simulated view data
    // In a real implementation, this would come from actual tracking
    const topPOIs = [...poisData]
      .slice(0, 5)
      .map((poi, index) => ({
        id: poi._id,
        name: poi.name_en,
        type: poi.type_en,
        views: Math.floor(Math.random() * 200) + 100 - (index * 20),
        avgTimeSpent: `${Math.floor(Math.random() * 5) + 1}m ${Math.floor(Math.random() * 50) + 10}s`
      }))
      .sort((a, b) => b.views - a.views);

    setAnalytics({
      totalPOIs: poisData.length,
      poiByType: typeCounter,
      poiViews: viewsData,
      topPOIs,
      recentPOIs
    });
  };

  // Generate labels based on timeframe
  const generateTimeframeLabels = (currentTimeframe) => {
    const labels = [];
    const pointCount = 12;
    
    if (currentTimeframe === 'week') {
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      }
    } else if (currentTimeframe === 'month') {
      for (let i = 0; i < pointCount; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (pointCount - 1 - i));
        labels.push(date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
      }
    } else if (currentTimeframe === 'year') {
      for (let i = 0; i < pointCount; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - (pointCount - 1 - i));
        labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
      }
    } else { // 'all'
      for (let i = 0; i < pointCount; i++) {
        labels.push(`Q${(i % 4) + 1} ${2022 + Math.floor(i / 4)}`);
      }
    }
    
    return labels;
  };
  
  // Generate simulated view data based on timeframe
  // In a real implementation, this would be actual view tracking data
  const generateMockViewsData = (currentTimeframe, poiCount) => {
    const labels = generateTimeframeLabels(currentTimeframe);
    const viewsData = [];
    
    // Base the view numbers on the actual number of POIs to make it realistic
    const multiplier = Math.max(1, Math.ceil(poiCount / 10));
    const baseViews = poiCount * 2;
    
    for (let i = 0; i < labels.length; i++) {
      // Create an upward trend in the data (more recent = more views)
      const trendFactor = 0.8 + (i / labels.length) * 0.5;
      viewsData.push({
        date: labels[i],
        views: Math.floor((Math.random() * multiplier * trendFactor + baseViews) * trendFactor)
      });
    }
    
    return viewsData;
  };

  // Calculate total POIs
  const totalPOICount = Object.values(analytics.poiByType).reduce(
    (total, type) => total + type.count, 
    0
  );

  // Generate and download analytics report as CSV
  const exportAnalyticsReport = () => {
    // Format the data for CSV
    const reportRows = [
      ['POI Analytics Report', `Generated on ${new Date().toLocaleDateString()}`],
      ['Timeframe', timeframe],
      [''],
      ['Total POIs', analytics.totalPOIs],
      ['Total Views', analytics.poiViews.reduce((total, item) => total + item.views, 0)],
      ['Avg. Views Per POI', analytics.totalPOIs ? Math.round(analytics.poiViews.reduce((total, item) => total + item.views, 0) / analytics.totalPOIs) : 0],
      [''],
      ['POI Types Distribution'],
      ['Type', 'Count', 'Percentage']
    ];

    // Add POI type distribution data
    Object.entries(analytics.poiByType).forEach(([type, data]) => {
      const percentage = (data.count / totalPOICount) * 100;
      reportRows.push([type, data.count, `${percentage.toFixed(1)}%`]);
    });

    // Add top POIs data
    reportRows.push([''], ['Top POIs by Views'], ['Name', 'Type', 'Views', 'Avg Time']);
    analytics.topPOIs.forEach(poi => {
      reportRows.push([poi.name, poi.type, poi.views, poi.avgTimeSpent]);
    });

    // Add recent POIs data
    reportRows.push([''], ['Recently Added POIs'], ['Name', 'Type', 'Created', 'By']);
    analytics.recentPOIs.forEach(poi => {
      reportRows.push([poi.name, poi.type, poi.created, poi.creator]);
    });

    // Convert to CSV format
    const csvContent = reportRows.map(row => row.join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `poi-analytics-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-[#032c60] text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">POI Analytics</h1>
          <Link 
            to="/admin"
            className="bg-white text-[#032c60] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {/* Timeframe Selector */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap items-center justify-between">
            <h2 className="text-lg font-semibold mb-2 md:mb-0">POI Performance Dashboard</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setTimeframe('week')}
                className={`px-3 py-1 rounded-md text-sm ${
                  timeframe === 'week'
                    ? 'bg-[#032c60] text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeframe('month')}
                className={`px-3 py-1 rounded-md text-sm ${
                  timeframe === 'month'
                    ? 'bg-[#032c60] text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setTimeframe('year')}
                className={`px-3 py-1 rounded-md text-sm ${
                  timeframe === 'year'
                    ? 'bg-[#032c60] text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Year
              </button>
              <button
                onClick={() => setTimeframe('all')}
                className={`px-3 py-1 rounded-md text-sm ${
                  timeframe === 'all'
                    ? 'bg-[#032c60] text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                All Time
              </button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading analytics data...</div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total POIs</h3>
                <p className="text-3xl font-bold">{analytics.totalPOIs}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Views This {timeframe === 'week' ? 'Week' : timeframe === 'month' ? 'Month' : timeframe === 'year' ? 'Year' : 'Period'}</h3>
                <p className="text-3xl font-bold">
                  {analytics.poiViews.reduce((total, item) => total + item.views, 0)}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Avg. Views Per POI</h3>
                <p className="text-3xl font-bold">
                  {analytics.totalPOIs ? Math.round(analytics.poiViews.reduce((total, item) => total + item.views, 0) / analytics.totalPOIs) : 0}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Most Popular Category</h3>
                <p className="text-3xl font-bold">
                  {Object.entries(analytics.poiByType).sort((a, b) => b[1].count - a[1].count)[0]?.[0] || 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Views Over Time Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-medium mb-4">Views Over Time</h3>
                <div className="h-64 flex items-end space-x-2">
                  {analytics.poiViews.map((item, index) => {
                    const maxViews = Math.max(...analytics.poiViews.map(i => i.views));
                    const height = maxViews > 0 ? (item.views / maxViews) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full bg-[#032c60] rounded-t"
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">
                          {item.date}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* POI Types Distribution Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-medium mb-4">POI Types Distribution</h3>
                <div className="h-64 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-40 w-40 rounded-full border-8 border-gray-100"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                      <div className="text-3xl font-bold">{totalPOICount}</div>
                      <div className="text-sm text-gray-500">Total POIs</div>
                    </div>
                  </div>
                  
                  {/* Type Legend */}
                  <div className="mt-4">
                    {Object.entries(analytics.poiByType).map(([type, data], index) => {
                      const percentage = (data.count / totalPOICount) * 100;
                      
                      return (
                        <div key={type} className="flex items-center mt-2">
                          <div 
                            className="w-4 h-4 rounded-sm mr-2" 
                            style={{ backgroundColor: data.color }}
                          ></div>
                          <span className="text-sm capitalize">{type.replace('_', '/')}: </span>
                          <span className="text-sm font-medium ml-1">{data.count} ({percentage.toFixed(1)}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Data Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top POIs Table */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-medium mb-4">Top POIs by Views</h3>
                {analytics.topPOIs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Views
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analytics.topPOIs.map((poi) => (
                          <tr key={poi.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {poi.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {poi.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {poi.views.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {poi.avgTimeSpent}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No data available</div>
                )}
              </div>
              
              {/* Recently Added POIs */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-medium mb-4">Recently Added POIs</h3>
                {analytics.recentPOIs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            By
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analytics.recentPOIs.map((poi) => (
                          <tr key={poi.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {poi.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {poi.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {poi.created}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {poi.creator}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No data available</div>
                )}
              </div>
            </div>
            
            {/* Export Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={exportAnalyticsReport}
                className="bg-yellowgreen text-white py-2 px-4 rounded-md hover:bg-[#6aaf1a] transition-colors"
              >
                Export Analytics Report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default POIAnalyticsPage;