import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FaCamera, FaSpinner, FaTimes, FaQrcode, FaBarcode, FaKeyboard, FaSearch, FaCheck } from 'react-icons/fa';
import PropTypes from 'prop-types';

export const BarcodeScanner = ({ onCodeScanned, className = '', showManualInput = true }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [lastScannedCode, setLastScannedCode] = useState('');
  const [scanSuccess, setScanSuccess] = useState(false);
  
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
      
      // Select camera
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        throw new Error("No es troba cap càmera");
      }
      
      // Try to get back camera first (usually camera index 1 on mobile devices)
      // If that fails, fall back to the first available camera
      let selectedCamera;
      if (cameras.length > 1) {
        // Look for back camera by name
        const backCamera = cameras.find(camera => 
          camera.label.toLowerCase().includes('back') || 
          camera.label.toLowerCase().includes('trasera') ||
          camera.label.toLowerCase().includes('posterior')
        );
        
        selectedCamera = backCamera || cameras[cameras.length - 1];
      } else {
        selectedCamera = cameras[0];
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
    } else {
      setIsScanning(false);
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
      
      // Pass code to parent component
      onCodeScanned(code);
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
      onCodeScanned(manualCode.trim());
      setManualCode('');
      // Start cooldown after manual input too
      startCooldown();
    }
  };
  
  const toggleMode = () => {
    if (isScanning) {
      stopScanner();
    }
    setIsManualMode(!isManualMode);
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
              Exemples: 8480000160164 (aigua), 8414533043847 (diari)
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
