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