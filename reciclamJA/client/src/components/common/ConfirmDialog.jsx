import React, { useState, createContext, useContext } from 'react';

// Contexto para el diálogo
const ConfirmDialogContext = createContext();

export const ConfirmDialogProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState({});

  const confirm = (config) => {
    setConfig({
      title: "Confirmar acción",
      confirmText: "Aceptar",
      cancelText: "Cancelar",
      showCloseButton: true,
      ...config,
    });
    setOpen(true);

    return new Promise((resolve) => {
      setConfig((prev) => ({ ...prev, resolve }));
    });
  };

  const handleClose = (result) => {
    setOpen(false);
    config.resolve?.(result);
  };

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            {/* Título del diálogo */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-lg font-semibold">{config.title}</h2>
              {config.showCloseButton && (
                <button
                  onClick={() => handleClose(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Contenido del diálogo */}
            <div className="p-4">
              <p className="text-gray-700">{config.message}</p>
              {config.detail && (
                <p className="mt-2 text-sm text-gray-500 whitespace-pre-line">
                  {config.detail}
                </p>
              )}
            </div>

            {/* Acciones del diálogo */}
            <div className="flex justify-end gap-2 px-4 py-3 border-t">
              <button
                onClick={() => handleClose(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                {config.cancelText}
              </button>
              <button
                onClick={() => handleClose(true)}
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                {config.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
};

// Hook personalizado para usar el diálogo
export const useConfirm = () => useContext(ConfirmDialogContext);

// Componente de diálogo de confirmación
export const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancel·lar" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="p-4 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <div className="mt-2">
            {/* Ahora el mensaje puede ser un string o un elemento JSX */}
            {typeof message === 'string' ? (
              <p className="text-sm text-gray-500">{message}</p>
            ) : (
              message
            )}
          </div>
          
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};