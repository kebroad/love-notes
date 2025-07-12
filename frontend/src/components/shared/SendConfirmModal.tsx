import { BsFillSendFill } from "react-icons/bs";
import { MdCancel } from "react-icons/md";

interface SendConfirmModalProps {
  isOpen: boolean;
  recipientName: string;
  previewImageUrl: string | null;
  sending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const SendConfirmModal = ({
  isOpen,
  recipientName,
  previewImageUrl,
  sending,
  onConfirm,
  onCancel,
}: SendConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Confirm Send</h3>
          <p>Send this love note to {recipientName}?</p>
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
            onClick={onCancel}
            className="btn-primary"
            disabled={sending}
          >
            <MdCancel />
            Cancel
          </button>
          <button 
            onClick={onConfirm}
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
  );
};

export default SendConfirmModal; 