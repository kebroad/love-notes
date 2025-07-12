import { useState, useRef, useCallback, useEffect } from 'react';
// @ts-ignore - react-artboard has TypeScript declaration issues
import {
  useBrush,
  useMarker,
  useAirbrush,
  Artboard,
  useShadingBrush,
  useEraser,
  useWatercolor,
  useHistory,
} from 'react-artboard';
import type { ToolHandlers, ArtboardRef } from 'react-artboard';
import {
  FaPencilAlt,
  FaPaintBrush,
  FaMarker,
  FaEraser,
  FaSprayCan,
  FaTrashAlt,
  FaUndo,
  FaExpandArrowsAlt,
} from 'react-icons/fa';
import { IoMdWater } from 'react-icons/io';
import { BsFillSendFill } from 'react-icons/bs';
import { MdColorLens, MdCancel } from 'react-icons/md';

import type { IconType } from 'react-icons/lib';
import type { User } from '../../types';
import { notesAPI } from '../../services/api';
import { getStoredUser } from '../../utils/auth';
import { useCanvasShared } from '../../hooks/useCanvasShared';
import SendConfirmModal from '../shared/SendConfirmModal';


interface PaintPageProps {
  user: User;
}

const PaintPage = ({ user }: PaintPageProps) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [artboardRef, setArtboardRef] = useState<ArtboardRef | null>(null);
  // Dynamic dimensions that fill the canvas-container
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 640, height: 400 });
  
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

  // Paint tools state
  const [color, setColor] = useState('#531B93');
  const [strokeWidth, setStrokeWidth] = useState(40);
  const [colorOpen, setColorOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState(2); // Set paintbrush as default tool

  // Tool definitions
  const brush = useBrush({ color, strokeWidth });
  const marker = useMarker({ color, strokeWidth });
  const watercolor = useWatercolor({ color, strokeWidth });
  const airbrush = useAirbrush({ color, strokeWidth });
  const eraser = useEraser({ strokeWidth });
  const shading = useShadingBrush({
    color,
    spreadFactor: (1 / 45) * strokeWidth,
    distanceThreshold: 100,
  });

  const tools: Array<[ToolHandlers, IconType]> = [
    [shading, FaPencilAlt],
    [watercolor, IoMdWater],
    [brush, FaPaintBrush],
    [marker, FaMarker],
    [airbrush, FaSprayCan],
    [eraser, FaEraser],
  ];

  const { undo, redo, history, canUndo, canRedo } = useHistory();

  // Function to measure canvas container dimensions
  const measureCanvasContainer = useCallback(() => {
    if (canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Always update dimensions to match container
      setCanvasDimensions({ width, height });
    }
  }, []); // Remove the dependency on canvasDimensions to avoid circular updates

  // Effect to measure canvas dimensions on mount and resize
  useEffect(() => {
    measureCanvasContainer();

    const handleResize = () => { 
      measureCanvasContainer();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [measureCanvasContainer]);

  // Effect to re-measure dimensions when artboard ref changes
  useEffect(() => {
    if (artboardRef) {
      // Small delay to ensure the artboard is fully rendered
      const timer = setTimeout(() => {
        measureCanvasContainer();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [artboardRef, measureCanvasContainer]);

  // Effect to re-measure dimensions when history changes (catches undo/redo dimension resets)
  useEffect(() => {
    const timer = setTimeout(() => {
      measureCanvasContainer();
    }, 50);
    return () => clearTimeout(timer);
  }, [history, measureCanvasContainer]);

  const handleSendNote = async () => {
    if (!artboardRef) {
      setMessage('❌ Canvas not ready. Please try again.');
      return;
    }

    setMessage('');

    try {
      // Get the canvas as a data URL
      const dataUri = artboardRef.getImageAsDataUri('image/png');
      if (!dataUri) {
        setMessage('❌ Canvas not available. Please try again.');
        return;
      }

      // Convert data URI to blob for preview
      const response = await fetch(dataUri);
      await response.blob(); // Ensure the response is processed

      // Create a temporary canvas to resize to 640x400
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 640;
      tempCanvas.height = 400;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) {
        setMessage('❌ Failed to create preview. Please try again.');
        return;
      }

      // Create image from blob and draw it scaled to temp canvas
      const img = new Image();
      img.onload = () => {
        tempCtx.drawImage(img, 0, 0, 640, 400);
        
        // Convert to blob for preview
        tempCanvas.toBlob((previewBlob) => {
          if (previewBlob) {
            const imageUrl = URL.createObjectURL(previewBlob);
            showConfirmPreview(imageUrl);
          } else {
            setMessage('❌ Failed to create preview. Please try again.');
          }
        }, 'image/png');
      };
      img.src = dataUri;
    } catch (error) {
      console.error('Error creating preview:', error);
      setMessage('❌ Failed to create preview. Please try again.');
    }
  };

  const handleConfirmSend = async () => {
    if (!artboardRef || !previewImageUrl) {
      return;
    }

    setSending(true);

    try {
      // Get the canvas data as data URI
      const dataUri = artboardRef.getImageAsDataUri('image/png');
      if (!dataUri) {
        throw new Error('Canvas not available');
      }

      // Convert data URI to blob
      const response = await fetch(dataUri);
      await response.blob(); // Ensure the response is processed

      // Create final canvas at 640x400
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = 640;
      finalCanvas.height = 400;
      const finalCtx = finalCanvas.getContext('2d');
      
      if (!finalCtx) {
        throw new Error('Failed to create final canvas');
      }

      // Create image from data URI and draw it to final canvas
      const img = new Image();
      img.onload = async () => {
        finalCtx.drawImage(img, 0, 0, 640, 400);

        // Convert to blob and send
        finalCanvas.toBlob(async (finalBlob) => {
          if (!finalBlob) {
            throw new Error('Failed to create final image');
          }

          // Get authentication data
          const authData = getStoredUser();
          if (!authData) {
            setMessage('❌ Authentication expired. Please log in again.');
            return;
          }

          // Send the note via API
          const response = await notesAPI.send(finalBlob, user.id, getRecipientUserId(), authData.password);

          if (response.success) {
            setMessage(`✅ Love note sent to ${getRecipientName()}! 💕`);
            // Clear the canvas
            artboardRef?.clear();
          } else {
            setMessage(`❌ ${response.error || 'Failed to send note'}`);
          }
        }, 'image/png');
      };
      img.src = dataUri;
    } catch (error) {
      console.error('Error sending note:', error);
      setMessage('❌ Failed to send note. Please try again.');
    } finally {
      setSending(false);
      cleanupPreview();
    }
  };

  const handleClearCanvas = () => {
    artboardRef?.clear();
    setMessage('');
  };

  const handleUndo = () => {
    undo();
    // Force re-measurement with multiple attempts to ensure it takes effect
    setTimeout(() => {
      measureCanvasContainer();
      // Force another measurement after a brief delay to ensure it sticks
      setTimeout(() => measureCanvasContainer(), 100);
    }, 10);
  };

  const handleRedo = () => {
    redo();
    // Force re-measurement with multiple attempts to ensure it takes effect
    setTimeout(() => {
      measureCanvasContainer();
      // Force another measurement after a brief delay to ensure it sticks
      setTimeout(() => measureCanvasContainer(), 100);
    }, 10);
  };

  // Effect to handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl (or Cmd on Mac) is pressed
      const isCtrlPressed = event.ctrlKey || event.metaKey;
      
      if (isCtrlPressed) {
        if (event.key === 'z' && !event.shiftKey) {
          // Ctrl+Z for undo
          event.preventDefault();
          if (canUndo && !sending) {
            handleUndo();
          }
        } else if ((event.key === 'y') || (event.key === 'z' && event.shiftKey)) {
          // Ctrl+Y or Ctrl+Shift+Z for redo
          event.preventDefault();
          if (canRedo && !sending) {
            handleRedo();
          }
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canUndo, canRedo, sending, handleUndo, handleRedo]);

  return (
    <div className="canvas-page">
      <div className="canvas-side">
        <div className="paint-tools">
          <div className="tool-section">
            <div className="tool-grid">
              {tools.map(([tool, Icon], index) => (
                <button
                  key={tool.name}
                  title={tool.name}
                  className={`control-button btn-primary tool-button ${currentTool === index ? 'active' : ''}`}
                  onClick={() => setCurrentTool(index)}
                >
                  <Icon  />
                  {tool.name}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setColorOpen(true)}
            className="control-button btn-primary"
            style={{ backgroundColor: color }}
          >
            <MdColorLens />
            Color
          </button>
          <button
            onClick={() => setSizeOpen(true)}
            className="control-button btn-primary"
          >
            <FaExpandArrowsAlt />
            Brush Size
          </button>
        </div>
      </div>

      <div className="canvas-container" ref={canvasContainerRef}>
        <Artboard
          key={`${canvasDimensions.width}-${canvasDimensions.height}`}
          tool={tools[currentTool][0]}
          ref={setArtboardRef}
          history={history}
          height={canvasDimensions.width/1.6}
          width={canvasDimensions.width}
          color='#fffff0'

        />
      </div>

      <div className="canvas-side">
        <div className="canvas-controls">
          <button
            onClick={handleUndo}
            disabled={!canUndo || sending}
            className="control-button btn-primary"
          >
            <FaUndo />
            Undo
          </button>
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

      {/* Color Picker Modal */}
      {colorOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Tool Color</h3>
              <p>Choose a color for your paint tool</p>
            </div>
            
            <div className="modal-preview">
              <div className="color-picker-container">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="color-picker"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => setColorOpen(false)}
                className="btn-primary"
              >
                <MdCancel />
                Cancel
              </button>
              <button 
                onClick={() => setColorOpen(false)}
                className="btn-primary"
              >
                <MdColorLens />
                Apply Color
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Size Picker Modal */}
      {sizeOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSizeOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              padding: '30px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              width: 150,
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Brush Size</h3>
            <input
              type="range"
              min="5"
              max="100"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
            />
            <div style={{ 
              flex: 1, 
              minHeight: 150, 
              justifyContent: 'center', 
              flexDirection: 'column', 
              display: 'flex', 
              alignItems: 'center' 
            }}>
              <div style={{
                width: strokeWidth,
                height: strokeWidth,
                backgroundColor: color,
                borderRadius: strokeWidth,
                maxWidth: 100,
                maxHeight: 100,
              }}></div>
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

export default PaintPage; 