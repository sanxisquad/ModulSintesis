import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPrizes } from '../../api/premio.api';
import { useAuth } from '../../../hooks/useAuth';
import { FaGift, FaArrowLeft, FaArrowRight, FaCoins } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import apiConfig from '../../api/apiClient';

export const PrizeCarousel = () => {
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isAuthenticated, user } = useAuth();
  
  // Enhanced debug function for image URLs
  const debugImageUrl = (prize) => {
    if (!prize || !prize.imagen) return;
    
    console.group(`🖼️ Image Debug for Prize: ${prize.nombre} (ID: ${prize.id})`);
    console.log(`Raw image path: "${prize.imagen}"`);
    
    // Create various possible URLs to test
    const baseUrl = apiConfig.getBaseUrl();
    const possibleUrls = [
      `${baseUrl}/media/${prize.imagen}`,
      `${baseUrl}/${prize.imagen}`,
      `/media/${prize.imagen}`,
      `/${prize.imagen}`,
    ];
    
    console.log('Testing URLs:', possibleUrls);
    
    // Create an image loader to test URLs
    possibleUrls.forEach(url => {
      const img = new Image();
      img.onload = () => console.log(`✅ URL loaded successfully: ${url}`);
      img.onerror = () => console.log(`❌ URL failed to load: ${url}`);
      img.src = url;
    });
    
    console.groupEnd();
    
    // Return the standard URL
    return possibleUrls[0];
  };
  
  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        setLoading(true);
        const response = await getAllPrizes();
        // Only show prizes with available quantity
        const availablePrizes = response.data.filter(prize => prize.cantidad > 0);
        
        // Debug: Log the image paths we're receiving
        console.log("Prize images received:", availablePrizes.map(p => ({ 
          id: p.id,
          name: p.nombre, 
          imagePath: p.imagen 
        })));
        
        // Test each prize image URL
        availablePrizes.forEach(debugImageUrl);
        
        setPrizes(availablePrizes);
      } catch (error) {
        console.error("Error loading prizes:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrizes();
  }, []);
  
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === prizes.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? prizes.length - 1 : prevIndex - 1
    );
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }
  
  if (prizes.length === 0) {
    return null; // Don't show anything if no prizes are available
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 flex items-center justify-center">
        <FaGift className="text-green-500 mr-2" /> Premis Disponibles
      </h2>
      
      <div className="relative bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
        <div className="flex items-center">
          {/* Arrow left */}
          <button 
            onClick={prevSlide}
            className="z-10 absolute left-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
            aria-label="Previous prize"
          >
            <FaArrowLeft className="text-gray-700" />
          </button>
          
          {/* Slides */}
          <div className="overflow-hidden w-full">
            <div className="flex transition-transform duration-500 ease-in-out"
                 style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {prizes.map((prize, index) => (
                <div key={prize.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      {/* Image with onerror fallback */}
                      <div className="md:w-1/3 h-64 overflow-hidden">
                        {prize.imagen ? (
                          <img 
                            src={apiConfig.getMediaUrl(prize.imagen)}
                            alt={prize.nombre} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error(`❌ Error loading image: ${e.target.src}`);
                              
                              // Add comprehensive debugging info
                              const img = e.target;
                              console.group('Image Error Details');
                              console.log('Prize:', prize);
                              console.log('Original src:', img.src);
                              console.log('Natural dimensions:', img.naturalWidth, 'x', img.naturalHeight);
                              console.log('Complete URL:', img.src);
                              console.groupEnd();
                              
                              // Try next fallback with delay to avoid race conditions
                              if (img.src.includes('/media/')) {
                                console.log("🔄 Trying without /media/ prefix");
                                setTimeout(() => {
                                  img.src = `${apiConfig.getBaseUrl()}/${prize.imagen}`;
                                }, 500);
                              } else if (!img.src.startsWith(apiConfig.getBaseUrl())) {
                                console.log("🔄 Trying with base URL");
                                setTimeout(() => {
                                  img.src = `${apiConfig.getBaseUrl()}/${prize.imagen}`;
                                }, 500);
                              } else {
                                // If all fails, show placeholder
                                console.log("🔄 Using placeholder image");
                                img.onerror = null; // Prevent infinite loop
                                img.src = "https://via.placeholder.com/300x200?text=No+Image";
                              }
                            }}
                            onLoad={(e) => console.log(`✅ Image loaded successfully: ${prize.nombre}`)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <FaGift className="text-5xl text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="md:w-2/3 p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{prize.nombre}</h3>
                        <div className="flex items-center mb-4">
                          <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                            <FaCoins className="mr-1" /> {prize.puntos_costo} Punts
                          </span>
                          <span className="ml-2 text-sm text-gray-600">
                            {prize.cantidad} unitats disponibles
                          </span>
                        </div>
                        <p className="text-gray-600 mb-6 line-clamp-3">{prize.descripcion}</p>
                        
                        <div className="mt-auto">
                          {isAuthenticated ? (
                            <Link 
                              to={`/premis/${prize.id}`}
                              className={`inline-block px-4 py-2 rounded-lg text-white 
                                ${user?.score >= prize.puntos_costo 
                                  ? 'bg-green-500 hover:bg-green-600' 
                                  : 'bg-gray-400 cursor-not-allowed'}`}
                              onClick={(e) => {
                                if (user?.score < prize.puntos_costo) {
                                  e.preventDefault();
                                  toast.error(`No tens prou punts. Necessites ${prize.puntos_costo} punts.`);
                                }
                              }}
                            >
                              {user?.score >= prize.puntos_costo ? 'Bescanviar Premi' : 'Punts Insuficients'}
                            </Link>
                          ) : (
                            <Link 
                              to="/login" 
                              className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                            >
                              Inicia sessió per bescanviar
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Arrow right */}
          <button 
            onClick={nextSlide}
            className="z-10 absolute right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
            aria-label="Next prize"
          >
            <FaArrowRight className="text-gray-700" />
          </button>
        </div>
        
        {/* Dots indicator */}
        <div className="flex justify-center mt-4">
          {prizes.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 mx-1 rounded-full ${index === currentIndex ? 'bg-green-500' : 'bg-gray-300'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      
      <div className="text-center mt-4">
        <Link to="/premis" className="text-green-600 hover:text-green-700 font-medium flex items-center justify-center">
          Veure tots els premis disponibles <FaArrowRight className="ml-1" />
        </Link>
      </div>
    </div>
  );
};
