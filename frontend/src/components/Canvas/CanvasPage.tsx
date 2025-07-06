import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Excalidraw, convertToExcalidrawElements } from '@excalidraw/excalidraw';
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

  // Create initial black rectangle border covering the entire canvas
  const initialElements = useMemo(() => {
    return convertToExcalidrawElements([
      {
        type: "rectangle",
        x: -2,
        y: -2,
        width: canvasDimensions.width+2,
        height: canvasDimensions.height+2,
        strokeColor: "#000000",
        backgroundColor: "transparent",
        fillStyle: "solid",
        strokeWidth: 2,
        strokeStyle: "solid",
        roughness: 0,
      }
    ]);
  }, [canvasDimensions.width, canvasDimensions.height]);

  // Initial data with the black rectangle border
  const initialCanvasData = useMemo(() => ({
    elements: initialElements,
    appState: {
      viewBackgroundColor: "#ffffff",
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

    setSending(true);
    setMessage('');

    try {
      // Export the canvas as PNG blob
      const elements = excalidrawRef.current.getSceneElements();
      
      if (!elements || elements.length === 0) {
        setMessage('❌ Please draw something before sending!');
        setSending(false);
        return;
      }

      const blob = await excalidrawRef.current.exportToBlob({
        elements,
        mimeType: 'image/png',
        width: 640,
        height: 400,
      });

      // Send the note via API
      const response = await notesAPI.send(blob, user.id, getRecipientUserId());

      if (response.success) {
        setMessage(`✅ Love note sent to ${getRecipientName()}! 💕`);
        // Reset canvas to initial state with border rectangle
        if (excalidrawRef.current) {
          excalidrawRef.current.updateScene({ elements: initialElements });
        }
      } else {
        setMessage(`❌ ${response.error || 'Failed to send note'}`);
      }
    } catch (error) {
      console.error('Error sending note:', error);
      setMessage('❌ Failed to send note. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleClearCanvas = () => {
    if (excalidrawRef.current) {
      // Reset to initial state with border rectangle
      excalidrawRef.current.updateScene({ elements: initialElements });
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
                className="control-button clear-button"
                disabled={sending}
            >
                🗑️ Clear
            </button>
            <button
                onClick={handleSendNote}
                className="control-button send-button"
                disabled={sending}
            >
                {sending ? '📤 Sending...' : `💕 Send to ${getRecipientName()}`}
            </button>
            </div>
      </div>
    </div>
  );
};

export default CanvasPage; 