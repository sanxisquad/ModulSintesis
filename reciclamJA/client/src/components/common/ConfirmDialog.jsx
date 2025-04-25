import React, { useState, createContext, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

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
      ...config
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
      
      <Dialog 
        open={open} 
        onClose={() => handleClose(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {config.icon || <WarningAmberRoundedIcon color="warning" />}
          <span style={{ flex: 1 }}>{config.title}</span>
          {config.showCloseButton && (
            <IconButton onClick={() => handleClose(false)}>
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        
        <DialogContent dividers sx={{ pt: 2 }}>
          <Typography variant="body1">{config.message}</Typography>
          {config.detail && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mt: 2, whiteSpace: 'pre-line' }}
            >
              {config.detail}
            </Typography>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => handleClose(false)}
            color="inherit"
            sx={{ mr: 1 }}
          >
            {config.cancelText}
          </Button>
          <Button 
            onClick={() => handleClose(true)} 
            color="primary"
            variant="contained"
            autoFocus
          >
            {config.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
};

// Hook personalizado para usar el diálogo
export const useConfirm = () => useContext(ConfirmDialogContext);