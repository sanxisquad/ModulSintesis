import React, { useState, useRef, useEffect } from 'react';
import { 
  FaTimes, 
  FaRecycle, 
  FaWineBottle, 
  FaNewspaper, 
  FaApple, 
  FaTrash,
  FaInfoCircle
} from 'react-icons/fa';

export const RecyclingGuideModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('blue');
  const tabsRef = useRef(null);

  // Automatically scroll to active tab when it changes
  useEffect(() => {
    if (tabsRef.current && activeTab) {
      const activeTabElement = tabsRef.current.querySelector(`[data-tab="${activeTab}"]`);
      if (activeTabElement) {
        // Calculate scroll position to center the active tab
        const tabsContainer = tabsRef.current;
        const scrollLeft = activeTabElement.offsetLeft - (tabsContainer.clientWidth / 2) + (activeTabElement.clientWidth / 2);
        tabsContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const containerTypes = [
    { 
      id: 'blue', 
      name: 'Contenidor Blau', 
      color: 'bg-blue-500', 
      textColor: 'text-blue-600',
      icon: <FaNewspaper />,
      title: 'Paper i Cartró',
      description: 'Per a materials de paper i cartró que es poden reciclar.',
      items: [
        'Diaris i revistes',
        'Llibres i quaderns',
        'Caixes de cartró plegades',
        'Sobres i paper d\'oficina',
        'Capses de cereals',
        'Tubs de paper higiènic i de cuina',
        'Fullets publicitaris',
        'Embalatges de cartró',
        'Paper de regal (sense plàstic)',
        'Cartolines',
        'Bosses de paper',
        'Caixes de sabates',
        'Carpetes de paper',
        'Targetes no plastificades',
        'Caixes d\'ous de cartró',
        'Paper de diari',
        'Catàlegs',
        'Guies telefòniques'
      ]
    },
    { 
      id: 'yellow', 
      name: 'Contenidor Groc', 
      color: 'bg-yellow-500', 
      textColor: 'text-yellow-600',
      icon: <FaRecycle />,
      title: 'Envasos i Plàstics',
      description: 'Per a envasos lleugers, plàstics i metalls.',
      items: [
        'Ampolles de plàstic',
        'Llaunes de begudes',
        'Tetra briks',
        'Taps de plàstic',
        'Safates de porexpan',
        'Embolcalls de plàstic',
        'Bosses de plàstic',
        'Paper d\'alumini',
        'Aerosols buits',
        'Tuppers trencats',
        'Envasos de iogurt',
        'Envasos de productes de neteja',
        'Embalatges de plàstic bombolla',
        'Xapes de les ampolles',
        'Llaunes de conserves',
        'Llaunes de menjar per a mascotes',
        'Safates d\'alumini',
        'Tubs de pasta de dents',
        'Bosses de snacks i patates fregides',
        'Malles de fruita i verdura',
        'Perxes i penjadors de plàstic'
      ]
    },
    { 
      id: 'green', 
      name: 'Contenidor Verd', 
      color: 'bg-green-500', 
      textColor: 'text-green-600',
      icon: <FaWineBottle />,
      title: 'Vidre',
      description: 'Per a envasos i productes de vidre.',
      items: [
        'Ampolles de vidre',
        'Pots de conserves de vidre',
        'Flascons de perfum de vidre',
        'Pots de cosmètics de vidre',
        'Ampolles de vi i licors',
        'Gerres de vidre',
        'Pots de melmelades i salses',
        'Frascos de medicines de vidre',
        'Ampolles d\'oli',
        'Taps de vidre',
        'Vasos i copes (sense cristal)',
        'Ampolles de sucs',
        'Ampolles de cava i xampany',
        'Pots de condiments de vidre'
      ]
    },
    { 
      id: 'brown', 
      name: 'Contenidor Marró', 
      color: 'bg-amber-800', 
      textColor: 'text-amber-800',
      icon: <FaApple />,
      title: 'Orgànic',
      description: 'Per a residus orgànics i biodegradables.',
      items: [
        'Restes de fruita i verdura',
        'Restes de carn i peix',
        'Closques d\'ou',
        'Restes de pa i aliments',
        'Pòsits de cafè i infusions',
        'Taps de suro',
        'Tovallons de paper usats',
        'Paper de cuina brut',
        'Serradures',
        'Flors i plantes petites',
        'Restes de jardineria petites',
        'Escuradents i llumins',
        'Os petits',
        'Fruits secs i petxines de marisc',
        'Restes de menjar cuinat',
        'Paper de forn usat'
      ]
    },
    { 
      id: 'gray', 
      name: 'Contenidor Gris', 
      color: 'bg-gray-500', 
      textColor: 'text-gray-600',
      icon: <FaTrash />,
      title: 'Rebuig',
      description: 'Per a residus que no es poden reciclar en altres contenidors.',
      items: [
        'Bolquers',
        'Compreses i tampons',
        'Burilles de cigarrets',
        'Pols d\'escombrar',
        'Tiretes i esparadraps',
        'Excrements d\'animals',
        'Ceràmica i porcellana trencada',
        'CD i DVD trencats',
        'Bolígrafs i llapis gastats',
        'Paper brut no orgànic',
        'Articles d\'higiene personal',
        'Maquinetes d\'afaitar',
        'Raspalls de dents',
        'Pinta i raspalls',
        'Articles de làtex',
        'Xiclets',
        'Cristall i miralls trencats',
        'Cendra',
        'Fotografies'
      ]
    },
    { 
      id: 'special', 
      name: 'Punt Verd / Deixalleria', 
      color: 'bg-purple-500', 
      textColor: 'text-purple-600',
      icon: <FaInfoCircle />,
      title: 'Residus Especials',
      description: 'Per a residus que necessiten un tractament especial.',
      items: [
        'Piles i bateries',
        'Aparells electrònics',
        'Bombetes i fluorescents',
        'Olis usats',
        'Pintures i dissolvents',
        'Radiografies',
        'Medicaments caducats (també a farmàcies)',
        'Cartutxos de tinta i tòners',
        'Mòbils i carregadors',
        'Joguines elèctriques',
        'Electrodomèstics',
        'Materials de construcció',
        'Roba i calçat (també a contenidors específics)',
        'Mobles i estris voluminosos',
        'Materials perillosos',
        'Càpsules de cafè (també en punts de recollida específics)',
        'Bateries de cotxes',
        'Pneumàtics',
        'Ferralla i metalls grans'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-70 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-3 sm:p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
            <FaRecycle className="text-green-500 mr-2" /> 
            <span className="truncate">Guia de Reciclatge</span>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Tancar"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Tabs - Make horizontally scrollable */}
        <div className="border-b border-gray-200">
          <div 
            ref={tabsRef} 
            className="flex overflow-x-auto scrollbar-none py-1 px-1" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {containerTypes.map(container => (
              <button
                key={container.id}
                data-tab={container.id}
                className={`px-2 sm:px-4 py-2 sm:py-3 flex items-center whitespace-nowrap text-xs sm:text-sm font-medium border-b-2 flex-shrink-0 transition-colors ${
                  activeTab === container.id 
                    ? `border-${container.id === 'brown' ? 'amber-800' : container.id}-500 ${container.textColor}` 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(container.id)}
              >
                <span className={`rounded-full p-1 mr-1 sm:mr-2 ${container.color} text-white`}>
                  {container.icon}
                </span>
                <span className="truncate max-w-[80px] sm:max-w-none">{container.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {containerTypes.map(container => (
            <div 
              key={container.id}
              className={activeTab === container.id ? 'block' : 'hidden'}
            >
              <div className={`p-3 sm:p-4 rounded-lg bg-${container.id === 'brown' ? 'amber' : container.id}-50 mb-4 sm:mb-6`}>
                <h3 className={`text-lg sm:text-xl font-bold ${container.textColor} mb-1 sm:mb-2`}>
                  {container.title}
                </h3>
                <p className="text-gray-700 text-sm sm:text-base">{container.description}</p>
              </div>
              
              <h4 className="font-medium text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">
                Què s'ha de llençar al contenidor {container.name.split(' ')[1].toLowerCase()}?
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 sm:gap-2">
                {container.items.map((item, index) => (
                  <div key={index} className="flex items-center p-1 sm:p-2 rounded hover:bg-gray-50">
                    <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${container.color} mr-2`}></span>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              
              {container.id === 'special' && (
                <div className="mt-4 sm:mt-6 bg-yellow-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-amber-800 font-medium text-sm">Recordeu que aquests residus s'han de portar a un punt verd o deixalleria. Mai s'han de llençar als contenidors convencionals.</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-200 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Recicla correctament per contribuir a la sostenibilitat del nostre entorn.
          </p>
        </div>
      </div>
    </div>
  );
};
