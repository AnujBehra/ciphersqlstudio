import './SampleDataViewer.scss';

const SampleDataViewer = ({ tables }) => {
  if (!tables || tables.length === 0) {
    return <p className="sample-data__empty">No sample data available.</p>;
  }

  return (
    <div className="sample-data">
      <h3 className="sample-data__title">📊 Sample Data</h3>
      {tables.map((table, index) => (
        <div key={index} className="sample-data__table-wrapper">
          <h4 className="sample-data__table-name">
            <span className="sample-data__table-icon">⊞</span>
            {table.tableName}
          </h4>
          <div className="sample-data__scroll">
            <table className="sample-data__table">
              <thead>
                <tr>
                  {table.columns.map((col, i) => (
                    <th key={i} className="sample-data__th">
                      <span className="sample-data__col-name">{col.columnName}</span>
                      <span className="sample-data__col-type">{col.dataType}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="sample-data__tr">
                    {table.columns.map((col, colIdx) => (
                      <td key={colIdx} className="sample-data__td">
                        {String(row[col.columnName] ?? 'NULL')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SampleDataViewer;
