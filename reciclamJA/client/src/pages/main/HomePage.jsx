import { useState, useEffect } from 'react';
import { Footer } from "../../components/layout/Footer";
import { HomeMapView } from "../../components/MapView/HomeMapContainer";
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { 
  getAllContenedors, 
  getAllZones, 
  getAllPublicContenedors, 
  getAllPublicZones 
} from '../../api/zr.api.js';
import { Link } from 'react-router-dom';

export const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { canEditZR } = usePermissions();

  const [contenedores, setContenedores] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Determine which API to use
        const shouldUsePrivateAPI = isAuthenticated && canEditZR;
        
        const [contenedoresRes, zonasRes] = await Promise.all([
          shouldUsePrivateAPI ? getAllContenedors() : getAllPublicContenedors(),
          shouldUsePrivateAPI ? getAllZones() : getAllPublicZones()
        ]);
        
        setContenedores(contenedoresRes.data);
        setZonas(zonasRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err);
        
        // Fallback to public API if private fails
        if (isAuthenticated) {
          try {
            const [publicContenedores, publicZonas] = await Promise.all([
              getAllPublicContenedors(),
              getAllPublicZones()
            ]);
            setContenedores(publicContenedores.data);
            setZonas(publicZonas.data);
          } catch (fallbackErr) {
            console.error('Fallback failed:', fallbackErr);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, canEditZR]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <main className="flex-grow">
        {/* App Introduction Section */}
        <section id="intro" className="w-full bg-green-50 py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-green-600 mb-6">ReciclamJA</h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
              La teva aplicació per gestionar el reciclatge de manera eficient i sostenible.
              Ajudem a cuidar el medi ambient fent més fàcil la gestió dels teus residus.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#mapa" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Troba contenidors
              </a>
              <a href="#reciclar" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Com reciclar?
              </a>
            </div>
          </div>
        </section>
        
        {/* How to Recycle Section */}
        <section id="reciclar" className="w-full py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">Com reciclar correctament</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Contenidor Blau - Paper */}
              <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-blue-700">Contenidor Blau - Paper i Cartró</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Diaris i revistes</li>
                  <li>• Caixes de cartró (plegades)</li>
                  <li>• Sobres i fulls de paper</li>
                  <li>• Bosses de paper</li>
                  <li>• Oueres de cartró</li>
                </ul>
              </div>
              
              {/* Contenidor Groc - Envasos */}
              <div className="bg-yellow-50 p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-yellow-700">Contenidor Groc - Plàstic i Envasos</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Ampolles de plàstic</li>
                  <li>• Envasos metàl·lics (llaunes)</li>
                  <li>• Brics</li>
                  <li>• Safates i film de plàstic</li>
                  <li>• Tapes i taps de plàstic</li>
                </ul>
              </div>
              
              {/* Contenidor Verd - Vidre */}
              <div className="bg-green-50 p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-green-700">Contenidor Verd - Vidre</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Ampolles de vidre</li>
                  <li>• Pots de vidre</li>
                  <li>• Flascons de vidre</li>
                  <li>• Tarros de vidre</li>
                  <li>• Vidre trencat</li>
                </ul>
              </div>
              
              {/* Contenidor Marró - Orgànic */}
              <div className="bg-amber-50 p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-700 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-amber-700">Contenidor Marró - Orgànic</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Restes de menjar</li>
                  <li>• Restes de cafè i te</li>
                  <li>• Petites restes de jardineria</li>
                  <li>• Paper de cuina brut</li>
                  <li>• Taps de suro</li>
                </ul>
              </div>
              
              {/* Contenidor Gris - Rebuig */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-gray-700">Contenidor Gris - Rebuig</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Articles d'higiene personal</li>
                  <li>• Ceràmica trencada</li>
                  <li>• Pols d'escombrar</li>
                  <li>• Bolquers</li>
                  <li>• Materials que no es poden reciclar</li>
                </ul>
              </div>
              
              {/* Punt Verd - Especials */}
              <div className="bg-indigo-50 p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-indigo-700">Punt Verd - Residus Especials</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Piles i bateries</li>
                  <li>• Aparells electrònics</li>
                  <li>• Pintures i dissolvents</li>
                  <li>• Bombetes i fluorescents</li>
                  <li>• Medicaments caducats</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        {/* NEW SECTION: How it Works - Steps to earn points */}
        <section id="com-funciona" className="w-full py-16 bg-green-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">Com guanyar punts reciclant</h2>
            <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
              El nostre sistema de recompenses t'anima a reciclar més i millor. Segueix aquests passos per guanyar punts!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white p-6 rounded-lg shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xl font-bold w-12 h-12 flex items-center justify-center rounded-bl-lg">
                  1
                </div>
                <div className="flex flex-col items-center text-center pt-4">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">Escaneja Productes</h3>
                  <p className="text-gray-600">
                    Utilitza l'escàner de l'aplicació per identificar els productes que vulguis reciclar i afegeix-los a una bossa virtual.
                  </p>
                  <Link to="/escaneig" className="mt-4 inline-block text-green-600 hover:text-green-700 font-medium">
                    Anar a escanejar →
                  </Link>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="bg-white p-6 rounded-lg shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xl font-bold w-12 h-12 flex items-center justify-center rounded-bl-lg">
                  2
                </div>
                <div className="flex flex-col items-center text-center pt-4">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">Recicla les Bosses</h3>
                  <p className="text-gray-600">
                    Des del teu perfil, utilitza la secció "Bosses Virtuals" per reciclar les bosses en els contenidors adequats i guanyar punts.
                  </p>
                  <Link to="/virtualbags" className="mt-4 inline-block text-green-600 hover:text-green-700 font-medium">
                    Les meves bosses →
                  </Link>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="bg-white p-6 rounded-lg shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xl font-bold w-12 h-12 flex items-center justify-center rounded-bl-lg">
                  3
                </div>
                <div className="flex flex-col items-center text-center pt-4">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">Bescanvia Premis</h3>
                  <p className="text-gray-600">
                    Acumula punts i bescanvia'ls per recompenses exclusives en el nostre catàleg de premis sostenibles.
                  </p>
                  <Link to="/profile" className="mt-4 inline-block text-green-600 hover:text-green-700 font-medium">
                    Els meus punts →
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Link to="/escaneig" className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-green-500/30">
                Comença a reciclar ara
              </Link>
            </div>
          </div>
        </section>
        
        {/* Map Section - Updated to use the new HomeMapView component */}
        <section id="mapa" className="w-full py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">Troba contenidors a prop teu</h2>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <p className="text-red-700">
                  Hi ha hagut un error carregant les dades. Estàs veient informació pública.
                </p>
              </div>
            )}
            
            {!isAuthenticated && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-blue-700">
                  Estàs veient la versió pública de ReciclamJa. 
                  <a href="/login" className="ml-2 font-medium underline">Inicia sessió</a> per accedir a més funcionalitats i continguts.
                </p>
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm">
                <div className="text-center p-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Carregant dades...</p>
                </div>
              </div>
            ) : (
              <HomeMapView
                className="w-full h-96 mt-6 rounded-lg shadow-lg"
                contenedores={contenedores}
                zonas={zonas}
              />
            )}
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};