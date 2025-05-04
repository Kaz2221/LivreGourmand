// src/components/common/ConfirmDialog.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmation", 
  message = "Êtes-vous sûr de vouloir effectuer cette action ?",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  type = "warning" // warning, danger, info
}) => {
  if (!isOpen) return null;
  
  // Styles selon le type
  const getStyles = () => {
    switch(type) {
      case 'danger':
        return {
          icon: <FaExclamationTriangle className="text-red-500 text-3xl" />,
          confirmButton: "bg-red-600 hover:bg-red-700 text-white",
        };
      case 'info':
        return {
          icon: <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
          confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
        };
      case 'warning':
      default:
        return {
          icon: <FaExclamationTriangle className="text-amber-500 text-3xl" />,
          confirmButton: "bg-amber-600 hover:bg-amber-700 text-white",
        };
    }
  };
  
  const styles = getStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black"
            onClick={onClose}
          />
          
          {/* Modal - Fond blanc uniquement */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 overflow-hidden"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                {styles.icon}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              
              <div className="flex space-x-4 w-full justify-center">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                >
                  {cancelText}
                </button>
                
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`px-4 py-2 rounded-md transition-colors ${styles.confirmButton}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;