import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  FaCamera, 
  FaQrcode, 
  FaSync, 
  FaPowerOff, 
  FaStar, 
  FaBug, 
  FaBarcode,
  FaCheck,
  FaExclamationTriangle,
  FaBox,
  FaEye,
  FaTrash,
  FaRecycle,
  FaPlus,
  FaEdit,
  FaSearch
} from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';
import { escanearCodigo, agregarProductoABolsa, crearBolsa } from '../../api/reciclajeApi';
import { Link } from 'react-router-dom';
import { Spinner } from '../common/Spinner';
import { toast } from 'react-hot-toast';

const BarcodeScanner = ({ onScanComplete }) => {
  const [scanning, setScanning] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraId, setCameraId] = useState(null);
  const [availableCameras, setAvailableCameras] = useState([]);
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
              
              // Iniciar escáner con un retraso para dar tiempo a que se configure la cámara
              setTimeout(() => {
                startScanningWithCamera(newHtml5QrCode, rearCamera.id);
              }, 1000);
            } else if (devices.length > 1) {
              // En dispositivos con múltiples cámaras, la última suele ser la trasera
              const defaultCamera = devices[devices.length - 1];
              setCameraId(defaultCamera.id);
              console.log("Usando última cámara como trasera:", defaultCamera.label);
              
              setTimeout(() => {
                startScanningWithCamera(newHtml5QrCode, defaultCamera.id);
              }, 1000);
            } else {
              // Solo hay una cámara, usarla
              const onlyCamera = devices[0];
              setCameraId(onlyCamera.id);
              console.log("Solo hay una cámara disponible:", onlyCamera.label);
              
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

  // Añadir contador de errores y referencia para throttling
  const [errorCount, setErrorCount] = useState(0);
  const errorThrottleRef = useRef(false);
  const lastErrorTimeRef = useRef(Date.now());

  // Función para iniciar el escaneo con una cámara específica
  const startScanningWithCamera = (scanner, camId) => {
    if (!scanner || !camId) {
      logError('Escàner no inicialitzat o càmera no seleccionada');
      return;
    }
    
    setScanning(true);
    setResult(null);
    setError('');
    setErrorCount(0);  // Resetear contador de errores
    errorThrottleRef.current = false;  // Resetear throttle
    
    // Configuración optimizada para códigos de barras
    const config = {
      fps: 10,
      qrbox: 250,
      formatsToSupport: [
        // Códigos de barras de productos
        0x1, // CODE_128
        0x2, // CODE_39
        0x4, // EAN_13
        0x8, // EAN_8
        0x10, // UPC_A
        0x20, // UPC_E
        0x40, // UPC_EAN_EXTENSION
        0x80, // QR Code
        0x100, // Data Matrix
        0x200, // Aztec
        0x400, // Codabar
        0x800, // ITF
        0x1000, // RSS14
        0x2000  // PDF417
      ]
    };
    
    console.log("Iniciando cámara con ID:", camId);
    
    scanner.start(
      camId,
      config,
      onScanSuccess,
      onScanFailure
    )
    .then(() => {
      console.log('Scanner started');
    })
    .catch(err => {
      logError('Error al iniciar l\'escàner', err);
      setScanning(false);
      
      // Si falla, intentar sin formatsToSupport
      const simpleConfig = {
        fps: 5,
        qrbox: 250
      };
      
      scanner.start(
        camId,
        simpleConfig,
        onScanSuccess,
        onScanFailure
      )
      .then(() => {
        console.log('Scanner started with basic config');
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
        })
        .catch(err => {
          logError('Error al detenir l\'escàner', err);
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
        startScanningWithCamera(html5QrCode, availableCameras[nextIndex].id);
      }, 500);
    }
  };
  
  // Manejar el éxito del escaneo
 const onScanSuccess = (decodedText) => {
  // Detenemos el escaneo después de un resultado exitoso
  stopScanning();
  
  setLoading(true);
  
  // Usar el servicio API con manejo de errores mejorado
  escanearCodigo(decodedText)
    .then(response => {
      console.log("Respuesta de escaneo:", response);
      
      // Si la respuesta contiene un error controlado
      if (response && response.error) {
        // Verificar específicamente si es un error de cooldown
        if (response.tipo === "cooldown" && response.tiempo_restante) {
          // Mostrar toast para errores de cooldown
          toast.error(
            `Has d'esperar ${response.tiempo_restante.minutos} minut${response.tiempo_restante.minutos !== 1 ? 's' : ''} i ${response.tiempo_restante.segundos} segon${response.tiempo_restante.segons !== 1 ? 's' : ''} abans de tornar a escanejar aquest producte`, 
            {
              duration: 5000,
              icon: '⏱️',
            }
          );
          // No almacenar el resultado para cooldown
          setResult(null);
        } else if (response.tipo === "url_error") {
          // Para errores de URL, mantener el comportamiento actual
          setResult(response);
          toast.error('No s\'ha pogut connectar amb el servidor. URL incorrecta.');
          console.error("Detalle de error de URL:", response.detalle);
          
          // Añadir información de depuración
          setDebugInfo(prev => prev + '\n' + new Date().toISOString() + ': Error de URL: ' + response.detalle);
        } else {
          // Otros errores
          setResult(response);
          toast.error(response.mensaje || 'Error al processar el codi');
        }
        return;
      }
      
      // Respuesta exitosa - mostrar modal de selección de bolsa automáticamente
      setResult(response);
      
      // Verificar si hay bolsas disponibles del mismo material
      const bolsasCompatibles = response.bolsas_disponibles || [];
      
      // Establecer el estado para mostrar el modal de selección
      setSuccess({
        product: response.producto,
        points: response.puntos_nuevos,
        totalPoints: response.puntos_totales,
        material: response.material,
        availableBags: bolsasCompatibles,
        addedToBag: response.agregado_a_bolsa,
        bagInfo: response.bolsa
      });
      
      // Llamar al callback para informar al componente padre
      if (onScanComplete) {
        onScanComplete(response);
      }
    })
    .catch(error => {
      console.error("Error completo:", error);
      
      // Verificar si la respuesta incluye datos sobre cooldown
      if (error.response && error.response.data && error.response.data.tipo === 'cooldown') {
        const cooldownData = error.response.data;
        
        // Mostrar toast para cooldown con la información de tiempo restante
        toast.error(
          `Has d'esperar ${cooldownData.tiempo_restante.minuts} minut${cooldownData.tiempo_restante.minuts !== 1 ? 's' : ''} i ${cooldownData.tiempo_restante.segons} segon${cooldownData.tiempo_restant.segons !== 1 ? 's' : ''} abans de tornar a escanejar aquest producte`, 
          {
            duration: 5000,
            icon: '⏱️',
          }
        );
        
        // Añadir detalles al log de depuración
        setDebugInfo(prev => prev + '\nCooldown detectado para código: ' + decodedText);
      } else if (error.response) {
        // El servidor respondió con un código de estado diferente de 2xx
        const errorData = error.response.data;
        const errorMessage = errorData.error || errorData.message || 'Error al processar el codi';
        const errorDetail = errorData.detail || '';
        
        logError(`${errorMessage}${errorDetail ? ': ' + errorDetail : ''}`);
        
        // Si es un error específico (producto ya reciclado, no encontrado, etc.) mostrarlo de forma amigable
        if (errorData.error === 'Ja has reciclat aquest producte en les últimes 24 hores') {
          toast.error('Aquest producte ja ha estat reciclat avui. Prova demà o amb un altre producte.');
        } else if (errorData.error === 'Producte no trobat') {
          toast.error('No hem pogut identificar aquest producte. Prova amb un altre.');
        } else if (errorData.error === 'No s\'ha pogut determinar el material') {
          toast.error('No hem pogut identificar el material d\'aquest producte.');
        }
        
        // Añadir detalles adicionales al registro de depuración
        if (errorData.producto) {
          setDebugInfo(prev => prev + '\nDetalle del producto: ' + JSON.stringify(errorData.producto));
        }
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        logError('No s\'ha rebut resposta del servidor. Comprova la connexió a Internet.');
      } else {
        // Error desconocido
        logError('Error al processar el codi: ' + error.message);
      }
      
      // Añadir código de barras al log para depuración
      setDebugInfo(prev => prev + '\nCódigo escaneado: ' + decodedText);
      
      // Añadir botón para volver a intentar con el mismo código
      setResult({
        error: true,
        tipo: "error_generico",
        titulo: "Error de processament",
        mensaje: 'Error al processar el codi. Pots provar de nou o escanejar un altre producte.',
        barcode: decodedText
      });
    })
    .finally(() => {
      setLoading(false);
    });
};
  
  // Manejar el fracaso del escaneo con throttling para evitar spam de errores
  const onScanFailure = (error) => {
    // Incrementar contador de errores
    setErrorCount(prev => prev + 1);
    
    // Solo registrar errores ocasionalmente para evitar spam en la consola
    const now = Date.now();
    if (!errorThrottleRef.current && now - lastErrorTimeRef.current > 3000) {
      console.log('Code scan error:', error);
      lastErrorTimeRef.current = now;
      
      // Si hay muchos errores continuos, activar throttling
      if (errorCount > 50) {
        errorThrottleRef.current = true;
        console.log("Demasiados errores de escaneo, limitando los mensajes de error...");
        
        // Si hay excesivos errores, intentar reiniciar el escáner automáticamente
        if (errorCount > 200 && html5QrCode && html5QrCode.isScanning) {
          console.log("Reiniciando el escáner debido a exceso de errores...");
          stopScanning();
          setTimeout(() => {
            if (cameraId) startScanning();
          }, 1000);
          setErrorCount(0);
        }
      }
    }
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
  
  // Función para manejar simulación de escaneo (para pruebas en PC)
  const handleTestBarcode = (code) => {
    onScanSuccess(code);
  };

  // Añadir un array de productos verificados que funcionan
  const PRODUCTOS_VERIFICADOS = [
    { codigo: '8410188012096', nombre: 'Llauna Coca-Cola', material: 'Metal' },
    { codigo: '8410057320202', nombre: 'Cervesa Estrella Damm', material: 'Vidre' },
    { codigo: '8480000160164', nombre: 'Aigua Font Vella', material: 'Plàstic' },
    { codigo: '8414533043847', nombre: 'Diari El País', material: 'Paper' },
    // Añadir más productos verificados si es necesario
  ];

  const [codigoBarras, setCodigoBarras] = useState('');
  const [errorForm, setErrorForm] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedBag, setSelectedBag] = useState(null);
  const [addingToBag, setAddingToBag] = useState(false);
  const [creatingBag, setCreatingBag] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  
  // ref para el input de código de barras
  const inputRef = useRef(null);

  // Limpiar todo cuando se desmonta
  useEffect(() => {
    return () => {
      setError(null);
      setSuccess(null);
    };
  }, []);

  // Función para crear datos de producto de demostración según los productos de ejemplo
  const getDemoProductData = (codigoBarras) => {
    // Productos de demostración para visualización
    const demoProducts = {
      '8480000160164': {
        nombre_producto: 'Aigua Font Vella 1,5L',
        marca: 'Font Vella',
        material: { id: 1, nombre: 'plàstic' },
        imagen_url: 'https://prod-mercadona.imgix.net/images/6420bdab35c34e82c0bd76a1.jpg',
        puntos_obtenidos: 15,
        codigo_barras: '8480000160164',
      },
      '8414533043847': {
        nombre_producto: 'Diari El País',
        marca: 'El País',
        material: { id: 2, nombre: 'paper' },
        imagen_url: 'https://estaticos-cdn.prensaiberica.es/clip/9b41cf53-a9e8-450e-8d3e-5a5f8a5bf801_16-9-aspect-ratio_default_0.jpg',
        puntos_obtenidos: 20,
        codigo_barras: '8414533043847',
      },
      '8410057320202': {
        nombre_producto: 'Cervesa Estrella Damm 33cl',
        marca: 'Estrella Damm',
        material: { id: 3, nombre: 'vidre' },
        imagen_url: 'https://sgfm.elcorteingles.es/SGFM/dctm/MEDIA03/202204/04/00118602800916____3__600x600.jpg',
        puntos_obtenidos: 25,
        codigo_barras: '8410057320202',
      },
      '8410188012096': {
        nombre_producto: 'Llauna Coca-Cola 33cl',
        marca: 'Coca-Cola',
        material: { id: 4, nombre: 'metall' },
        imagen_url: 'https://sgfm.elcorteingles.es/SGFM/dctm/MEDIA03/202204/04/00120646800966____1__600x600.jpg',
        puntos_obtenidos: 18,
        codigo_barras: '8410188012096',
      }
    };
    
    return demoProducts[codigoBarras];
  };

  // Añadir esta función para crear bolsas virtuales de demostración
  const getDemoBolsas = (materialId) => {
    // Mapear IDs de material a sus nombres en catalán
    const materialNames = {
      1: 'plàstic',
      2: 'paper',
      3: 'vidre',
      4: 'metall',
      5: 'orgànic',
      6: 'resta'
    };
    
    // Crear bolsas dummy del tipo de material solicitado
    return [
      {
        id: 101,
        nombre: `Bossa de ${materialNames[materialId]} #1`,
        tipo_material: { id: materialId, nombre: materialNames[materialId] },
        fecha_creacion: new Date().toISOString(),
        puntos_totales: 45
      },
      {
        id: 102,
        nombre: `Bossa de ${materialNames[materialId]} #2`,
        tipo_material: { id: materialId, nombre: materialNames[materialId] },
        fecha_creacion: new Date(Date.now() - 86400000).toISOString(), // Ayer
        puntos_totales: 30
      }
    ];
  };

  // Modificar la función handleSubmit para simular un escaneo exitoso de productos de demostración
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Modo demo para los 4 productos de ejemplo
    const demoProduct = getDemoProductData(codigoBarras);
    
    if (demoProduct) {
      // Simular respuesta exitosa de API con datos de demo
      setTimeout(() => {
        setSuccess({
          product: demoProduct,
          points: demoProduct.puntos_obtenidos,
          totalPoints: 250 + demoProduct.puntos_obtenidos, // Puntos totales simulados
          material: demoProduct.material,
          availableBags: getDemoBolsas(demoProduct.material.id)
        });
        setLoading(false);
      }, 1000); // Simular retraso de red
      return;
    }
    
    try {
      // Llamada a la API regular para productos no demo
      const result = await escanearCodigo(codigoBarras);
      
      if (result.error) {
        setError({
          title: result.titulo || "Error",
          message: result.mensaje || "No se ha podido escanear el código",
          type: result.tipo || "error_general"
        });
      } else {
        setSuccess({
          product: result.producto,
          points: result.puntos_nuevos,
          totalPoints: result.puntos_totales,
          material: result.material,
          availableBags: result.bolsas_disponibles || []
        });
      }
    } catch (error) {
      setError({
        title: "Error al escanear",
        message: error.message || "Ha ocurrido un error al escanear el código",
        type: "error_general"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBag = async () => {
    if (!selectedBag) return;
    
    setAddingToBag(true);
    try {
      await agregarProductoABolsa(success.product.id, selectedBag);
      // Después de agregar, limpiar el estado para seguir escaneando
      setSuccess(null);
      setCodigoBarras("");
      setSelectedBag(null);
    } catch (error) {
      console.error("Error al añadir a la bolsa:", error);
    } finally {
      setAddingToBag(false);
    }
  };

  // Función para crear una nueva bolsa del tipo de material escaneado
  const handleCreateBag = async () => {
    if (!success || !success.material || !success.material.id) {
      return;
    }
    
    try {
      setCreatingBag(true);
      // Crear nueva bolsa del mismo tipo que el material escaneado
      const response = await crearBolsa(success.material.id);
      const newBagId = response.id;
      
      // Añadir el producto a la bolsa recién creada
      await agregarProductoABolsa(success.product.id, newBagId);
      
      // Actualizar state y cerrar el modal
      setSuccess(null);
      setCodigoBarras("");
      setSelectedBag(null);
    } catch (error) {
      console.error("Error al crear la bossa:", error);
    } finally {
      setCreatingBag(false);
    }
  };
  
  // Renderizar mensaje de error
  const renderError = () => {
    if (!error) return null;
    
    // Special handling for cooldown errors
    if (error.type === 'cooldown' && error.tiempo_restante) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaEye className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">{error.title}</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>{error.message}</p>
                <p className="mt-2 font-medium">
                  Temps restant: {error.tiempo_restant.minuts}m {error.tiempo_restant.segons}s
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Mensajes para material no determinado (con códigos de ejemplo)
    if (error.type === 'material_no_determinado') {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">{error.title}</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>{error.message}</p>
                
                {error.codigos_ejemplo && error.codigos_ejemplo.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium mb-2">Prova amb algun d'aquests codis:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {error.codigos_ejemplo.map((codigo, index) => (
                        <button
                          key={index}
                          className="flex justify-between items-center bg-white border border-yellow-200 rounded p-2 hover:bg-yellow-100 transition-colors"
                          onClick={() => {
                            setCodigoBarras(codigo.codigo);
                            setError(null);
                            if (inputRef.current) inputRef.current.focus();
                          }}
                        >
                          <span className="font-mono">{codigo.codigo}</span>
                          <span className="text-xs text-gray-600">{codigo.descripcion}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Error genérico (sin el fondo rojo)
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaExclamationTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error.title || "Error"}</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error.message || "Ha ocurrido un error."}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render success message with bag selection UI
  const renderSuccess = () => {
    if (!success) return null;
    
    // Si el producto ya se agregó a una bolsa, mostrar mensaje específico
    if (success.addedToBag && success.bagInfo) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-green-600 flex items-center">
              <FaCheck className="mr-2" /> Producte reciclat amb èxit
            </h3>
            <span className="text-green-600 font-bold">+{success.points} pts</span>
          </div>
          
          {/* Product details with improved material display */}
          <div className="mt-4 flex flex-col md:flex-row">
            {success.product.imagen_url ? (
              <img 
                src={success.product.imagen_url} 
                alt={success.product.nombre_producto} 
                className="w-24 h-24 object-contain rounded mr-4 mb-4 md:mb-0"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center mr-4 mb-4 md:mb-0">
                <FaBox className="text-gray-400 text-4xl" />
              </div>
            )}
            
            <div className="flex-1">
              {/* Larger product name */}
              <h4 className="font-bold text-xl text-gray-800">{success.product.nombre_producto}</h4>
              <p className="text-gray-600 text-sm">{success.product.marca}</p>
              
              {/* Material badge with more prominence */}
              <div className="mt-3">
                {getMaterialBadge(success.material.nombre)}
              </div>
            </div>
          </div>
          
          <div className="mt-6 border-t pt-4">
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <p className="flex items-center text-green-700">
                <FaCheck className="mr-2" /> 
                Producte afegit a la bossa: <span className="font-bold ml-1">{success.bagInfo.nombre || 'Bossa #' + success.bagInfo.id}</span>
              </p>
            </div>
            
            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  setSuccess(null);
                  setCodigoBarras("");
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Continuar reciclant
              </button>
              
              <Link 
                to="/virtualbags" 
                className="px-4 py-2 border border-green-500 text-green-500 rounded-lg hover:bg-green-50"
              >
                Veure les meves bosses
              </Link>
            </div>
          </div>
        </div>
      );
    }
    
    // Modal de selección de bolsa
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-green-600 flex items-center">
            <FaCheck className="mr-2" /> Producte reciclat amb èxit
          </h3>
          <span className="text-green-600 font-bold">+{success.points} pts</span>
        </div>
        
        {/* Product details with improved material display */}
        <div className="mt-4 flex flex-col md:flex-row">
          {success.product.imagen_url ? (
            <img 
              src={success.product.imagen_url} 
              alt={success.product.nombre_producto} 
              className="w-24 h-24 object-contain rounded mr-4 mb-4 md:mb-0"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center mr-4 mb-4 md:mb-0">
              <FaBox className="text-gray-400 text-4xl" />
            </div>
          )}
          
          <div className="flex-1">
            {/* Larger product name */}
            <h4 className="font-bold text-xl text-gray-800">{success.product.nombre_producto}</h4>
            <p className="text-gray-600 text-sm">{success.product.marca}</p>
            
            {/* Material badge with more prominence */}
            <div className="mt-3">
              {getMaterialBadge(success.material.nombre)}
            </div>
          </div>
        </div>
        
        {/* Available bags selection - Este es el bloque principal del modal */}
        <div className="mt-6 border-t pt-4">
          <h4 className="font-medium mb-3 text-gray-800">Vols afegir aquest producte a una bossa?</h4>
          
          {success.availableBags && success.availableBags.length > 0 ? (
            <>
              <p className="text-sm text-gray-600 mb-3">
                Tens {success.availableBags.length} {success.availableBags.length === 1 ? 'bossa disponible' : 'bosses disponibles'} per aquest material ({success.material.nombre}):
              </p>
              
              <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                {success.availableBags.map(bag => (
                  <button
                    key={bag.id}
                    onClick={() => setSelectedBag(bag.id)}
                    className={`w-full p-3 border rounded-lg flex justify-between items-center ${
                      selectedBag === bag.id 
                        ? 'bg-green-50 border-green-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <FaTrash className="text-gray-500 mr-2" />
                      <span>{bag.nombre || `Bossa #${bag.id}`}</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">{bag.puntos_totales} pts</span>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => {
                    setSuccess(null);
                    setCodigoBarras("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  No afegir a cap bossa
                </button>
                
                <button
                  onClick={handleAddToBag}
                  disabled={!selectedBag || addingToBag}
                  className={`px-4 py-2 rounded-lg text-white ${
                    selectedBag && !addingToBag
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {addingToBag ? (
                    <>
                      <Spinner size="sm" className="inline mr-2" />
                      Afegint...
                    </>
                  ) : (
                    'Afegir a la bossa'
                  )}
                </button>
              </div>
            </>
          ) : (
            // No bags available of this material type
            <div>
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700 flex items-center">
                  <FaExclamationTriangle className="text-yellow-500 mr-2" />
                  No tens cap bossa per materials de tipus <strong className="ml-1 mr-1">{success.material.nombre}</strong>
                </p>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between gap-3">
                <button
                  onClick={() => {
                    setSuccess(null);
                    setCodigoBarras("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Continuar sense afegir
                </button>
                
                <button 
                  onClick={handleCreateBag}
                  disabled={creatingBag}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center"
                >
                  {creatingBag ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Creant bossa...
                    </>
                  ) : (
                    <>
                      <FaPlus className="mr-2" /> Crear bossa de {success.material.nombre}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Función para generar un badge de material visualmente distintivo según el tipo
  const getMaterialBadge = (materialName) => {
    // Normalizar el nombre del material (a minúsculas y sin acentos)
    const normalizedName = materialName.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Configuración de colores por tipo de material
    const materialStyles = {
      'plastic': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', icon: <FaRecycle className="mr-2 text-yellow-600" /> },
      'plastico': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', icon: <FaRecycle className="mr-2 text-yellow-600" /> },
      'paper': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', icon: <FaRecycle className="mr-2 text-blue-600" /> },
      'papel': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', icon: <FaRecycle className="mr-2 text-blue-600" /> },
      'glass': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: <FaRecycle className="mr-2 text-green-600" /> },
      'vidre': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: <FaRecycle className="mr-2 text-green-600" /> },
      'vidrio': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: <FaRecycle className="mr-2 text-green-600" /> },
      'metal': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', icon: <FaRecycle className="mr-2 text-gray-600" /> },
      'metall': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', icon: <FaRecycle className="mr-2 text-gray-600" /> },
      'organic': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', icon: <FaRecycle className="mr-2 text-amber-600" /> },
      'resta': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', icon: <FaTrash className="mr-2 text-gray-600" /> },
    };
    
    // Buscar coincidencia en las claves
    let style = null;
    for (const key in materialStyles) {
      if (normalizedName.includes(key)) {
        style = materialStyles[key];
        break;
      }
    }
    
    // Si no hay coincidencia, usar un estilo por defecto
    if (!style) {
      style = { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', icon: <FaRecycle className="mr-2 text-purple-600" /> };
    }
    
    // Devolver el badge con el estilo correspondiente
    return (
      <div className={`${style.bg} ${style.text} ${style.border} border px-4 py-2 rounded-lg inline-flex items-center font-medium text-sm md:text-base`}>
        {style.icon}
        <span className="capitalize">{materialName}</span>
      </div>
    );
  };

  // Function to handle code scanning
  const handleScan = async (code) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await escanearCodigo(code, selectedBolsa);
      
      // On success
      setSuccess({
        title: 'Codi escanejat correctament',
        message: `S'ha identificat el producte "${response.data.nombre || code}"`,
        producto: response.data
      });
      
      // Call the callback if provided
      if (onScanComplete) {
        onScanComplete(response.data);
      }
      
    } catch (error) {
      console.error('Error escaneando código:', error);
      
      const errorData = error.response?.data;
      
      // Check for cooldown error and show toast instead of UI error
      if (errorData?.tipo === 'cooldown' && errorData?.tiempo_restante) {
        // Display cooldown error as toast in Catalan
        toast.error(
          `Has d'esperar ${errorData.tiempo_restante.minuts} minut${errorData.tiempo_restante.minuts !== 1 ? 's' : ''} i ${errorData.tiempo_restante.segons} segon${errorData.tiempo_restante.segons !== 1 ? 's' : ''} abans de tornar a escanejar aquest producte`, 
          {
            duration: 5000,
            icon: '⏱️',
          }
        );
      } else {
        // Set normal UI error for other errors
        setError({
          title: errorData?.titulo || 'Error en escanejar el codi',
          message: errorData?.mensaje || 'No s\'ha pogut processar el codi. Si us plau, prova-ho de nou o amb un altre producte.',
          type: errorData?.tipo || 'generic',
          codigos_ejemplo: errorData?.codigos_ejemplo
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="bg-white rounded-2xl shadow-xl max-w-2xl mx-auto overflow-hidden border border-gray-100">
  {/* Header con gradiente mejorado */}
  <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 p-6 text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-black bg-opacity-10"></div>
    <div className="relative z-10">
      <div className="flex items-center">
        <div className="bg-white bg-opacity-20 p-3 rounded-xl mr-4">
          <FaBarcode className="text-2xl" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Escaneja i recicla</h2>
          <p className="text-green-100 text-sm mt-1">Guanya punts reciclant productes</p>
        </div>
      </div>
    </div>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -ml-12 -mb-12"></div>
  </div>

  <div className="p-6">
    {/* Toggle más moderno */}
    <div className="mb-8 flex justify-center">
      <div className="bg-gray-100 rounded-2xl p-1.5 inline-flex shadow-inner">
        <button
          onClick={() => setManualMode(false)}
          className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center text-sm font-semibold ${
            !manualMode 
              ? 'bg-white text-green-600 shadow-md transform scale-105' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FaCamera className="mr-2" /> Càmera
        </button>
        <button
          onClick={() => setManualMode(true)}
          className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center text-sm font-semibold ${
            manualMode 
              ? 'bg-white text-green-600 shadow-md transform scale-105' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FaEdit className="mr-2" /> Manual
        </button>
      </div>
    </div>

    {/* Formulario input mejorado */}
    {manualMode && (
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={codigoBarras}
            onChange={(e) => setCodigoBarras(e.target.value)}
            className="w-full pl-4 pr-12 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-gray-50 focus:bg-white shadow-sm"
            placeholder="Introdueix un codi de barres..."
            ref={inputRef}
          />
          <button
            type="submit"
            disabled={loading || !codigoBarras.trim()}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-3 rounded-xl transition-all duration-300 ${
              loading || !codigoBarras.trim()
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-green-600 hover:bg-green-100 hover:text-green-700 active:scale-95 shadow-sm hover:shadow-md'
            }`}
          >
            {loading ? (
              <Spinner size="sm" />
            ) : (
              <FaSearch className="text-lg" />
            )}
          </button>
        </div>
      </form>
    )}

    {/* Mensajes de error y éxito */}
    {error && renderError()}
    {success && renderSuccess()}

    {/* Interfaz de cámara mejorada */}
    {!manualMode && (
      <div className="space-y-6">
        <div 
          id="scanner"
          ref={scannerContainerRef}
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden relative border-3 border-dashed border-gray-300 shadow-inner"
          style={{ minHeight: '320px', width: '100%' }}
        >
          {!scanning && !loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="bg-white p-6 rounded-2xl shadow-lg mb-4 inline-block">
                  <FaQrcode className="text-6xl text-green-500 mx-auto" />
                </div>
                <p className="text-lg font-semibold text-gray-600 mb-2">Prem per iniciar l'escaneig</p>
                <p className="text-sm text-gray-500">Apunta la càmera cap al codi de barres</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Controles de cámara más elegantes */}
        <div className="flex flex-wrap justify-center gap-4">
          {!scanning ? (
            <button
              onClick={startScanning}
              disabled={!cameraId || loading || !permissionGranted}
              className={`py-4 px-8 rounded-2xl font-semibold transition-all duration-300 flex items-center ${
                !cameraId || loading || !permissionGranted
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95'
              }`}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-3" />
                  Carregant...
                </>
              ) : (
                <>
                  <FaCamera className="mr-3 text-lg" /> Iniciar escaneig
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={stopScanning}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 font-semibold"
              >
                <FaPowerOff className="mr-2" /> Aturar
              </button>
              
              {availableCameras.length > 1 && (
                <button
                  onClick={switchCamera}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 font-semibold"
                >
                  <FaSync className="mr-2" /> Canviar
                </button>
              )}
            </>
          )}
        </div>

        {/* Indicador de estado mejorado */}
        {scanning && (
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-2xl border border-green-200 shadow-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              <span className="font-semibold">Escanejant...</span>
            </div>
          </div>
        )}
      </div>
    )}
  </div>

  {/* Footer mejorado */}
  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-t border-gray-200">
    <div className="text-center">
      <p className="text-sm text-gray-700 mb-3 font-medium">
        {manualMode 
          ? '💡 Introdueix manualment el codi de barres del producte'
          : '📱 Escaneja els codis de barres de productes per reciclar i guanyar punts'
        }
      </p>
      
      {/* Información de cámara mejorada */}
      {!manualMode && (
        <div className="text-xs text-gray-600 bg-white rounded-xl px-4 py-2 inline-block shadow-sm border">
          {availableCameras.length > 0 ? (
            <div className="flex items-center justify-center">
              <FaCamera className="mr-2 text-green-500" />
              <span className="font-medium">
                {availableCameras.find(c => c.id === cameraId)?.label || 'Cap càmera seleccionada'}
              </span>
              {availableCameras.length > 1 && (
                <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  {availableCameras.length} càmeres disponibles
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center text-amber-600">
              <FaExclamationTriangle className="mr-2" />
              <span className="font-medium">Detectant càmeres...</span>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
</div>
  );
};

export default BarcodeScanner;
