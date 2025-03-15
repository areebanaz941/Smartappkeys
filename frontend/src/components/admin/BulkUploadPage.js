// src/pages/admin/BulkUploadPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';

const BulkUploadPage = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [uploadStats, setUploadStats] = useState({
    total: 0,
    successful: 0,
    failed: 0
  });

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
    setSuccess('');

    if (selectedFile) {
      // Parse CSV file for preview
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError(`Error parsing CSV: ${results.errors[0].message}`);
            return;
          }

          const data = results.data;
          setParsedData(data);
          setPreviewData(data.slice(0, 5)); // Show first 5 rows for preview
        },
        error: (err) => {
          setError(`Error parsing CSV: ${err.message}`);
        }
      });
    }
  };

  // Validate that all required fields are present in each row
  const validateData = (data) => {
    const requiredFields = ['type_it', 'type_en', 'coordinates', 'name_en', 'name_it'];
    const errors = [];

    data.forEach((row, index) => {
      requiredFields.forEach(field => {
        if (!row[field] || row[field].trim() === '') {
          errors.push(`Row ${index + 1}: Missing required field "${field}"`);
        }
      });

      // Validate coordinates format
      if (row.coordinates) {
        const coords = row.coordinates.split(',').map(c => c.trim());
        if (coords.length !== 2 || isNaN(parseFloat(coords[0])) || isNaN(parseFloat(coords[1]))) {
          errors.push(`Row ${index + 1}: Invalid coordinates format. Should be "latitude, longitude"`);
        }
      }
    });

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);
    setSuccess('');

    if (!file) {
      setError('Please select a CSV file');
      setIsUploading(false);
      return;
    }

    // Validate data first
    const validationErrors = validateData(parsedData);
    if (validationErrors.length > 0) {
      setError(`Validation failed:\n${validationErrors.join('\n')}`);
      setIsUploading(false);
      return;
    }

    try {
      // Process each row
      const stats = {
        total: parsedData.length,
        successful: 0,
        failed: 0
      };

      // This would typically be a batch insert on the server side
      // For now, we'll simulate uploading each record individually
      for (const row of parsedData) {
        try {
          const response = await fetch('/api/pois', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(row)
          });

          if (!response.ok) {
            stats.failed++;
          } else {
            stats.successful++;
          }
        } catch (err) {
          stats.failed++;
        }
      }

      setUploadStats(stats);
      setSuccess(`Upload complete: ${stats.successful} of ${stats.total} POIs added successfully.`);
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // For demonstration/testing, we provide a sample CSV download
  const getSampleCSV = () => {
    const csvData = `type_it,type_en,coordinates,photo,name_en,description_en,name_it,description_it
Culturale,Cultural,42.6851326966809, 11.907076835632326,https://example.com/image.jpg,San Lorenzo Museum,Example description in English,Museo di San Lorenzo,Esempio di descrizione in italiano
Paesaggistico,Landscape,42.6851326966809, 11.908076835632326,https://example.com/image2.jpg,San Lorenzo Park,Beautiful park in the town center,Parco di San Lorenzo,Bellissimo parco nel centro del paese`;

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_pois.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-[#032c60] text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Bulk Upload POIs</h1>
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
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <p className="mb-4">
            Upload a CSV file containing multiple POIs to add them all at once. The CSV should include the following columns:
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li><strong>type_it</strong>: POI type in Italian (e.g., Culturale, Azienda)</li>
            <li><strong>type_en</strong>: POI type in English (e.g., Cultural, Business)</li>
            <li><strong>coordinates</strong>: Latitude and longitude separated by a comma (e.g., 42.6851, 11.9070)</li>
            <li><strong>photo</strong>: URL to the POI image (optional)</li>
            <li><strong>name_en</strong>: POI name in English</li>
            <li><strong>description_en</strong>: POI description in English</li>
            <li><strong>name_it</strong>: POI name in Italian</li>
            <li><strong>description_it</strong>: POI description in Italian</li>
          </ul>
          <button
            onClick={getSampleCSV}
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Download Sample CSV
          </button>
        </div>

        {/* Upload Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Upload POIs</h2>
          
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 whitespace-pre-line">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
              {uploadStats.failed > 0 && (
                <p className="mt-2">Warning: {uploadStats.failed} POIs failed to upload.</p>
              )}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellowgreen focus:border-yellowgreen"
              />
            </div>
            
            {/* Preview Data */}
            {previewData.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Preview (First 5 rows)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(previewData[0]).map((header, index) => (
                          <th 
                            key={index}
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.values(row).map((value, cellIndex) => (
                            <td 
                              key={cellIndex}
                              className="px-3 py-2 whitespace-nowrap text-xs text-gray-500"
                            >
                              {value.length > 40 ? value.substring(0, 40) + '...' : value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {parsedData.length} total rows found in CSV.
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-4">
              <Link
                to="/admin"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isUploading || !file}
                className={`px-4 py-2 ${
                  isUploading || !file
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-yellowgreen hover:bg-[#6aaf1a]'
                } text-white rounded-md transition-colors`}
              >
                {isUploading ? 'Uploading...' : 'Upload POIs'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadPage;