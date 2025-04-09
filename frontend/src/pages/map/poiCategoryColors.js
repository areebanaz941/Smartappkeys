// src/lib/poiCategoryColors.js
export const POI_CATEGORY_COLORS = {
    'cultural': '#8B4513',     // Brown for cultural sites
    'natural': '#228B22',      // Forest green for natural sites
    'religious': '#8A2BE2',    // Blue violet for religious sites
    'historical': '#CD853F',   // Peru (dark sandy brown) for historical sites
    'accommodation': '#1E90FF',// Dodger blue for accommodation
    'restaurant': '#FF4500',   // Orange red for restaurants
    'service': '#2E8B57',      // Sea green for services
    'shop': '#FF69B4',         // Hot pink for shops
    'entertainment': '#FF1493', // Deep pink for entertainment
    'default': '#6B4423'       // Dark brown as default
  };
  
  export const getPoiMarkerColor = (category) => {
    const normalizedCategory = category?.toLowerCase() || 'default';
    return POI_CATEGORY_COLORS[normalizedCategory] || POI_CATEGORY_COLORS.default;
  };
  
  export const colorizePointerImage = (imageUrl, color) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = 66;
      canvas.height = 66;
      const ctx = canvas.getContext('2d');
      
      const img = new Image();
      img.onload = () => {
        // Draw the original image
        ctx.drawImage(img, 0, 0, 66, 66);
        
        // Set the composite operation to color
        ctx.globalCompositeOperation = 'color';
        
        // Fill with the category color
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
        
        // Convert to data URL and resolve
        resolve(canvas.toDataURL());
      };
      
      img.onerror = reject;
      img.src = imageUrl;
    });
  };