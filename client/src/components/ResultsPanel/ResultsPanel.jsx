import './ResultsPanel.scss';

const ResultsPanel = ({ result, error, isExecuting }) => {
  if (isExecuting) {
    return (
      <div className="results-panel">
        <div className="results-panel__header">
          <h3 className="results-panel__title">📋 Results</h3>
        </div>
        <div className="results-panel__loading">
          <span className="results-panel__spinner" />
          <p>Executing query...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-panel">
        <div className="results-panel__header">
          <h3 className="results-panel__title">📋 Results</h3>
        </div>
        <div className="results-panel__error">
          <span className="results-panel__error-icon">✕</span>
          <pre className="results-panel__error-message">{error}</pre>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="results-panel">
        <div className="results-panel__header">
          <h3 className="results-panel__title">📋 Results</h3>
        </div>
        <div className="results-panel__empty">
          <p>Run a query to see results here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="results-panel">
      <div className="results-panel__header">
        <h3 className="results-panel__title">📋 Results</h3>
        <span className="results-panel__count">
          {result.rowCount} row{result.rowCount !== 1 ? 's' : ''} returned
        </span>
      </div>
      {result.rows && result.rows.length > 0 ? (
        <div className="results-panel__scroll">
          <table className="results-panel__table">
            <thead>
              <tr>
                {result.fields.map((field, i) => (
                  <th key={i} className="results-panel__th">{field}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="results-panel__tr">
                  {result.fields.map((field, colIdx) => (
                    <td key={colIdx} className="results-panel__td">
                      {String(row[field] ?? 'NULL')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="results-panel__empty">
          <p>Query executed successfully. No rows returned.</p>
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;
