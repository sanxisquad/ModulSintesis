import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaCamera, FaQrcode, FaSync, FaLightbulb, FaPowerOff, FaStar } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';

const BarcodeScanner = ({ onScanComplete }) => {
  const [scanning, setScanning] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraId, setCameraId] = useState(null);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [torchOn, setTorchOn] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  
  const scannerContainerRef = useRef(null);
  
  // Inicializar el escáner
  useEffect(() => {
    if (!html5QrCode && scannerContainerRef.current) {
      const newHtml5QrCode = new Html5Qrcode('scanner');
      setHtml5QrCode(newHtml5QrCode);
      
      // Obtener cámaras disponibles
      Html5Qrcode.getCameras()
        .then(devices => {
          if (devices && devices.length) {
            setAvailableCameras(devices);
            setCameraId(devices[0].id); // Seleccionar la primera cámara por defecto
          } else {
            setError('No se han detectado cámaras en este dispositivo');
          }
        })
        .catch(err => {
          setError('Error al acceder a la cámara: ' + err.message);
        });
    }
    
    // Limpiar al desmontar
    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop()
          .then(() => console.log('Scanner stopped'))
          .catch(err => console.error('Error stopping scanner:', err));
      }
    };
  }, []);
  
  // Función para iniciar el escaneo
  const startScanning = () => {
    if (!html5QrCode || !cameraId) return;
    
    setScanning(true);
    setResult(null);
    setError('');
    
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 150 }
    };
    
    html5QrCode.start(
      cameraId,
      config,
      onScanSuccess,
      onScanFailure
    )
    .then(() => {
      console.log('Scanner started');
      // Intentar encender la linterna si está disponible
      if (html5QrCode.getRunningTrackCapabilities().torch) {
        setTorchOn(false); // Comenzar con la linterna apagada
      }
    })
    .catch(err => {
      setError('Error al iniciar el escáner: ' + err.message);
      setScanning(false);
    });
  };
  
  // Función para detener el escaneo
  const stopScanning = () => {
    if (html5QrCode && html5QrCode.isScanning) {
      html5QrCode.stop()
        .then(() => {
          console.log('Scanner stopped');
          setScanning(false);
          if (torchOn) {
            setTorchOn(false);
          }
        })
        .catch(err => {
          console.error('Error stopping scanner:', err);
        });
    }
  };
  
  // Función para alternar la linterna
  const toggleTorch = () => {
    if (html5QrCode && html5QrCode.isScanning) {
      html5QrCode.toggleFlash()
        .then(() => {
          setTorchOn(!torchOn);
        })
        .catch(err => {
          console.error('Error toggling flash:', err);
          toast.error('No se puede controlar la linterna en este dispositivo');
        });
    }
  };
  
  // Función para cambiar de cámara
  const switchCamera = () => {
    if (html5QrCode && html5QrCode.isScanning) {
      stopScanning();
      // Cambiar a la siguiente cámara disponible
      const currentIndex = availableCameras.findIndex(camera => camera.id === cameraId);
      const nextIndex = (currentIndex + 1) % availableCameras.length;
      setCameraId(availableCameras[nextIndex].id);
      
      // Reiniciar el escaneo después de un breve retraso
      setTimeout(() => {
        startScanning();
      }, 500);
    }
  };
  
  // Manejar el éxito del escaneo
  const onScanSuccess = (decodedText) => {
    // Detenemos el escaneo después de un resultado exitoso
    stopScanning();
    
    setLoading(true);
    // Consultar la API con el código de barras escaneado
    axios.post('/api/reciclar/escanear/', { codigo: decodedText }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => {
      setResult(response.data);
      // Llamar al callback para informar al componente padre
      if (onScanComplete) {
        onScanComplete(response.data);
      }
      toast.success(`¡Producto reciclado! +${response.data.puntos_nuevos} puntos`);
    })
    .catch(error => {
      if (error.response && error.response.data) {
        setError(error.response.data.error || error.response.data.message || 'Error al procesar el código');
        toast.error(error.response.data.error || error.response.data.message || 'Error al procesar el código');
      } else {
        setError('Error de conexión');
        toast.error('Error de conexión');
      }
    })
    .finally(() => {
      setLoading(false);
    });
  };
  
  // Manejar el fracaso del escaneo (no es necesario mostrar errores al usuario)
  const onScanFailure = (error) => {
    // No hacemos nada, solo continuamos escaneando
    console.log('Code scan error:', error);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-green-600 text-white flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center">
          <FaQrcode className="mr-2" /> Escáner de Reciclaje
        </h2>
        {user && (
          <div className="flex items-center bg-green-500 px-3 py-1 rounded-full">
            <FaStar className="text-yellow-300 mr-1" />
            <span className="font-bold">{user.score || 0} puntos</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div 
          id="scanner" 
          ref={scannerContainerRef} 
          className="bg-gray-100 rounded-lg overflow-hidden relative"
          style={{ minHeight: '300px' }}
        ></div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {loading && (
          <div className="mt-4 p-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        )}
        
        {result && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center mb-3">
              {result.producto.imagen_url && (
                <img 
                  src={result.producto.imagen_url} 
                  alt={result.producto.nombre_producto} 
                  className="w-16 h-16 object-contain mr-3 bg-white rounded p-1"
                />
              )}
              <div>
                <h3 className="font-bold">{result.producto.nombre_producto}</h3>
                {result.producto.marca && (
                  <p className="text-sm text-gray-600">{result.producto.marca}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm mb-3">
              <div>
                <p className="font-semibold text-gray-700">Material:</p>
                <p className="font-bold text-lg" style={{ color: result.material?.color || '#000' }}>
                  {result.material?.nombre}
                </p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-700">Contenedor:</p>
                <p className="font-bold text-lg">{result.material?.contenedor}</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-700">Puntos:</p>
                <p className="font-bold text-lg text-green-600">+{result.puntos_nuevos}</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                setResult(null);
                startScanning();
              }}
              className="w-full mt-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Escanear otro producto
            </button>
          </div>
        )}
        
        {/* Controles de cámara */}
        <div className="mt-4 flex justify-center space-x-3">
          {!scanning ? (
            <button
              onClick={startScanning}
              disabled={!cameraId || loading}
              className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <FaCamera className="mr-2" /> Iniciar escaneo
            </button>
          ) : (
            <>
              <button
                onClick={stopScanning}
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <FaPowerOff className="mr-2" /> Parar
              </button>
              
              {availableCameras.length > 1 && (
                <button
                  onClick={switchCamera}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FaSync className="mr-2" /> Cambiar cámara
                </button>
              )}
              
              <button
                onClick={toggleTorch}
                className={`${torchOn ? 'bg-yellow-600' : 'bg-gray-600'} text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors flex items-center`}
              >
                <FaLightbulb className="mr-2" /> Linterna
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="p-4 bg-gray-100 border-t">
        <p className="text-center text-sm text-gray-600">
          Escanea los códigos de barras de productos para reciclar y gana puntos
        </p>
      </div>
    </div>
  );
};

export default BarcodeScanner;
