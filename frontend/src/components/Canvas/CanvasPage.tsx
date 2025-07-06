import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Excalidraw, convertToExcalidrawElements, exportToBlob } from '@excalidraw/excalidraw';
import { BsFillSendFill } from "react-icons/bs";
import { FaTrashAlt } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import type { User } from '../../types';
import { notesAPI } from '../../services/api';

interface CanvasPageProps {
  user: User;
}

const CanvasPage = ({ user }: CanvasPageProps) => {
  const excalidrawRef = useRef<any>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 640, height: 400 });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const getRecipientUserId = () => {
    return user.id === 'user_joe' ? 'user_jane' : 'user_joe';
  };

  const getRecipientName = () => {
    return user.username === 'joe' ? 'Jane' : 'Joe';
  };

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

  // Create initial white rectangle covering the entire canvas
  const initialElements = useMemo(() => {
    return convertToExcalidrawElements([
      {
        type: "rectangle",
        x: 0,
        y: 0,
        width: canvasDimensions.width,
        height: canvasDimensions.height,
        strokeColor: "transparent",
        backgroundColor: "#ffffff",
        fillStyle: "solid",
        strokeWidth: 0,
        strokeStyle: "solid",
        roughness: 0,
      }
    ]);
  }, [canvasDimensions.width, canvasDimensions.height]);

  // Initial data with the white rectangle and black background
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

  const handleSendNote = async () => {
    if (!excalidrawRef.current) {
      setMessage('❌ Canvas not ready. Please try again.');
      return;
    }

    setMessage('');

    try {
      // Export the canvas as PNG blob for preview
      const elements = excalidrawRef.current.getSceneElements();
      const appState = excalidrawRef.current.getAppState();
      
      if (!elements || elements.length === 0) {
        setMessage('❌ Please draw something before sending!');
        return;
      }

      // Calculate the bounds of the white rectangle (drawing area)
      const drawingBounds = {
        x: 0,
        y: 0,
        width: canvasDimensions.width,
        height: canvasDimensions.height
      };

      // Filter elements to only include those within the drawing bounds
      const filteredElements = elements.filter((element: any) => {
        return true;
        // // Keep the white background rectangle
        // if (element.backgroundColor === "#ffffff" && element.width >= canvasDimensions.width * 0.9) {
        //   return true;
        // }
        
        // // Check if element is within drawing bounds
        // const elementBounds = {
        //   x1: element.x,
        //   y1: element.y,
        //   x2: element.x + element.width,
        //   y2: element.y + element.height
        // };
        
        // return (
        //   elementBounds.x1 >= drawingBounds.x &&
        //   elementBounds.y1 >= drawingBounds.y &&
        //   elementBounds.x2 <= drawingBounds.x + drawingBounds.width &&
        //   elementBounds.y2 <= drawingBounds.y + drawingBounds.height
        // );
      });

      // Scale to target dimensions (640x400)
      const targetWidth = 640;
      const targetHeight = 400;
      const scaleX = targetWidth / canvasDimensions.width;
      const scaleY = targetHeight / canvasDimensions.height;
      const scale = Math.min(scaleX, scaleY);

      const blob = await exportToBlob({
        elements: filteredElements,
        appState: {
          ...appState,
          exportBackground: true,
          viewBackgroundColor: "#ffffff", // Export with white background
        },
        files: excalidrawRef.current.getFiles(),
        mimeType: 'image/png',
        getDimensions: () => ({ 
          width: canvasDimensions.width * scaleX, 
          height: canvasDimensions.height * scaleY,
          scale: scale
        }),
      });

      // Create preview URL and show modal
      const imageUrl = URL.createObjectURL(blob);
      setPreviewImageUrl(imageUrl);
      setShowConfirmModal(true);
    } catch (error) {
      console.error('Error creating preview:', error);
      setMessage('❌ Failed to create preview. Please try again.');
    }
  };

  const handleConfirmSend = async () => {
    if (!excalidrawRef.current || !previewImageUrl) {
      return;
    }

    setSending(true);
    setShowConfirmModal(false);

    try {
      // Export the canvas again for actual sending
      const elements = excalidrawRef.current.getSceneElements();
      const appState = excalidrawRef.current.getAppState();
      
      // Calculate the bounds of the white rectangle (drawing area)
      const drawingBounds = {
        x: 0,
        y: 0,
        width: canvasDimensions.width,
        height: canvasDimensions.height
      };

      // Filter elements to only include those within the drawing bounds
      const filteredElements = elements.filter((element: any) => {
        // Keep the white background rectangle
        if (element.backgroundColor === "#ffffff" && element.width >= canvasDimensions.width * 0.9) {
          return true;
        }
        
        // Check if element is within drawing bounds
        const elementBounds = {
          x1: element.x,
          y1: element.y,
          x2: element.x + element.width,
          y2: element.y + element.height
        };
        
        return (
          elementBounds.x1 >= drawingBounds.x &&
          elementBounds.y1 >= drawingBounds.y &&
          elementBounds.x2 <= drawingBounds.x + drawingBounds.width &&
          elementBounds.y2 <= drawingBounds.y + drawingBounds.height
        );
      });

      // Scale to exact target dimensions (640x400)
      const targetWidth = 640;
      const targetHeight = 400;

      const blob = await exportToBlob({
        elements: filteredElements,
        appState: {
          ...appState,
          exportBackground: true,
          viewBackgroundColor: "#ffffff", // Export with white background
        },
        files: excalidrawRef.current.getFiles(),
        mimeType: 'image/png',
        getDimensions: () => ({ 
          width: targetWidth, 
          height: targetHeight,
          scale: 1
        }),
      });

      // Send the note via API
      const response = await notesAPI.send(blob, user.id, getRecipientUserId());

      if (response.success) {
        setMessage(`✅ Love note sent to ${getRecipientName()}! 💕`);
        // Reset canvas to initial state with white rectangle
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
      setMessage('❌ Failed to send note. Please try again.');
    } finally {
      setSending(false);
      // Clean up preview URL
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
        setPreviewImageUrl(null);
      }
    }
  };

  const handleCancelSend = () => {
    setShowConfirmModal(false);
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
      setPreviewImageUrl(null);
    }
  };

  const handleClearCanvas = () => {
    if (excalidrawRef.current) {
      // Reset to initial state with white rectangle
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

  return (
    <div className="canvas-page">
        <div className="canvas-side">
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

      {/* Send Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Send</h3>
              <p>Send this love note to {getRecipientName()}?</p>
            </div>
            
            <div className="modal-preview">
              {previewImageUrl && (
                <img 
                  src={previewImageUrl} 
                  alt="Canvas preview" 
                  className="preview-image"
                />
              )}
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={handleCancelSend}
                className="btn-primary"
                disabled={sending}
              >
                <MdCancel />
                Cancel
              </button>
              <button 
                onClick={handleConfirmSend}
                className="btn-primary"
                disabled={sending}
              >
                {sending ? (
                  <>
                    <BsFillSendFill />
                    Sending...
                  </>
                ) : (
                  <>
                    <BsFillSendFill />
                    Send Love Note
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasPage; 