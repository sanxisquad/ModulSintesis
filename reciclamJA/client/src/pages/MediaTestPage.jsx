import React, { useState, useEffect } from 'react';
import { getAllPrizes } from '../api/premio.api';
import apiConfig from '../api/apiClient';

export const MediaTestPage = () => {
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState({});
  const [mediaRoot, setMediaRoot] = useState('');
  
  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        setLoading(true);
        const response = await getAllPrizes();
        setPrizes(response.data);
      } catch (error) {
        console.error("Error loading prizes:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrizes();
    setMediaRoot(`${apiConfig.getBaseUrl()}/media`);
  }, []);
  
  const testImageUrl = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error(`Error testing URL: ${url}`, error);
      return false;
    }
  };
  
  const testAllImageVariants = async (prize) => {
    if (!prize.imagen) return;
    
    const baseUrl = apiConfig.getBaseUrl();
    const variants = [
      { name: 'Standard media path', url: `${baseUrl}/media/${prize.imagen}` },
      { name: 'Direct path', url: `${baseUrl}/${prize.imagen}` },
      { name: 'Relative media path', url: `/media/${prize.imagen}` },
      { name: 'Relative direct path', url: `/${prize.imagen}` },
    ];
    
    const results = {};
    
    for (const variant of variants) {
      results[variant.name] = await testImageUrl(variant.url);
    }
    
    setTestResults(prev => ({
      ...prev,
      [prize.id]: results
    }));
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Media Test Page</h1>
      
      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Media Configuration</h2>
        <p><strong>Base URL:</strong> {apiConfig.getBaseUrl()}</p>
        <p><strong>Media Root:</strong> {mediaRoot}</p>
      </div>
      
      {loading ? (
        <div className="text-center p-10">Loading prizes...</div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">Prize Images Test</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prizes.map(prize => (
              <div key={prize.id} className="border rounded-lg p-4">
                <h3 className="font-bold text-lg">{prize.nombre} (ID: {prize.id})</h3>
                <p className="text-sm text-gray-500 mb-2">Image path: {prize.imagen || 'No image'}</p>
                
                {prize.imagen ? (
                  <>
                    <div className="mb-4">
                      <button 
                        onClick={() => testAllImageVariants(prize)}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        Test Image URLs
                      </button>
                    </div>
                    
                    {testResults[prize.id] && (
                      <div className="mb-4 bg-gray-50 p-3 rounded text-sm">
                        <h4 className="font-semibold mb-2">URL Test Results:</h4>
                        <ul>
                          {Object.entries(testResults[prize.id]).map(([variant, success]) => (
                            <li key={variant} className="flex items-center mb-1">
                              <span className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {success ? '✓' : '✗'}
                              </span>
                              {variant}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-semibold mb-2">Image Preview:</h4>
                      <div className="border rounded bg-gray-100 h-40 flex items-center justify-center">
                        <img 
                          src={apiConfig.getMediaUrl(prize.imagen)} 
                          alt={prize.nombre}
                          className="max-h-full max-w-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/300x200?text=Image+Error";
                          }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        URL: {apiConfig.getMediaUrl(prize.imagen)}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 italic">No image available for this prize</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
