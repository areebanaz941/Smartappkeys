// src/utils/GpxProcessor.js
import * as turf from '@turf/turf';

/**
 * Process a GPX file to extract route information
 * @param {File} file - The GPX file to parse
 * @returns {Promise} - A promise that resolves with the processed GPX data
 */
export const processGpxFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const gpxContent = e.target.result;
        const parser = new DOMParser();
        const gpxDoc = parser.parseFromString(gpxContent, "text/xml");
        
        // Check if the document is a valid GPX file
        const gpxElement = gpxDoc.querySelector("gpx");
        if (!gpxElement) {
          return reject(new Error("Invalid GPX file"));
        }
        
        // Extract basic metadata
        const metadata = {
          name: getElementText(gpxDoc, "name") || file.name.replace(".gpx", ""),
          description: getElementText(gpxDoc, "desc"),
          time: getElementText(gpxDoc, "time"),
          author: getElementText(gpxDoc, "author"),
          keywords: getElementText(gpxDoc, "keywords"),
        };
        
        // Process track points
        const trackSegments = gpxDoc.querySelectorAll("trkseg");
        const points = [];
        let minLat = Infinity;
        let maxLat = -Infinity;
        let minLng = Infinity;
        let maxLng = -Infinity;
        let totalDistance = 0;
        let minElevation = Infinity;
        let maxElevation = -Infinity;
        let elevationGain = 0;
        let previousElevation = null;
        let previousPoint = null;
        
        // Process all track segments
        trackSegments.forEach(segment => {
          const trackpoints = segment.querySelectorAll("trkpt");
          
          trackpoints.forEach(point => {
            const lat = parseFloat(point.getAttribute("lat"));
            const lng = parseFloat(point.getAttribute("lon"));
            const ele = parseFloat(getElementText(point, "ele")) || 0;
            const time = getElementText(point, "time");
            
            // Keep track of bounds
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
            
            // Keep track of elevation data
            minElevation = Math.min(minElevation, ele);
            maxElevation = Math.max(maxElevation, ele);
            
            // Calculate elevation gain
            if (previousElevation !== null) {
              const elevationDifference = ele - previousElevation;
              if (elevationDifference > 0) {
                elevationGain += elevationDifference;
              }
            }
            previousElevation = ele;
            
            // Calculate distance
            if (previousPoint) {
              const from = turf.point([previousPoint.lng, previousPoint.lat]);
              const to = turf.point([lng, lat]);
              const distance = turf.distance(from, to, { units: 'kilometers' });
              totalDistance += distance;
            }
            
            // Store point data
            const pointData = { lat, lng, ele, time };
            points.push(pointData);
            previousPoint = pointData;
          });
        });
        
        // Calculate center point
        const center = {
          lat: (minLat + maxLat) / 2,
          lng: (minLng + maxLng) / 2
        };
        
        // Create a GeoJSON object for the route
        const coordinates = points.map(p => [p.lng, p.lat]);
        const geojson = {
          type: "Feature",
          properties: {
            name: metadata.name,
            description: metadata.description,
            totalDistance: totalDistance,
            elevationGain: elevationGain
          },
          geometry: {
            type: "LineString",
            coordinates: coordinates
          }
        };
        
        // Process waypoints
        const waypoints = [];
        const waypointElements = gpxDoc.querySelectorAll("wpt");
        waypointElements.forEach(wpt => {
          const lat = parseFloat(wpt.getAttribute("lat"));
          const lng = parseFloat(wpt.getAttribute("lon"));
          const ele = parseFloat(getElementText(wpt, "ele")) || 0;
          const name = getElementText(wpt, "name");
          const desc = getElementText(wpt, "desc");
          const sym = getElementText(wpt, "sym");
          
          waypoints.push({
            lat,
            lng,
            ele,
            name,
            description: desc,
            symbol: sym
          });
        });
        
        // Create result object
        const result = {
          metadata,
          points,
          bounds: {
            minLat,
            maxLat,
            minLng,
            maxLng
          },
          center,
          statistics: {
            totalPoints: points.length,
            totalDistance: totalDistance.toFixed(2),
            elevationGain: Math.round(elevationGain),
            minElevation: Math.round(minElevation),
            maxElevation: Math.round(maxElevation),
            elevationDifference: Math.round(maxElevation - minElevation)
          },
          waypoints,
          geojson
        };
        
        resolve(result);
      } catch (error) {
        reject(new Error(`Error parsing GPX file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read GPX file"));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Helper function to extract text content from an XML element
 */
const getElementText = (parent, tagName) => {
  const element = parent.querySelector(tagName);
  return element ? element.textContent : "";
};

/**
 * Create a time estimate based on the distance and activity type
 * @param {number} distanceKm - Distance in kilometers
 * @param {string} activityType - Type of activity (walking, cycling)
 * @returns {string} - Formatted time estimate
 */
export const calculateTimeEstimate = (distanceKm, activityType = 'cycling') => {
  // Average speeds in km/h
  const speeds = {
    walking: 5,      // 5 km/h walking speed
    hiking: 4,       // 4 km/h hiking speed
    cycling: 15,     // 15 km/h casual cycling
    mountain_biking: 10, // 10 km/h mountain biking
    running: 9       // 9 km/h running
  };
  
  const speed = speeds[activityType] || speeds.cycling;
  const timeHours = distanceKm / speed;
  
  const hours = Math.floor(timeHours);
  const minutes = Math.round((timeHours - hours) * 60);
  
  if (hours === 0) {
    return `${minutes} min`;
  } else if (minutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} min`;
  }
};

/**
 * Converts a GPX route to a GeoJSON format that Mapbox can use
 */
export const gpxToGeoJson = (gpxData) => {
  if (!gpxData || !gpxData.geojson) {
    return null;
  }
  
  return {
    type: "FeatureCollection",
    features: [
      gpxData.geojson,
      ...gpxData.waypoints.map(waypoint => ({
        type: "Feature",
        properties: {
          name: waypoint.name,
          description: waypoint.description,
          symbol: waypoint.symbol
        },
        geometry: {
          type: "Point",
          coordinates: [waypoint.lng, waypoint.lat]
        }
      }))
    ]
  };
};

/**
 * Format distance in a human-readable way
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  } else {
    return `${distanceKm} km`;
  }
};

/**
 * Calculate difficulty level based on distance and elevation gain
 */
export const calculateDifficulty = (distanceKm, elevationGain) => {
  // Simple algorithm to determine difficulty
  let score = 0;
  
  // Distance factor
  if (distanceKm < 5) score += 1;
  else if (distanceKm < 15) score += 2;
  else if (distanceKm < 30) score += 3;
  else score += 4;
  
  // Elevation factor
  if (elevationGain < 100) score += 1;
  else if (elevationGain < 300) score += 2;
  else if (elevationGain < 700) score += 3;
  else score += 4;
  
  // Determine difficulty level
  const averageScore = score / 2;
  if (averageScore < 1.5) return "easy";
  else if (averageScore < 2.5) return "medium";
  else if (averageScore < 3.5) return "hard";
  else return "expert";
};

export default {
  processGpxFile,
  calculateTimeEstimate,
  gpxToGeoJson,
  formatDistance,
  calculateDifficulty
};