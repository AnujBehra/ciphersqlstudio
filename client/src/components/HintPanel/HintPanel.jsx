import { useState } from 'react';
import { getHint } from '../../services/api';
import './HintPanel.scss';

const HintPanel = ({ assignmentId, userQuery }) => {
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleGetHint = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getHint(assignmentId, userQuery);
      setHint(response.hint);
      setIsOpen(true);
    } catch (err) {
      setError(err.message || 'Failed to get hint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hint-panel">
      <button
        className="hint-panel__btn"
        onClick={handleGetHint}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="hint-panel__spinner" />
            Thinking...
          </>
        ) : (
          <>💡 Get Hint</>
        )}
      </button>

      {isOpen && hint && (
        <div className="hint-panel__content">
          <div className="hint-panel__content-header">
            <span className="hint-panel__content-icon">💡</span>
            <span className="hint-panel__content-title">Hint</span>
            <button
              className="hint-panel__close"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>
          <p className="hint-panel__text">{hint}</p>
        </div>
      )}

      {error && (
        <div className="hint-panel__error">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default HintPanel;
