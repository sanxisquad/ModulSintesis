import React from 'react';
import { Link } from 'react-router-dom';
import { FaRecycle, FaMapMarkerAlt, FaEnvelope, FaPhone, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-gray-800 text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1 - About */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <FaRecycle className="text-green-400 mr-2" />
              ReciclamJA
            </h3>
            <p className="text-gray-400 mb-4">
              La teva aplicació per gestionar el reciclatge de manera eficient i sostenible.
              Ajudem a cuidar el medi ambient fent més fàcil la gestió dels teus residus.
            </p>
          </div>
          
          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enllaços ràpids</h3>
            <ul className="space-y-2">
              <li>
                <a href="/#intro" className="text-gray-400 hover:text-green-400 transition-colors flex items-center">
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-2"></span>
                  Inici
                </a>
              </li>
              <li>
                <a href="/#reciclar" className="text-gray-400 hover:text-green-400 transition-colors flex items-center">
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-2"></span>
                  Com Reciclar
                </a>
              </li>
              <li>
                <a href="/#mapa" className="text-gray-400 hover:text-green-400 transition-colors flex items-center">
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-2"></span>
                  Mapa de Contenidors
                </a>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-green-400 transition-colors flex items-center">
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-2"></span>
                  Iniciar Sessió
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3 - Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacte</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400">
                <FaMapMarkerAlt className="mr-2 text-green-400" />
                <span>Carrer del Reciclatge, 123, Barcelona</span>
              </li>
              <li className="flex items-center text-gray-400">
                <FaEnvelope className="mr-2 text-green-400" />
                <a href="mailto:info@reciclamja.com" className="hover:text-green-400 transition-colors">
                  info@reciclamja.com
                </a>
              </li>
              <li className="flex items-center text-gray-400">
                <FaPhone className="mr-2 text-green-400" />
                <a href="tel:+34932123456" className="hover:text-green-400 transition-colors">
                  +34 932 12 34 56
                </a>
              </li>
            </ul>
          </div>
          
          {/* Column 4 - Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Segueix-nos</h3>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-green-600 transition-colors">
                <FaFacebook className="text-white" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-green-600 transition-colors">
                <FaTwitter className="text-white" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-green-600 transition-colors">
                <FaInstagram className="text-white" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-green-600 transition-colors">
                <FaLinkedin className="text-white" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom - Copyright */}
        <div className="pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>© {currentYear} ReciclamJA - Tots els drets reservats</p>
          <p className="mt-2">Fomentem el reciclatge per a un món més sostenible</p>
        </div>
      </div>
    </footer>
  );
}
