import { useState, useEffect } from 'react';
import type { User, NoteHistory } from '../../types';
import { notesAPI } from '../../services/api';

interface HistoryPageProps {
  user: User;
}

const HistoryPage = ({ user }: HistoryPageProps) => {
  const [history, setHistory] = useState<NoteHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');

  useEffect(() => {
    loadHistory();
  }, [user.id]);

  const loadHistory = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await notesAPI.getHistory(user.id);
      
      if (response.success && response.data) {
        setHistory(response.data);
      } else {
        // Mock data for development
        setHistory({
          sent: [
            {
              id: 'mock-1',
              fromUserId: user.id,
              toUserId: user.id === 'user_joe' ? 'user_jane' : 'user_joe',
              imageUrl: '/drawing.png',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              deliveredAt: new Date(Date.now() - 86000000).toISOString(),
              metadata: {
                imageSize: 12345,
                dimensions: { width: 640, height: 400 }
              }
            }
          ],
          received: [
            {
              id: 'mock-2',
              fromUserId: user.id === 'user_joe' ? 'user_jane' : 'user_joe',
              toUserId: user.id,
              imageUrl: '/drawing.png',
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              deliveredAt: new Date(Date.now() - 172000000).toISOString(),
              metadata: {
                imageSize: 12345,
                dimensions: { width: 640, height: 400 }
              }
            }
          ]
        });
      }
    } catch (err) {
      setError('Failed to load note history.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getPartnerName = () => {
    return user.username === 'joe' ? 'Jane' : 'Joe';
  };

  if (loading) {
    return (
      <div className="history-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading note history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-page">
        <div className="error">
          <p>❌ {error}</p>
          <button onClick={loadHistory} className="retry-button btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <h2>Love Notes History 📖</h2>
        <p>Your beautiful memories together</p>
      </div>

      <div className="history-tabs">
        <button
          className={`tab-button ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          📤 Sent to {getPartnerName()} ({history?.sent.length || 0})
        </button>
        <button
          className={`tab-button ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          📥 Received from {getPartnerName()} ({history?.received.length || 0})
        </button>
      </div>

      <div className="history-content">
        {activeTab === 'sent' && (
          <div className="notes-list">
            {history?.sent.length === 0 ? (
              <div className="empty-state">
                <p>💌 No notes sent yet</p>
                <p>Create your first love note!</p>
              </div>
            ) : (
              history?.sent.map((note) => (
                <div key={note.id} className="note-card sent">
                  <div className="note-image">
                    <img src={note.imageUrl} alt="Love note" />
                  </div>
                  <div className="note-details">
                    <div className="note-meta">
                      <span className="note-date">
                        📅 Sent: {formatDate(note.createdAt)}
                      </span>
                      {note.deliveredAt && (
                        <span className="note-delivered">
                          ✅ Delivered: {formatDate(note.deliveredAt)}
                        </span>
                      )}
                    </div>
                    <div className="note-status">
                      {note.deliveredAt ? '💕 Delivered' : '⏳ Pending'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'received' && (
          <div className="notes-list">
            {history?.received.length === 0 ? (
              <div className="empty-state">
                <p>💝 No notes received yet</p>
                <p>Waiting for {getPartnerName()}'s love note!</p>
              </div>
            ) : (
              history?.received.map((note) => (
                <div key={note.id} className="note-card received">
                  <div className="note-image">
                    <img src={note.imageUrl} alt="Love note" />
                  </div>
                  <div className="note-details">
                    <div className="note-meta">
                      <span className="note-date">
                        📅 Received: {formatDate(note.createdAt)}
                      </span>
                      <span className="note-from">
                        💕 From: {getPartnerName()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage; 