import { useState } from 'react';
import type { User } from '../types';

export const useCanvasShared = (user: User) => {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const getRecipientUserId = () => {
    return user.id === 'user_kevin' ? 'user_nicole' : 'user_kevin';
  };

  const getRecipientName = () => {
    return user.username === 'kevin' ? 'Nicole' : 'Kevin';
  };

  const showConfirmPreview = (imageUrl: string) => {
    setPreviewImageUrl(imageUrl);
    setShowConfirmModal(true);
  };

  const handleCancelSend = () => {
    setShowConfirmModal(false);
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
      setPreviewImageUrl(null);
    }
  };

  const cleanupPreview = () => {
    setShowConfirmModal(false);
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
      setPreviewImageUrl(null);
    }
  };

  return {
    sending,
    setSending,
    message,
    setMessage,
    showConfirmModal,
    setShowConfirmModal,
    previewImageUrl,
    setPreviewImageUrl,
    getRecipientUserId,
    getRecipientName,
    showConfirmPreview,
    handleCancelSend,
    cleanupPreview,
  };
}; 