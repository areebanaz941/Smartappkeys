// src/pages/admin/POIManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AddPOIForm from '../../components/admin/AddPOIForm';

const POIManagementPage = ({ initialView = 'list' }) => {// 'list', 'add', 'edit', 'bulk'
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState(initialView);
    const [pois, setPois] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPoi, setSelectedPoi] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [uploadSuccess, setUploadSuccess] = useState('');
    const [isUploading, setIsUploading] = useState(false);
  
    // Fetch POIs from API
    const fetchPois = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const apiUrl = 'http://localhost:5000/api/pois';
            console.log('Fetching POIs from:', apiUrl);
            
            const response = await fetch(apiUrl);
            
            // Log the response status and headers for debugging
            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
            
            // Get the raw response text first
            const responseText = await response.text();
            console.log('Raw response preview:', responseText.substring(0, 200) + '...');
            
            // Try to parse as JSON (will fail if it's HTML)
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('Parsed data:', data);
                
                if (!data.success) {
                    throw new Error(data.message || 'Failed to fetch POIs');
                }
                
                setPois(data.data || []);
            } catch (parseError) {
                console.error('JSON parsing error:', parseError);
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            setError(`Error fetching POIs: ${error.message}`);
            console.error('Error fetching POIs:', error);
            setPois([]);
        } finally {
            setIsLoading(false);
        }
    };
  
    // Load POIs on initial render
    useEffect(() => {
        fetchPois();
    }, []);
    
    // Handle POI deletion
    const handleDeletePoi = async (id) => {
        if (!window.confirm('Are you sure you want to delete this POI?')) {
            return;
        }
        
        try {
            const apiUrl = `http://localhost:5000/api/pois/${id}`;
            console.log('Deleting POI at:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                const responseData = await response.json();
                throw new Error(responseData.message || 'Failed to delete POI');
            }
            
            // Refresh the list
            fetchPois();
        } catch (error) {
            setError(`Failed to delete POI: ${error.message}`);
        }
    };
  
    // Handle file selection for bulk upload
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setError(null);
        setUploadSuccess('');

        if (selectedFile) {
            // Determine file type
            if (selectedFile.name.endsWith('.csv')) {
                handleCsvFile(selectedFile);
            } else if (selectedFile.name.endsWith('.json')) {
                handleJsonFile(selectedFile);
            } else {
                setError('Unsupported file format. Please upload a CSV or JSON file.');
            }
        }
    };

    // Handle CSV file parsing
    const handleCsvFile = (csvFile) => {
        // You would need to install PapaParse: npm install papaparse
        import('papaparse').then(Papa => {
            Papa.parse(csvFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        setError(`Error parsing CSV: ${results.errors[0].message}`);
                        return;
                    }
                    setParsedData(results.data);
                },
                error: (err) => {
                    setError(`Error parsing CSV: ${err.message}`);
                }
            });
        }).catch(err => {
            setError('Failed to load CSV parser. Please make sure PapaParse is installed.');
            console.error('Failed to load PapaParse:', err);
        });
    };

    // Handle JSON file parsing
    const handleJsonFile = (jsonFile) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                setParsedData(Array.isArray(jsonData) ? jsonData : [jsonData]);
            } catch (error) {
                setError(`Error parsing JSON: ${error.message}`);
            }
        };
        reader.onerror = () => {
            setError('Error reading file');
        };
        reader.readAsText(jsonFile);
    };

    // Handle bulk upload submission
    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (parsedData.length === 0) {
            setError('No data to upload');
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadSuccess('');

        try {
            // Validate required fields
            const requiredFields = ['category', 'type_it', 'type_en', 'coordinates', 'name_en', 'name_it'];
            const invalidRows = [];
            
            parsedData.forEach((row, index) => {
                const missingFields = requiredFields.filter(field => !row[field] || row[field].trim() === '');
                if (missingFields.length > 0) {
                    invalidRows.push(`Row ${index + 1}: Missing ${missingFields.join(', ')}`);
                }
            });

            if (invalidRows.length > 0) {
                setError(`Validation errors:\n${invalidRows.join('\n')}`);
                setIsUploading(false);
                return;
            }

            // Process data
            let successCount = 0;
            let errorCount = 0;

            for (const poi of parsedData) {
                try {
                    // Check if POI has an ID - if yes, update existing POI
                    if (poi._id) {
                        const updateResponse = await fetch(`http://localhost:5000/api/pois/${poi._id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(poi)
                        });
                        
                        if (updateResponse.ok) {
                            successCount++;
                        } else {
                            errorCount++;
                            console.error('Failed to update POI:', poi._id);
                        }
                    } else {
                        // Create new POI
                        const createResponse = await fetch('http://localhost:5000/api/pois', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(poi)
                        });
                        
                        if (createResponse.ok) {
                            successCount++;
                        } else {
                            errorCount++;
                            console.error('Failed to create POI');
                        }
                    }
                } catch (error) {
                    errorCount++;
                    console.error('Error processing POI:', error);
                }
            }

            setUploadSuccess(`Upload complete: ${successCount} POIs processed successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}.`);
            // Refresh POI list after successful upload
            fetchPois();
        } catch (error) {
            setError(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };
  
    // Filter POIs based on search term
    const filteredPois = pois.filter(poi => 
        poi.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        poi.name_it?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poi.type_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poi.type_it?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poi.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    // Pagination logic
    const indexOfLastPoi = currentPage * itemsPerPage;
    const indexOfFirstPoi = indexOfLastPoi - itemsPerPage;
    const currentPois = filteredPois.slice(indexOfFirstPoi, indexOfLastPoi);
    const totalPages = Math.ceil(filteredPois.length / itemsPerPage);
  
    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Function to get sample data (for download template)
    const getSampleData = (format) => {
        const sampleData = [
            {
                _id: "",
                category: "cultural",
                type_it: "Culturale",
                type_en: "Cultural",
                coordinates: "42.6851326966809, 11.907076835632326",
                photo: "https://example.com/image.jpg",
                name_en: "Example POI",
                description_en: "This is an example POI",
                name_it: "Esempio POI",
                description_it: "Questo è un esempio di POI"
            }
        ];

        if (format === 'csv') {
            import('papaparse').then(Papa => {
                const csv = Papa.unparse(sampleData);
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'sample_pois.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }).catch(err => {
                setError('Failed to generate sample CSV. Please make sure PapaParse is installed.');
            });
        } else {
            const json = JSON.stringify(sampleData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'sample_pois.json');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
  
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Admin Header */}
            <header className="bg-[#032c60] text-white p-4 shadow-md">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">POI Management</h1>
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
                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
                        <button
                            onClick={() => setActiveView('list')}
                            className={`px-4 py-2 rounded-md ${
                                activeView === 'list' 
                                    ? 'bg-[#032c60] text-white' 
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            }`}
                        >
                            View POIs
                        </button>
                        <button
                            onClick={() => {
                                setSelectedPoi(null);
                                setActiveView('add');
                            }}
                            className={`px-4 py-2 rounded-md ${
                                activeView === 'add' 
                                    ? 'bg-[#032c60] text-white' 
                                    : 'bg-yellowgreen text-white hover:bg-[#6aaf1a]'
                            }`}
                        >
                            Add POI Manually
                        </button>
                        <button
                            onClick={() => {
                                setActiveView('bulk');
                                setFile(null);
                                setParsedData([]);
                                setError(null);
                                setUploadSuccess('');
                            }}
                            className={`px-4 py-2 rounded-md ${
                                activeView === 'bulk' 
                                    ? 'bg-[#032c60] text-white' 
                                    : 'bg-yellowgreen text-white hover:bg-[#6aaf1a]'
                            }`}
                        >
                            Bulk Upload
                        </button>
                    </div>
                    
                    {activeView === 'list' && (
                        <div className="w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Search POIs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellowgreen"
                            />
                        </div>
                    )}
                </div>
                
                {/* Error Alert */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 whitespace-pre-line">
                        {error}
                        <button 
                            className="float-right"
                            onClick={() => setError(null)}
                        >
                            ✕
                        </button>
                    </div>
                )}
                
                {/* Success Alert */}
                {uploadSuccess && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                        {uploadSuccess}
                        <button 
                            className="float-right"
                            onClick={() => setUploadSuccess('')}
                        >
                            ✕
                        </button>
                    </div>
                )}
                
                {/* POI List View */}
                {activeView === 'list' && (
                    <>
                        {isLoading ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Loading POIs...</p>
                            </div>
                        ) : filteredPois.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No POIs found. Add your first POI!</p>
                                <div className="mt-4 flex justify-center gap-4">
                                    <button
                                        onClick={() => setActiveView('add')}
                                        className="bg-yellowgreen text-white px-4 py-2 rounded-md hover:bg-[#6aaf1a]"
                                    >
                                        Add POI Manually
                                    </button>
                                    <button
                                        onClick={() => setActiveView('bulk')}
                                        className="bg-yellowgreen text-white px-4 py-2 rounded-md hover:bg-[#6aaf1a]"
                                    >
                                        Bulk Upload
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* POI Table */}
                                <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Category
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Coordinates
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {currentPois.map((poi) => (
                                                <tr key={poi._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {poi.photo ? (
                                                                <img 
                                                                    src={poi.photo} 
                                                                    alt={poi.name_en}
                                                                    className="h-10 w-10 rounded-full object-cover mr-3"
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Ccircle cx="20" cy="20" r="20" fill="%23e2e8f0"/%3E%3C/svg%3E';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                                                    <span className="text-gray-500 text-xs">No img</span>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {poi.name_en}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {poi.name_it}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 capitalize">{poi.category?.replace('_', ' ') || 'N/A'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{poi.type_en}</div>
                                                        <div className="text-sm text-gray-500">{poi.type_it}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {typeof poi.coordinates === 'object' && poi.coordinates.lat ? 
                                                            `${poi.coordinates.lat}, ${poi.coordinates.lng}` : 
                                                            poi.coordinates}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPoi(poi);
                                                                setActiveView('edit');
                                                            }}
                                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePoi(poi._id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Pagination */}
                                {filteredPois.length > itemsPerPage && (
                                    <div className="flex justify-center mt-6">
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            <button
                                                onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                                                disabled={currentPage === 1}
                                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                                    currentPage === 1
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-gray-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                Previous
                                            </button>
                                            
                                            {Array.from({ length: totalPages }, (_, i) => (
                                                <button
                                                    key={i + 1}
                                                    onClick={() => paginate(i + 1)}
                                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                                                        currentPage === i + 1
                                                            ? 'z-10 bg-[#032c60] text-white border-[#032c60]'
                                                            : 'bg-white text-gray-500 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                            
                                            <button
                                                onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                                                disabled={currentPage === totalPages}
                                                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                                    currentPage === totalPages
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-gray-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                Next
                                            </button>
                                        </nav>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
                
                {/* Add POI Form */}
                {activeView === 'add' && (
                    <AddPOIForm 
                        onSuccess={() => {
                            fetchPois();
                            setActiveView('list');
                        }}
                        onCancel={() => setActiveView('list')}
                    />
                )}
                
                {/* Edit POI Form */}
                {activeView === 'edit' && selectedPoi && (
                    <AddPOIForm 
                        poiData={selectedPoi}
                        isEditing={true}
                        onSuccess={() => {
                            fetchPois();
                            setActiveView('list');
                            setSelectedPoi(null);
                        }}
                        onCancel={() => {
                            setActiveView('list');
                            setSelectedPoi(null);
                        }}
                    />
                )}
                
                {/* Bulk Upload Form */}
                {activeView === 'bulk' && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-6">Bulk Upload POIs</h2>
                        
                        <div className="mb-6">
                            <p className="mb-4">
                                Upload a CSV or JSON file containing multiple POIs to add or update them all at once. 
                                Each POI should include these fields:
                            </p>
                            <ul className="list-disc pl-5 mb-4">
                                <li><strong>_id</strong>: (Optional) If provided and POI exists, it will be updated.</li>
                                <li><strong>category</strong>: Internal category (e.g., cultural, business, landscape)</li>
                                <li><strong>type_it</strong>: POI type in Italian (e.g., Culturale, Azienda)</li>
                                <li><strong>type_en</strong>: POI type in English (e.g., Cultural, Business)</li>
                                <li><strong>coordinates</strong>: Latitude and longitude separated by a comma</li>
                                <li><strong>photo</strong>: URL to the POI image (optional)</li>
                                <li><strong>name_en</strong>: POI name in English</li>
                                <li><strong>description_en</strong>: POI description in English</li>
                                <li><strong>name_it</strong>: POI name in Italian</li>
                                <li><strong>description_it</strong>: POI description in Italian</li>
                            </ul>
                            
                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => getSampleData('csv')}
                                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Download CSV Template
                                </button>
                                <button
                                    onClick={() => getSampleData('json')}
                                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Download JSON Template
                                </button>
                            </div>
                        </div>
                        
                        <form onSubmit={handleBulkUpload}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select CSV or JSON File
                                </label>
                                <input
                                    type="file"
                                    accept=".csv,.json"
                                    onChange={handleFileChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellowgreen focus:border-yellowgreen"
                                />
                            </div>
                            
                            {/* Preview Data */}
                            {parsedData.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium mb-2">Preview ({Math.min(5, parsedData.length)} of {parsedData.length} rows)</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    {Object.keys(parsedData[0]).map((header, index) => (
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
                                                {parsedData.slice(0, 5).map((row, rowIndex) => (
                                                    <tr key={rowIndex}>
                                                        {Object.values(row).map((value, cellIndex) => (
                                                            <td 
                                                                key={cellIndex}
                                                                className="px-3 py-2 whitespace-nowrap text-xs text-gray-500"
                                                            >
                                                                {value && typeof value === 'string' && value.length > 40 
                                                                    ? value.substring(0, 40) + '...' 
                                                                    : value !== null && value !== undefined 
                                                                        ? value.toString() 
                                                                        : ''}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">
                                        {parsedData.length} total rows found in file.
                                    </p>
                                </div>
                            )}
                            
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setActiveView('list')}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading || parsedData.length === 0}
                                    className={`px-4 py-2 ${
                                        isUploading || parsedData.length === 0
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-yellowgreen hover:bg-[#6aaf1a]'
                                    } text-white rounded-md transition-colors`}
                                >
                                    {isUploading ? 'Uploading...' : 'Upload POIs'}
                                </button>
                            </div>
                        </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default POIManagementPage;