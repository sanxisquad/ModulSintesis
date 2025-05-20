import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaCamera, FaQrcode, FaSync, FaLightbulb, FaPowerOff, FaStar, FaBug } from 'react-icons/fa';
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
  const [debugInfo, setDebugInfo] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const { user } = useAuth();
  
  const scannerContainerRef = useRef(null);
  
  // Función para mostrar errores y registrarlos
  const logError = (message, error) => {
    const errorDetails = error ? `${message}: ${error.message || error}` : message;
    console.error(errorDetails, error);
    setError(errorDetails);
    toast.error(errorDetails);
    setDebugInfo(prev => prev + '\n' + new Date().toISOString() + ': ' + errorDetails);
  };

  // Solicitar permisos de cámara explícitamente
  useEffect(() => {
    // Utilizar facingMode: 'environment' para intentar obtener la cámara trasera directamente
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: { ideal: 'environment' } 
      } 
    })
      .then(stream => {
        // Éxito - el usuario ha concedido permisos
        setPermissionGranted(true);
        toast.success('Permís de càmera concedit');
        
        // Liberar la cámara inmediatamente
        stream.getTracks().forEach(track => track.stop());
        
        // Ahora es seguro inicializar el escáner
        initializeScanner();
      })
      .catch(err => {
        logError('No s\'ha pogut accedir a la càmera. Si us plau, permet l\'accés a la càmera del navegador.', err);
      });
  }, []);

  // Inicializar el escáner solo después de obtener permisos
  const initializeScanner = () => {
    try {
      if (!scannerContainerRef.current) return;

      // Verificar que el div de escáner existe
      const scannerElement = document.getElementById('scanner');
      if (!scannerElement) {
        logError('No es troba l\'element del escàner al DOM');
        return;
      }

      // Crear una nueva instancia del escáner
      const newHtml5QrCode = new Html5Qrcode('scanner');
      setHtml5QrCode(newHtml5QrCode);
      
      // Obtener cámaras disponibles
      Html5Qrcode.getCameras()
        .then(devices => {
          if (devices && devices.length) {
            setAvailableCameras(devices);
            
            // Log todas las cámaras para diagnóstico
            console.log("Cámaras detectadas:", devices.map(d => ({ id: d.id, label: d.label })));
            
            // Estrategia mejorada para encontrar la cámara trasera:
            // 1. Buscar palabras clave específicas
            const rearCamera = devices.find(camera => 
              /back|rear|trasera|environment|posterior|dorsal|externa|back camera|cámara trasera|0,facing back/i.test(camera.label));
            
            // 2. Si no encontramos por etiqueta, probar con la última cámara (suele ser la trasera)
            if (rearCamera) {
              setCameraId(rearCamera.id);
              console.log("Cámara trasera detectada por etiqueta:", rearCamera.label);
              toast.success('Càmera posterior seleccionada: ' + rearCamera.label);
              
              // Iniciar escáner con un retraso para dar tiempo a que se configure la cámara
              setTimeout(() => {
                startScanningWithCamera(newHtml5QrCode, rearCamera.id);
              }, 1000);
            } else if (devices.length > 1) {
              // En dispositivos con múltiples cámaras, la última suele ser la trasera
              const defaultCamera = devices[devices.length - 1];
              setCameraId(defaultCamera.id);
              console.log("Usando última cámara como trasera:", defaultCamera.label);
              toast.success('Càmera posterior (assumida): ' + defaultCamera.label);
              
              setTimeout(() => {
                startScanningWithCamera(newHtml5QrCode, defaultCamera.id);
              }, 1000);
            } else {
              // Solo hay una cámara, usarla
              const onlyCamera = devices[0];
              setCameraId(onlyCamera.id);
              console.log("Solo hay una cámara disponible:", onlyCamera.label);
              toast.success('Càmera única disponible: ' + onlyCamera.label);
              
              setTimeout(() => {
                startScanningWithCamera(newHtml5QrCode, onlyCamera.id);
              }, 1000);
            }
            
            // Mostrar información de las cámaras disponibles
            const cameraInfo = devices.map(d => `${d.id}: ${d.label}`).join('\n');
            setDebugInfo('Càmeres disponibles:\n' + cameraInfo);
          } else {
            logError('No s\'han detectat càmeres en aquest dispositiu');
          }
        })
        .catch(err => {
          logError('Error al enumerar les càmeres', err);
        });
    } catch (err) {
      logError('Error al inicialitzar l\'escàner', err);
    }
  };

  // Función para iniciar el escaneo con una cámara específica
  const startScanningWithCamera = (scanner, camId) => {
    if (!scanner || !camId) {
      logError('Escàner no inicialitzat o càmera no seleccionada');
      return;
    }
    
    setScanning(true);
    setResult(null);
    setError('');
    
    // Configuración más simple que debería funcionar en más dispositivos
    const config = {
      fps: 10,
      qrbox: 250,
      // Eliminar formatsToSupport y aspectRatio para compatibilidad
    };
    
    toast.success('Iniciant càmera: ' + camId);
    console.log("Iniciando cámara con ID:", camId);
    
    scanner.start(
      camId,
      config,
      onScanSuccess,
      onScanFailure
    )
    .then(() => {
      console.log('Scanner started');
      toast.success('Escàner iniciat correctament');
      
      // Comprobar si la cámara tiene linterna
      try {
        const cameraCapabilities = scanner.getRunningTrackCameraCapabilities();
        if (cameraCapabilities && cameraCapabilities.torch) {
          toast.success('Linterna disponible');
        }
      } catch (err) {
        console.log('No se pudo verificar la linterna:', err);
      }
    })
    .catch(err => {
      logError('Error al iniciar l\'escàner', err);
      setScanning(false);
      
      // Intentar una configuración aún más simple si falla
      const basicConfig = {
        fps: 5,
      };
      
      toast.info('Intentant configuració bàsica...');
      
      scanner.start(
        camId,
        basicConfig,
        onScanSuccess,
        onScanFailure
      )
      .then(() => {
        console.log('Scanner started with basic config');
        toast.success('Escàner iniciat amb configuració bàsica');
        setScanning(true);
      })
      .catch(secondErr => {
        logError('Error també amb la configuració bàsica', secondErr);
      });
    });
  };
  
  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop()
          .then(() => console.log('Scanner stopped'))
          .catch(err => console.error('Error stopping scanner:', err));
      }
    };
  }, [html5QrCode]);
  
  // Función para iniciar el escaneo
  const startScanning = () => {
    if (!html5QrCode || !cameraId) {
      logError('Escàner no inicialitzat o càmera no seleccionada');
      return;
    }
    
    startScanningWithCamera(html5QrCode, cameraId);
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
          logError('Error al detenir l\'escàner', err);
        });
    }
  };
  
  // Función para alternar la linterna
  const toggleTorch = () => {
    if (html5QrCode && html5QrCode.isScanning) {
      html5QrCode.toggleFlash()
        .then(() => {
          setTorchOn(!torchOn);
          toast.success(torchOn ? 'Llanterna apagada' : 'Llanterna encesa');
        })
        .catch(err => {
          logError('No es pot controlar la llanterna en aquest dispositiu', err);
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
      toast.success('Canviant a càmera: ' + availableCameras[nextIndex].label);
      
      // Reiniciar el escaneo después de un breve retraso
      setTimeout(() => {
        startScanningWithCamera(html5QrCode, availableCameras[nextIndex].id);
      }, 500);
    }
  };
  
  // Manejar el éxito del escaneo
  const onScanSuccess = (decodedText) => {
    // Detenemos el escaneo después de un resultado exitoso
    stopScanning();
    
    toast.success(`Codi detectat: ${decodedText}`);
    setLoading(true);
    
    // Consultar la API con el código de barras escaneado
    axios.post('/api/reciclar/escanejar/', { codigo: decodedText }, {
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
      toast.success(`¡Producte reciclat! +${response.data.puntos_nuevos} punts`);
    })
    .catch(error => {
      if (error.response && error.response.data) {
        logError(error.response.data.error || error.response.data.message || 'Error al processar el codi');
      } else {
        logError('Error de connexió al servidor');
      }
    })
    .finally(() => {
      setLoading(false);
    });
  };
  
  // Manejar el fracaso del escaneo
  const onScanFailure = (error) => {
    // No mostrar cada fallo, solo registrarlo para depuración
    console.log('Code scan error:', error);
  };
  
  // Enviar información de depuración por correo
  const sendDebugInfo = () => {
    const emailSubject = encodeURIComponent('ReciclamJA Scanner Debug Info');
    const emailBody = encodeURIComponent(`
Debug Information:
User: ${user?.username || 'Not logged in'}
Device: ${navigator.userAgent}
Cameras: ${availableCameras.map(c => c.label).join(', ')}
Selected Camera: ${availableCameras.find(c => c.id === cameraId)?.label || 'None'}
Permission Granted: ${permissionGranted ? 'Yes' : 'No'}
Errors: ${error}
Debug Log:
${debugInfo}
`);
    
    window.open(`mailto:msancheztasies@gmail.com?subject=${emailSubject}&body=${emailBody}`);
    toast.success('S\'obrirà el client de correu per enviar la informació de depuració');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-green-600 text-white flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center">
          <FaQrcode className="mr-2" /> Escàner de Reciclatge
        </h2>
        {user && (
          <div className="flex items-center bg-green-500 px-3 py-1 rounded-full">
            <FaStar className="text-yellow-300 mr-1" />
            <span className="font-bold">{user.score || 0} punts</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div 
          id="scanner" 
          ref={scannerContainerRef} 
          className="bg-gray-100 rounded-lg overflow-hidden relative"
          style={{ minHeight: '300px', width: '100%' }}
        ></div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
            <p className="font-bold mb-1">Error:</p>
            <p className="text-sm">{error}</p>
            <button 
              className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center" 
              onClick={sendDebugInfo}
            >
              <FaBug className="mr-1" /> Enviar informe d'error
            </button>
          </div>
        )}
        
        {!permissionGranted && (
          <div className="mt-4 p-3 bg-amber-100 text-amber-700 rounded-lg">
            <p className="font-bold mb-1">Cal permís de càmera</p>
            <p className="text-sm">Per utilitzar l'escàner, necessitem accés a la càmera. Si us plau, accepta el permís quan el navegador ho sol·liciti.</p>
            <button 
              className="mt-2 bg-amber-500 text-white px-3 py-1 rounded text-sm"
              onClick={() => {
                navigator.mediaDevices.getUserMedia({ video: true })
                  .then(stream => {
                    stream.getTracks().forEach(track => track.stop());
                    setPermissionGranted(true);
                    toast.success('Permís de càmera concedit');
                    initializeScanner();
                  })
                  .catch(err => logError('Permís de càmera denegat', err));
              }}
            >
              Sol·licitar permís
            </button>
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
              {result.producto?.imagen_url && (
                <img 
                  src={result.producto.imagen_url} 
                  alt={result.producto.nombre_producto} 
                  className="w-16 h-16 object-contain mr-3 bg-white rounded p-1"
                />
              )}
              <div>
                <h3 className="font-bold">{result.producto?.nombre_producto || 'Producte'}</h3>
                {result.producto?.marca && (
                  <p className="text-sm text-gray-600">{result.producto.marca}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm mb-3">
              <div>
                <p className="font-semibold text-gray-700">Material:</p>
                <p className="font-bold text-lg" style={{ color: result.material?.color || '#000' }}>
                  {result.material?.nombre || 'Desconegut'}
                </p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-700">Contenidor:</p>
                <p className="font-bold text-lg">{result.material?.contenedor || 'N/A'}</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-700">Punts:</p>
                <p className="font-bold text-lg text-green-600">+{result.puntos_nuevos || 0}</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                setResult(null);
                startScanning();
              }}
              className="w-full mt-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Escanejar un altre producte
            </button>
          </div>
        )}
        
        {/* Controles de cámara */}
        <div className="mt-4 flex justify-center space-x-3">
          {!scanning ? (
            <button
              onClick={startScanning}
              disabled={!cameraId || loading || !permissionGranted}
              className={`py-2 px-6 rounded-lg flex items-center ${
                !cameraId || loading || !permissionGranted
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <FaCamera className="mr-2" /> Iniciar escaneig
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
                  <FaSync className="mr-2" /> Canviar càmera
                </button>
              )}
              
              <button
                onClick={toggleTorch}
                className={`${torchOn ? 'bg-yellow-600' : 'bg-gray-600'} text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors flex items-center`}
              >
                <FaLightbulb className="mr-2" /> Llanterna
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="p-4 bg-gray-100 border-t">
        <p className="text-center text-sm text-gray-600">
          Escaneja els codis de barres de productes per reciclar i guanya punts
        </p>
        
        {/* Cámara seleccionada (visible siempre para depuración) */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          Càmera: {availableCameras.find(c => c.id === cameraId)?.label || 'Cap càmera seleccionada'}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
