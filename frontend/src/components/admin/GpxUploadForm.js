// src/components/admin/GpxUploadForm.js
import React, { useState, useRef } from 'react';
import { Upload, X, Check, Map, FileUp, FileX, Loader2 } from 'lucide-react';
import config from '../../config';

const GpxRouteUpload = ({ onUploadSuccess, onUploadFail, formData, setFormData }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewStats, setPreviewStats] = useState(null);
  const fileInputRef = useRef(null);

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  // Trigger file input click
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  // Validate the file is a GPX file
  const validateAndProcessFile = (file) => {
    setUploadError(null);
    setUploadSuccess(false);
    
    // Check file type
    if (!file.name.toLowerCase().endsWith('.gpx') && 
        file.type !== 'application/gpx+xml' && 
        file.type !== 'application/xml') {
      setUploadError('Only GPX files are allowed');
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit');
      return;
    }
    
    setFile(file);
    previewGpxFile(file);
  };

  // Extract info from GPX to display before upload
  const previewGpxFile = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        
        // Basic GPX validation
        if (!content.includes('<gpx') || !content.includes('</gpx>')) {
          setUploadError('Invalid GPX file format');
          return;
        }
        
        // Extract basic statistics - this is simplified, actual GPX parsing would be more robust
        const trackPoints = content.match(/<trkpt/g);
        const pointCount = trackPoints ? trackPoints.length : 0;
        
        // Extract name if available
        let routeName = file.name.replace('.gpx', '');
        const nameMatch = content.match(/<name>(.*?)<\/name>/);
        if (nameMatch && nameMatch[1]) {
          routeName = nameMatch[1].trim();
        }

        // Calculate estimated distance (this would normally be done properly on the server)
        // Just a rough estimate for preview purposes
        const estimatedDistance = Math.round((pointCount / 100) * 2.5 * 10) / 10; // Each 100 points ~= 2.5km (very rough estimate)
        
        // Set preview stats
        setPreviewStats({
          name: routeName,
          pointCount,
          estimatedDistance,
          fileSize: (file.size / (1024 * 1024)).toFixed(2), // In MB
        });
        
        // Update form data with route name - only if setFormData is provided
        if (setFormData && typeof setFormData === 'function') {
          setFormData({
            ...formData,
            name: routeName || formData.name,
            distance: estimatedDistance || formData.distance,
            estimatedTime: Math.round(estimatedDistance * 4) || formData.estimatedTime, // Rough estimate: 4 min per km
          });
        }
        
      } catch (error) {
        console.error('Error parsing GPX file:', error);
        setUploadError('Error parsing GPX file');
      }
    };
    
    reader.onerror = () => {
      setUploadError('Error reading file');
    };
    
    reader.readAsText(file);
  };

  // Upload the GPX file to the server
  const uploadGpxFile = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);
    
    // Create form data for upload
    const formData = new FormData();
    formData.append('gpxFile', file);
    
    // Add basic route info if available
    if (formData?.name) formData.append('name', formData.name);
    if (formData?.difficulty) formData.append('difficulty', formData.difficulty);
    if (formData?.description) formData.append('description', formData.description);
    
    try {
      // Simulated progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      // Make the upload request
      const response = await fetch(config.getApiUrl('bike-routes/upload'), {
        method: 'POST',
        body: formData
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      const data = await response.json();
      
      // Set progress to 100% and show success message
      setUploadProgress(100);
      setUploadSuccess(true);
      
      // If data has route stats, update the form
      if (data.data && setFormData && typeof setFormData === 'function') {
        setFormData(prevData => ({
          ...prevData,
          gpxFile: data.data.gpxFile,
          distance: data.data.distance || prevData.distance,
          elevationGain: data.data.elevationGain || prevData.elevationGain,
          estimatedTime: data.data.estimatedTime || prevData.estimatedTime,
          startPoint: data.data.startPoint || prevData.startPoint,
          endPoint: data.data.endPoint || prevData.endPoint,
        }));
      }
      
      // Call the success callback with the result
      if (onUploadSuccess && typeof onUploadSuccess === 'function') {
        onUploadSuccess(data);
      }
      
    } catch (error) {
      console.error('Error uploading GPX file:', error);
      setUploadError(error.message || 'Error uploading file');
      
      if (onUploadFail && typeof onUploadFail === 'function') {
        onUploadFail(error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Reset the uploader
  const resetUploader = () => {
    setFile(null);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    setPreviewStats(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Route GPX File</h3>
      
      {/* File upload area */}
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragging ? 'border-yellowgreen bg-yellowgreen bg-opacity-5' : 'border-gray-300 hover:border-yellowgreen'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".gpx,application/gpx+xml,application/xml"
            onChange={handleFileInputChange}
          />
          
          <Upload className="h-10 w-10 mx-auto text-gray-400" />
          
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop your GPX file here, or <span className="text-yellowgreen font-medium">browse</span>
          </p>
          
          <p className="text-xs text-gray-500 mt-1">
            Supports GPX files up to 10MB
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          {/* File info and preview */}
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="bg-yellowgreen bg-opacity-10 p-2 rounded-md">
                <Map className="h-6 w-6 text-yellowgreen" />
              </div>
              
              <div className="ml-3">
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {previewStats?.fileSize} MB • {previewStats?.pointCount || 0} points
                </p>
              </div>
            </div>
            
            {!isUploading && !uploadSuccess && (
              <button 
                onClick={resetUploader}
                className="text-gray-400 hover:text-gray-600"
                title="Remove file"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {/* Preview stats */}
          {previewStats && (
            <div className="mt-4 bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Route Preview</h4>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{previewStats.name}</p>
                </div>
                
                <div>
                  <p className="text-gray-500">Distance (est.)</p>
                  <p className="font-medium text-gray-900">{previewStats.estimatedDistance} km</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Upload progress */}
          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Uploading...</span>
                <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellowgreen h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Upload error */}
          {uploadError && (
            <div className="mt-4 bg-red-50 border border-red-100 text-red-700 p-3 rounded-md flex items-start">
              <FileX className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm">{uploadError}</p>
            </div>
          )}
          
          {/* Upload success */}
          {uploadSuccess && (
            <div className="mt-4 bg-green-50 border border-green-100 text-green-700 p-3 rounded-md flex items-start">
              <Check className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm">GPX file uploaded successfully! Route data has been extracted.</p>
            </div>
          )}
          
          {/* Action buttons */}
          {!uploadSuccess && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={uploadGpxFile}
                disabled={isUploading || !file}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellowgreen hover:bg-[#6aaf1a]'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FileUp className="h-4 w-4 mr-2" />
                    Upload GPX
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Help text */}
      <p className="text-xs text-gray-500 mt-3">
        GPX files contain route information including coordinates, elevation, and other track data.
        You can export GPX files from most popular cycling and fitness apps.
      </p>
    </div>
  );
};

export default GpxRouteUpload;
