import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  FaCamera, 
  FaSpinner, 
  FaTimes, 
  FaQrcode, 
  FaBarcode, 
  FaKeyboard, 
  FaSearch, 
  FaCheck,
  FaRecycle,
  FaPlus,
  FaTrash,
  FaExclamationTriangle,
  FaBox
} from 'react-icons/fa';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { escanearCodigo, agregarProductoABolsa, crearBolsa } from '../../api/reciclajeApi';
import { toast } from 'react-hot-toast';

export const BarcodeScanner = ({ onCodeScanned, className = '', showManualInput = true }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [lastScannedCode, setLastScannedCode] = useState('');
  const [scanSuccess, setScanSuccess] = useState(false);
  
  // Add state for bag functionality
  const [scanResult, setScanResult] = useState(null);
  const [selectedBag, setSelectedBag] = useState(null);
  const [addingToBag, setAddingToBag] = useState(false);
  const [creatingBag, setCreatingBag] = useState(false);
  const [success, setSuccess] = useState(null);
  
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const cooldownTimerRef = useRef(null);
  
  // Cooldown configuration
  const COOLDOWN_DURATION = 3; // seconds
  
  // Reset scanner when unmounting component
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(err => console.error(err));
      }
      
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);
  
  const startScanner = async () => {
    if (!scannerRef.current) return;
    
    setError('');
    setIsScanning(true);
    
    try {
      const html5QrCode = new Html5Qrcode('barcode-scanner');
      html5QrCodeRef.current = html5QrCode;
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      // Select back camera when possible
      const cameras = await Html5Qrcode.getCameras();
      let selectedCamera;
      
      if (cameras.length > 1) {
        // Try to find back camera by label
        const backCamera = cameras.find(camera => 
          camera.label.toLowerCase().includes('back') || 
          camera.label.toLowerCase().includes('trasera') ||
          camera.label.toLowerCase().includes('posterior')
        );
        
        // Use back camera if found, otherwise use the last camera (which is often the back camera)
        selectedCamera = backCamera || cameras[cameras.length - 1];
      } else {
        selectedCamera = cameras[0]; // Just use the only camera
      }
      
      if (!selectedCamera) {
        throw new Error("No es troba cap càmera");
      }
      
      console.log("Using camera:", selectedCamera.label);
      
      await html5QrCode.start(
        selectedCamera.id,
        config,
        handleScanSuccess,
        handleScanError
      );
    } catch (err) {
      console.error("Error starting scanner:", err);
      setError(err.message || "Error a l'iniciar l'escàner");
      setIsScanning(false);
    }
  };
  
  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop()
        .then(() => {
          html5QrCodeRef.current = null;
          setIsScanning(false);
        })
        .catch(err => console.error("Error stopping scanner:", err));
    }
  };
  
  const handleScanSuccess = (code) => {
    // Check if code is different from last scanned code or cooldown is over
    if (code !== lastScannedCode || !isCoolingDown) {
      console.log("Successfully scanned code:", code);
      setLastScannedCode(code);
      
      // Visual feedback for success
      setScanSuccess(true);
      setTimeout(() => setScanSuccess(false), 1500);
      
      // Stop scanner and start cooldown
      stopScanner();
      startCooldown();
      
      // Process the scanned code
      processScannedCode(code);
    }
  };
  
  const handleScanError = (err) => {
    // We don't need to show these errors to the user, as they're normal during scanning
  };
  
  const startCooldown = () => {
    setIsCoolingDown(true);
    setCooldownSeconds(COOLDOWN_DURATION);
    
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }
    
    cooldownTimerRef.current = setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current);
          setIsCoolingDown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processScannedCode(manualCode.trim());
      setManualCode('');
    }
  };
  
  // Process a scanned or manually entered code
  const processScannedCode = (code) => {
    setError('');
    
    // Call API to process the code
    escanearCodigo(code)
      .then(response => {
        console.log("API response:", response);
        
        // If there's an error message in the response
        if (response.error) {
          if (response.tipo === 'cooldown') {
            toast.error(`Has d'esperar abans de tornar a escanejar aquest producte`, {
              duration: 4000,
              icon: '⏱️',
            });
            return;
          }
          
          setError(response.mensaje || "Error al processar el codi");
          return;
        }
        
        // Success - store the scan result and set up bag selection
        setScanResult(response);
        
        // Set up the success state with all the relevant information
        setSuccess({
          product: response.producto,
          points: response.puntos_nuevos,
          totalPoints: response.puntos_totales,
          material: response.material,
          availableBags: response.bolsas_disponibles || [],
          addedToBag: response.agregado_a_bolsa,
          bagInfo: response.bolsa
        });
        
        // If this was already added to a bag in the API response
        if (response.agregado_a_bolsa && response.bolsa) {
          toast.success(`Producte afegit a la bossa: ${response.bolsa.nombre || 'Bossa #' + response.bolsa.id}`);
        }
        
        // Pass scan result to parent component
        if (onCodeScanned) {
          onCodeScanned(response);
        }
      })
      .catch(err => {
        console.error("Error scanning code:", err);
        
        // Handle specific API error responses
        if (err.response?.data) {
          const errorData = err.response.data;
          setError(errorData.mensaje || errorData.error || "Error en escanejar el producte");
          
          // Show specific toast for cooldown errors
          if (errorData.tipo === 'cooldown') {
            const timeData = errorData.tiempo_restante || {};
            toast.error(
              `Has d'esperar ${timeData.minutos || 0}m ${timeData.segundos || 0}s abans de tornar a escanejar aquest producte`,
              { duration: 5000, icon: '⏱️' }
            );
          }
        } else {
          setError("Error connectant amb el servidor. Comprova la teva connexió a Internet.");
        }
      });
  };
  
  const toggleMode = () => {
    if (isScanning) {
      stopScanner();
    }
    setIsManualMode(!isManualMode);
    
    // Reset states when switching modes
    setSuccess(null);
    setSelectedBag(null);
    setError('');
  };
  
  // Bag functionality
  const handleAddToBag = async () => {
    if (!selectedBag || !success || !success.product) return;
    
    setAddingToBag(true);
    try {
      await agregarProductoABolsa(success.product.id, selectedBag);
      toast.success("Producte afegit a la bossa amb èxit!");
      
      // Reset states to allow new scans
      setSuccess(null);
      setSelectedBag(null);
      setScanResult(null);
      setManualCode('');
    } catch (error) {
      console.error("Error adding to bag:", error);
      toast.error("Error en afegir el producte a la bossa");
    } finally {
      setAddingToBag(false);
    }
  };

  // Create a new bag of the right material type
  const handleCreateBag = async () => {
    if (!success || !success.material || !success.product) return;
    
    setCreatingBag(true);
    try {
      // Create a new bag with the scanned product's material
      const newBag = await crearBolsa(success.material.id);
      
      // Add the product to the newly created bag
      await agregarProductoABolsa(success.product.id, newBag.id);
      
      toast.success("S'ha creat una nova bossa i s'hi ha afegit el producte!");
      
      // Reset states to allow new scans
      setSuccess(null);
      setSelectedBag(null);
      setScanResult(null);
      setManualCode('');
    } catch (error) {
      console.error("Error creating bag:", error);
      toast.error("Error en crear la bossa");
    } finally {
      setCreatingBag(false);
    }
  };
  
  // Helper function for material badge display
  const getMaterialBadge = (materialName) => {
    if (!materialName) return null;
    
    // Normalize material name to lowercase
    const material = materialName.toLowerCase();
    
    // Define styles for different materials
    const styles = {
      'plàstic': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FaRecycle className="mr-2 text-yellow-600" /> },
      'plastic': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FaRecycle className="mr-2 text-yellow-600" /> },
      'paper': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FaRecycle className="mr-2 text-blue-600" /> },
      'vidre': { bg: 'bg-green-100', text: 'text-green-800', icon: <FaRecycle className="mr-2 text-green-600" /> },
      'orgànic': { bg: 'bg-amber-100', text: 'text-amber-800', icon: <FaRecycle className="mr-2 text-amber-600" /> },
      'rebuig': { bg: 'bg-gray-100', text: 'text-gray-800', icon: <FaTrash className="mr-2 text-gray-600" /> },
      'metall': { bg: 'bg-gray-100', text: 'text-gray-800', icon: <FaRecycle className="mr-2 text-gray-600" /> }
    };
    
    // Find matching style or use default
    let style = null;
    for (const key in styles) {
      if (material.includes(key)) {
        style = styles[key];
        break;
      }
    }
    
    // Default style if no match
    if (!style) {
      style = { bg: 'bg-purple-100', text: 'text-purple-800', icon: <FaRecycle className="mr-2 text-purple-600" /> };
    }
    
    return (
      <div className={`${style.bg} ${style.text} inline-flex items-center px-3 py-1 rounded-full text-sm font-medium`}>
        {style.icon}
        {materialName}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {isManualMode ? 'Introducció manual' : 'Escàner de codis'}
        </h3>
        <button
          onClick={toggleMode}
          className="text-gray-500 hover:text-blue-500 p-2 rounded-lg"
        >
          {isManualMode ? <FaCamera /> : <FaKeyboard />}
        </button>
      </div>
      
      {/* Scanner view or manual input */}
      <div className="p-4">
        {isManualMode ? (
          <form onSubmit={handleManualSubmit} className="flex flex-col space-y-3">
            <div className="flex">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Introdueix el codi de barres"
                className="flex-1 p-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                disabled={isCoolingDown}
              />
              <button
                type="submit"
                className={`px-3 py-2 ${isCoolingDown ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-r-lg flex items-center justify-center`}
                disabled={isCoolingDown || !manualCode.trim()}
              >
                {isCoolingDown ? <FaSpinner className="animate-spin" /> : <FaSearch />}
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              Exemples: 8480000160164 (aigua), 8414533043847 (diari), 8410188012096 (llauna)
            </div>
          </form>
        ) : (
          <div className="relative">
            {/* Scanner container */}
            <div 
              id="barcode-scanner" 
              ref={scannerRef}
              className={`w-full h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center
                ${scanSuccess ? 'border-4 border-green-500' : ''}`}
            >
              {!isScanning && !scanSuccess && (
                <div className="text-center p-4">
                  {error ? (
                    <div className="text-red-500">
                      <FaTimes className="mx-auto h-8 w-8 mb-2" />
                      <p>{error}</p>
                    </div>
                  ) : (
                    <div>
                      <FaBarcode className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-500">
                        {isCoolingDown 
                          ? `Esperant ${cooldownSeconds}s...` 
                          : "Pressiona 'Escanejar' per començar"}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {scanSuccess && !isScanning && (
                <div className="absolute inset-0 bg-green-100 bg-opacity-80 flex items-center justify-center z-10">
                  <div className="text-center">
                    <FaCheck className="mx-auto h-16 w-16 text-green-500 mb-2" />
                    <p className="text-green-700 font-bold text-lg">Codi escanejat!</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Scanner controls */}
            <div className="mt-4 flex justify-center">
              {isScanning ? (
                <button
                  onClick={stopScanner}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center"
                >
                  <FaTimes className="mr-2" /> Aturar escàner
                </button>
              ) : (
                <button
                  onClick={startScanner}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    isCoolingDown 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                  disabled={isCoolingDown}
                >
                  {isCoolingDown ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" /> 
                      Disponible en {cooldownSeconds}s...
                    </>
                  ) : (
                    <>
                      <FaQrcode className="mr-2" /> Escanejar
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Success result with bag selection */}
      {success && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-green-600 flex items-center">
                <FaCheck className="mr-2" /> Producte escanejat!
              </h3>
              <span className="text-green-600 font-bold">+{success.points} pts</span>
            </div>
            
            <div className="mt-3 flex items-center">
              {success.product.imagen_url ? (
                <img 
                  src={success.product.imagen_url} 
                  alt={success.product.nombre_producto}
                  className="w-16 h-16 object-contain bg-white rounded mr-3"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center mr-3">
                  <FaBox className="text-gray-400 text-2xl" />
                </div>
              )}
              
              <div>
                <p className="font-medium">{success.product.nombre_producto}</p>
                <p className="text-sm text-gray-600">{success.product.marca}</p>
                {success.material && (
                  <div className="mt-1">
                    {getMaterialBadge(success.material.nombre)}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* If already added to a bag */}
          {success.addedToBag && success.bagInfo ? (
            <div className="mt-3">
              <div className="bg-blue-50 p-3 rounded-lg mb-3">
                <p className="text-blue-700 flex items-center">
                  <FaCheck className="mr-2" /> 
                  Producte afegit a la bossa: <strong className="ml-2">{success.bagInfo.nombre || `Bossa #${success.bagInfo.id}`}</strong>
                </p>
              </div>
              
              <button
                onClick={() => {
                  setSuccess(null);
                  setSelectedBag(null);
                }}
                className="w-full mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Continuar
              </button>
            </div>
          ) : (
            /* Bag selection for new scan */
            <div className="mt-3">
              <h4 className="font-medium mb-2">
                Vols afegir aquest producte a una bossa virtual?
              </h4>
              
              {success.availableBags && success.availableBags.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 mb-2">
                    Selecciona una bossa compatible amb material {success.material?.nombre}:
                  </p>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                    {success.availableBags.map(bag => (
                      <button
                        key={bag.id}
                        onClick={() => setSelectedBag(bag.id)}
                        className={`w-full p-2 border rounded-lg flex justify-between items-center ${
                          selectedBag === bag.id 
                            ? 'bg-green-50 border-green-500' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <FaTrash className="text-gray-500 mr-2" />
                          <span>{bag.nombre || `Bossa #${bag.id}`}</span>
                        </div>
                        <span className="text-sm text-green-600 font-medium">{bag.puntos_totales || 0} pts</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex justify-between mt-3">
                    <button
                      onClick={() => {
                        setSuccess(null);
                        setSelectedBag(null);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      No afegir
                    </button>
                    
                    <button
                      onClick={handleAddToBag}
                      disabled={!selectedBag || addingToBag}
                      className={`px-4 py-2 rounded-lg text-white ${
                        selectedBag && !addingToBag
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-gray-300 cursor-not-allowed'
                      } flex items-center`}
                    >
                      {addingToBag ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Afegint...
                        </>
                      ) : (
                        'Afegir a la bossa'
                      )}
                    </button>
                  </div>
                </>
              ) : (
                // No compatible bags available
                <div>
                  <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                    <p className="text-yellow-700 flex items-center">
                      <FaExclamationTriangle className="text-yellow-500 mr-2" />
                      No tens cap bossa per materials de tipus <strong className="ml-1 mr-1">{success.material?.nombre}</strong>
                    </p>
                  </div>
                  
                  <div className="flex justify-between mt-3">
                    <button
                      onClick={() => {
                        setSuccess(null);
                        setSelectedBag(null);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      No crear bossa
                    </button>
                    
                    <button 
                      onClick={handleCreateBag}
                      disabled={creatingBag}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
                    >
                      {creatingBag ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Creant bossa...
                        </>
                      ) : (
                        <>
                          <FaPlus className="mr-2" /> Crear bossa
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mt-3 text-center">
                <Link 
                  to="/virtualbags" 
                  className="text-sm text-blue-600 hover:underline"
                >
                  Gestionar totes les bosses
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Cooldown indicator */}
      {isCoolingDown && (
        <div className="p-3 bg-blue-50 text-center text-sm">
          <p className="text-blue-600">
            Temps de repòs: {cooldownSeconds} {cooldownSeconds === 1 ? 'segon' : 'segons'}
          </p>
        </div>
      )}
    </div>
  );
};

BarcodeScanner.propTypes = {
  onCodeScanned: PropTypes.func.isRequired,
  className: PropTypes.string,
  showManualInput: PropTypes.bool
};

export default BarcodeScanner;
