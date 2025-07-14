import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Excalidraw, convertToExcalidrawElements, exportToBlob } from '@excalidraw/excalidraw';
import { BsFillSendFill } from "react-icons/bs";
import { FaTrashAlt } from "react-icons/fa";
import { MdCancel, MdColorLens, MdCenterFocusStrong } from "react-icons/md";
import type { User } from '../../types';
import { notesAPI } from '../../services/api';
import { getStoredUser } from '../../utils/auth';
import { useCanvasShared } from '../../hooks/useCanvasShared';
import SendConfirmModal from '../shared/SendConfirmModal';

interface CanvasPageProps {
  user: User;
}

const CanvasPage = ({ user }: CanvasPageProps) => {
  const excalidrawRef = useRef<any>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 640, height: 400 });
  const [showColorModal, setShowColorModal] = useState(false);
  const [canvasColor, setCanvasColor] = useState('#ffffff');
  const [tempCanvasColor, setTempCanvasColor] = useState('#ffffff');

  // Shared functionality
  const {
    sending,
    setSending,
    message,
    setMessage,
    showConfirmModal,
    previewImageUrl,
    getRecipientUserId,
    getRecipientName,
    showConfirmPreview,
    handleCancelSend,
    cleanupPreview,
  } = useCanvasShared(user);

  // Function to measure canvas container dimensions
  const measureCanvasContainer = useCallback(() => {
    if (canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Only update if dimensions have actually changed
      if (width !== canvasDimensions.width || height !== canvasDimensions.height) {
        setCanvasDimensions({ width, height });
      }
    }
  }, [canvasDimensions.width, canvasDimensions.height]);

  // Effect to measure canvas dimensions on mount and resize
  useEffect(() => {
    measureCanvasContainer();

    const handleResize = () => {
      measureCanvasContainer();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [measureCanvasContainer]);

  // Create initial rectangle covering the entire canvas with current canvas color
  const initialElements = useMemo(() => {
    return convertToExcalidrawElements([
      {
        type: "rectangle",
        x: 0,
        y: 0,
        width: canvasDimensions.width,
        height: canvasDimensions.height,
        strokeColor: "transparent",
        backgroundColor: canvasColor,
        fillStyle: "solid",
        strokeWidth: 0,
        strokeStyle: "solid",
        roughness: 0,
        locked: true,
      }
    ]);
  }, [canvasDimensions.width, canvasDimensions.height, canvasColor]);

  // Initial data with the rectangle and black background
  const initialCanvasData = useMemo(() => ({
    elements: initialElements,
    appState: {
      viewBackgroundColor: "#000000",
      gridSize: undefined,
    }
  }), [initialElements]);

  // Effect to update the canvas when dimensions change
  useEffect(() => {
    if (excalidrawRef.current && initialElements.length > 0) {
      // Only update if the canvas is ready and we have elements
      excalidrawRef.current.updateScene({ elements: initialElements });
    }
  }, [initialElements]);

  const handleCanvasColorClick = () => {
    setTempCanvasColor(canvasColor);
    setShowColorModal(true);
  };

  const handleCanvasColorChange = () => {
    setCanvasColor(tempCanvasColor);
    setShowColorModal(false);
    
    // Update the canvas background color
    if (excalidrawRef.current) {
      const elements = excalidrawRef.current.getSceneElements();
      
      // Find the canvas background element (it should be locked and have the exact canvas dimensions)
      const canvasElementIndex = elements.findIndex((element: any) => 
        element.locked === true &&
        element.type === "rectangle" &&
        element.x === 0 &&
        element.y === 0 &&
        Math.abs(element.height - canvasDimensions.height) < 1 && 
        Math.abs(element.width - canvasDimensions.width) < 1
      );
      
      if (canvasElementIndex !== -1) {
        // Create a new elements array with the updated canvas background
        const updatedElements = [...elements];
        updatedElements[canvasElementIndex] = {
          ...elements[canvasElementIndex],
          backgroundColor: tempCanvasColor
        };
        
        excalidrawRef.current.updateScene({ elements: updatedElements });
      }
    }
  };

  const handleCanvasColorCancel = () => {
    setShowColorModal(false);
    setTempCanvasColor(canvasColor);
  };

  const exportCanvasToBlob = async () => {
    if (!excalidrawRef.current) {
      throw new Error('Canvas not ready');
    }

    const elements = excalidrawRef.current.getSceneElements();
    const appState = excalidrawRef.current.getAppState();
    
    // Get the element with the same height and width as the canvas
    const canvasElement = elements.find((element: any) => element.height === canvasDimensions.height && element.width === canvasDimensions.width);
    if (!canvasElement) {
      throw new Error('Please draw something before sending!');
    }

    // Scale to target dimensions (640x400)
    const targetWidth = 640;
    const targetHeight = 400;
    const scaleX = targetWidth / canvasDimensions.width;
    const scaleY = targetHeight / canvasDimensions.height;
    const scale = Math.min(scaleX, scaleY);

    const blob = await exportToBlob({
      elements: elements,
      appState: {
        ...appState,
        exportBackground: true,
        viewBackgroundColor: canvasColor, // Use current canvas color
      },
      files: excalidrawRef.current.getFiles(),
      mimeType: 'image/png',
      getDimensions: () => ({ 
        width: canvasDimensions.width * scaleX, 
        height: canvasDimensions.height * scaleY,
        scale: scale
      }),
      exportPadding: 0,
      exportingFrame: canvasElement,
    });

    return blob;
  };

  const handleSendNote = async () => {
    if (!excalidrawRef.current) {
      setMessage('❌ Canvas not ready. Please try again.');
      return;
    }

    setMessage('');

    try {
      // Export the canvas as PNG blob for preview
      const blob = await exportCanvasToBlob();

      // Create preview URL and show modal
      const imageUrl = URL.createObjectURL(blob);
      showConfirmPreview(imageUrl);
    } catch (error) {
      console.error('Error creating preview:', error);
      if (error instanceof Error) {
        setMessage(`❌ ${error.message}`);
      } else {
        setMessage('❌ Failed to create preview. Please try again.');
      }
    }
  };

  const handleConfirmSend = async () => {
    if (!excalidrawRef.current || !previewImageUrl) {
      return;
    }

    setSending(true);

    try {
      // Export the canvas for actual sending
      const blob = await exportCanvasToBlob();

      // Send the note via API
      const authData = getStoredUser();
      if (!authData) {
        setMessage('❌ Authentication expired. Please log in again.');
        return;
      }

      const response = await notesAPI.send(blob, user.id, getRecipientUserId(), authData.password);

      if (response.success) {
        setMessage(`✅ Love note sent to ${getRecipientName()}! 💕`);
        // Reset canvas to initial state with current canvas color
        if (excalidrawRef.current) {
          excalidrawRef.current.updateScene({ 
            elements: initialElements,
            appState: {
              viewBackgroundColor: "#000000",
              gridSize: undefined,
            }
          });
        }
      } else {
        setMessage(`❌ ${response.error || 'Failed to send note'}`);
      }
    } catch (error) {
      console.error('Error sending note:', error);
      if (error instanceof Error) {
        setMessage(`❌ ${error.message}`);
      } else {
        setMessage('❌ Failed to send note. Please try again.');
      }
    } finally {
      setSending(false);
      cleanupPreview();
    }
  };

  const handleClearCanvas = () => {
    if (excalidrawRef.current) {
      // Reset to initial state with current canvas color
      excalidrawRef.current.updateScene({ 
        elements: initialElements,
        appState: {
          viewBackgroundColor: "#000000",
          gridSize: undefined,
        }
      });
      setMessage('');
    }
  };

  const handleRecenterCanvas = () => {
    if (excalidrawRef.current) {
      // Recenter the canvas view
      excalidrawRef.current.updateScene({
        appState: {
          ...excalidrawRef.current.getAppState(),
          scrollX: 0,
          scrollY: 0,
          zoom: { value: 1 },
        }
      });

      setMessage('🎯 Canvas recentered');
    }
  };

  return (
    <div className="canvas-page">
        <div className="canvas-side">
          <div className="canvas-controls">
            <button
              onClick={handleCanvasColorClick}
              className="control-button btn-primary"
              disabled={sending}
            >
              <MdColorLens />
              Canvas Color
            </button>
            <button
              onClick={handleRecenterCanvas}
              className="control-button btn-primary"
              disabled={sending}
            >
              <MdCenterFocusStrong />
              Recenter Canvas
            </button>
          </div>
        </div>
        <div className="canvas-container" ref={canvasContainerRef}>
          <Excalidraw
            excalidrawAPI={(api) => (excalidrawRef.current = api)}
            initialData={initialCanvasData}
          />
        </div>
        <div className='canvas-side'>
            <div className="canvas-controls">
            <button
                onClick={handleClearCanvas}
                className="control-button clear-button btn-primary"
                disabled={sending}
            >
                <FaTrashAlt />
                Clear
            </button>
            <button
                onClick={handleSendNote}
                className="control-button send-button btn-primary"
                disabled={sending || showConfirmModal}
            >
                {sending ? (
                    <>
                        <BsFillSendFill />
                        Sending...
                    </>
                ) : (
                    <>
                        <BsFillSendFill />
                        Send
                    </>
                )}
            </button>
            </div>
            {message && (
              <div className="message-display">
                {message}
              </div>
            )}
      </div>

      {/* Canvas Color Modal */}
      {showColorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Canvas Color</h3>
              <p>Choose a background color for your canvas</p>
            </div>
            
            <div className="modal-preview">
              <div className="color-picker-container">
                <input
                  type="color"
                  value={tempCanvasColor}
                  onChange={(e) => setTempCanvasColor(e.target.value)}
                  className="color-picker"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={handleCanvasColorCancel}
                className="btn-primary"
              >
                <MdCancel />
                Cancel
              </button>
              <button 
                onClick={handleCanvasColorChange}
                className="btn-primary"
              >
                <MdColorLens />
                Apply Color
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Confirmation Modal */}
      <SendConfirmModal
        isOpen={showConfirmModal}
        recipientName={getRecipientName()}
        previewImageUrl={previewImageUrl}
        sending={sending}
        onConfirm={handleConfirmSend}
        onCancel={handleCancelSend}
      />
    </div>
  );
};

export default CanvasPage; 