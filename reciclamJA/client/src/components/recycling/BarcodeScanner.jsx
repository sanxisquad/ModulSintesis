import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'react-hot-toast';
import { FaCamera, FaQrcode, FaSync, FaLightbulb, FaPowerOff, FaStar, FaBug, FaBarcode } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';
import { escanearCodigo, agregarProductoABolsa, crearBolsa } from '../../api/reciclajeApi';
import { Link } from 'react-router-dom';
import { Spinner } from '../common/Spinner';

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
      ]
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
      
      // Si falla, intentar sin formatsToSupport
      const simpleConfig = {
        fps: 5,
        qrbox: 250
      };
      
      toast.info('Intentant configuració bàsica...');
      
      scanner.start(
        camId,
        simpleConfig,
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
    
    // Usar el servicio API con manejo de errores mejorado
    escanearCodigo(decodedText)
      .then(response => {
        console.log("Respuesta de escaneo:", response);
        
        // Si la respuesta contiene un error controlado
        if (response && response.error) {
          setResult(response);
          
          // Si es un error de URL, mostrar mensaje más específico
          if (response.tipo === "url_error") {
            toast.error('No s\'ha pogut connectar amb el servidor. URL incorrecta.');
            console.error("Detalle de error de URL:", response.detalle);
            
            // Añadir información de depuración
            setDebugInfo(prev => prev + '\n' + new Date().toISOString() + ': Error de URL: ' + response.detalle);
          } else {
            // Otros errores
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
        
        // Si ya se agregó a una bolsa, mostrar mensaje específico
        if (response.agregado_a_bolsa && response.bolsa) {
          toast.success(`Producte afegit a la bossa: ${response.bolsa.nombre || 'Bossa #' + response.bolsa.id}`);
        } else {
          // Mensaje estándar de éxito
          toast.success(`¡Producte reciclat! +${response.puntos_nuevos} punts`);
        }
        
        // Llamar al callback para informar al componente padre
        if (onScanComplete) {
          onScanComplete(response);
        }
      })
      .catch(error => {
        console.error("Error completo:", error);
        
        // Solo manejar aquí errores no manejados por el servicio API
        if (error.response) {
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
        material: { id: 1, nombre: 'plastico' },
        imagen_url: 'https://prod-mercadona.imgix.net/images/6420bdab35c34e82c0bd76a1.jpg',
        puntos_obtenidos: 15,
        codigo_barras: '8480000160164',
      },
      '8414533043847': {
        nombre_producto: 'Diari El País',
        marca: 'El País',
        material: { id: 2, nombre: 'papel' },
        imagen_url: 'https://estaticos-cdn.prensaiberica.es/clip/9b41cf53-a9e8-450e-8d3e-5a5f8a5bf801_16-9-aspect-ratio_default_0.jpg',
        puntos_obtenidos: 20,
        codigo_barras: '8414533043847',
      },
      '8410057320202': {
        nombre_producto: 'Cervesa Estrella Damm 33cl',
        marca: 'Estrella Damm',
        material: { id: 3, nombre: 'vidrio' },
        imagen_url: 'https://sgfm.elcorteingles.es/SGFM/dctm/MEDIA03/202204/04/00118602800916____3__600x600.jpg',
        puntos_obtenidos: 25,
        codigo_barras: '8410057320202',
      },
      '8410188012096': {
        nombre_producto: 'Llauna Coca-Cola 33cl',
        marca: 'Coca-Cola',
        material: { id: 4, nombre: 'metal' },
        imagen_url: 'https://sgfm.elcorteingles.es/SGFM/dctm/MEDIA03/202204/04/00120646800966____1__600x600.jpg',
        puntos_obtenidos: 18,
        codigo_barras: '8410188012096',
      }
    };
    
    return demoProducts[codigoBarras];
  };

  // Añadir esta función para crear bolsas virtuales de demostración
  const getDemoBolsas = (materialId) => {
    // Mapear IDs de material a sus nombres en español
    const materialNames = {
      1: 'plastico',
      2: 'papel',
      3: 'vidrio',
      4: 'metal'
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
      console.error('Error al escanear código:', error);
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
      toast.success("Producte afegit a la bossa correctament");
      // Después de agregar, limpiar el estado para seguir escaneando
      setSuccess(null);
      setCodigoBarras("");
      setSelectedBag(null);
    } catch (error) {
      console.error("Error al añadir a la bolsa:", error);
      toast.error("No s'ha pogut afegir el producte a la bossa");
    } finally {
      setAddingToBag(false);
    }
  };

  // Función para crear una nueva bolsa del tipo de material escaneado
  const handleCreateBag = async () => {
    if (!success || !success.material || !success.material.id) {
      toast.error("No es pot crear una bossa sense material");
      return;
    }
    
    try {
      setCreatingBag(true);
      // Crear nueva bolsa del mismo tipo que el material escaneado
      const response = await crearBolsa(success.material.id);
      const newBagId = response.id;
      
      // Añadir el producto a la bolsa recién creada
      await agregarProductoABolsa(success.product.id, newBagId);
      
      toast.success("S'ha creat una nova bossa i s'ha afegit el producte");
      
      // Actualizar state y cerrar el modal
      setSuccess(null);
      setCodigoBarras("");
      setSelectedBag(null);
    } catch (error) {
      console.error("Error al crear la bossa:", error);
      toast.error("No s'ha pogut crear la bossa");
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
                  Temps restant: {error.tiempo_restant.minutos}m {error.tiempo_restant.segons}s
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
    
    // Error genérico
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaExclamationTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error.title}</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error.message}</p>
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
          
          {/* Product details */}
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
              <h4 className="font-medium text-lg">{success.product.nombre_producto}</h4>
              <p className="text-gray-600">{success.product.marca}</p>
              <div className="flex items-center mt-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {success.material.nombre}
                </span>
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
        
        {/* Product details */}
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
            <h4 className="font-medium text-lg">{success.product.nombre_producto}</h4>
            <p className="text-gray-600">{success.product.marca}</p>
            <div className="flex items-center mt-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {success.material.nombre}
              </span>
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center border-b pb-2">
        <FaBarcode className="mr-2 text-green-500" />
        Escaneja i recicla
      </h2>
      
      <p className="text-gray-600 mb-6">
        Escaneja el codi de barres d'un producte per reciclar-lo i guanyar punts.
      </p>
      
      {/* Formulario input - only show if not successful yet */}
      {!success && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex">
            <input 
              type="text" 
              value={codigoBarras}
              onChange={(e) => setCodigoBarras(e.target.value)}
              className="flex-1 px-4 py-2 text-lg border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Introdueix un codi de barres..."
              ref={inputRef}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 transition-colors flex items-center"
            >
              <FaCamera className="mr-2" /> Escanejar
            </button>
          </div>
        </form>
      )}
      
      {/* Mensaje de error */}
      {error && renderError()}
      
      {/* Resultado del escaneo */}
      {success && renderSuccess()}
      
      <div className="mt-4">
        <div 
          id="scanner" 
          ref={scannerContainerRef} 
          className="bg-gray-100 rounded-lg overflow-hidden relative"
          style={{ minHeight: '300px', width: '100%' }}
        ></div>
        
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
      
      {/* Sección para pruebas - Para usar en PC sin cámara */}
      <div className="p-4 bg-gray-100 border-t">
        <p className="text-center text-sm text-gray-600">
          Escaneja els codis de barres de productes per reciclar i guanya punts
        </p>
        
        {/* Cámara seleccionada (visible siempre para depuración) */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          Càmera: {availableCameras.find(c => c.id === cameraId)?.label || 'Cap càmera seleccionada'}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
