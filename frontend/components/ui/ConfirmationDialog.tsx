"use client";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-bg-primary border border-white/20 rounded-xl p-6 max-w-md w-full"
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle 
            className={isDestructive ? "text-red-500" : "text-yellow-500"} 
            size={24} 
          />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        
        <p className="text-text-secondary mb-6">
          {message}
        </p>

        {isDestructive && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
            <p className="text-red-500 text-sm font-medium text-center">
              This action cannot be undone
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={onConfirm}
            loading={isLoading}
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}