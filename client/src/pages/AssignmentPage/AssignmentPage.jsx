import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAssignmentById, executeQuery } from '../../services/api';
import SqlEditor from '../../components/SqlEditor/SqlEditor';
import ResultsPanel from '../../components/ResultsPanel/ResultsPanel';
import SampleDataViewer from '../../components/SampleDataViewer/SampleDataViewer';
import HintPanel from '../../components/HintPanel/HintPanel';
import './AssignmentPage.scss';

const AssignmentPage = () => {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [sqlQuery, setSqlQuery] = useState('-- Write your SQL query here\nSELECT ');
  const [queryResult, setQueryResult] = useState(null);
  const [queryError, setQueryError] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const [activeTab, setActiveTab] = useState('question');

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await getAssignmentById(id);
        setAssignment(response.data);
      } catch (err) {
        setError(err.message || 'Failed to load assignment.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) return;

    setIsExecuting(true);
    setQueryError('');
    setQueryResult(null);

    try {
      const response = await executeQuery(id, sqlQuery);
      setQueryResult(response.data);
    } catch (err) {
      setQueryError(err.message || 'Query execution failed.');
    } finally {
      setIsExecuting(false);
    }
  };

  const getDifficultyClass = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'assignment-page__badge--easy';
      case 'medium': return 'assignment-page__badge--medium';
      case 'hard': return 'assignment-page__badge--hard';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="assignment-page">
        <div className="container">
          <div className="assignment-page__loading">
            <div className="assignment-page__spinner" />
            <p>Loading assignment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="assignment-page">
        <div className="container">
          <div className="assignment-page__error">
            <p>⚠️ {error || 'Assignment not found.'}</p>
            <Link to="/" className="assignment-page__back-link">← Back to Assignments</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assignment-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="assignment-page__breadcrumb">
          <Link to="/" className="assignment-page__back-link">← Assignments</Link>
        </div>

        {/* Assignment Header */}
        <div className="assignment-page__header">
          <div className="assignment-page__header-info">
            <h1 className="assignment-page__title">{assignment.title}</h1>
            <span className={`assignment-page__badge ${getDifficultyClass(assignment.description)}`}>
              {assignment.description}
            </span>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="assignment-page__tabs">
          <button
            className={`assignment-page__tab ${activeTab === 'question' ? 'assignment-page__tab--active' : ''}`}
            onClick={() => setActiveTab('question')}
          >
            Question
          </button>
          <button
            className={`assignment-page__tab ${activeTab === 'data' ? 'assignment-page__tab--active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Data
          </button>
          <button
            className={`assignment-page__tab ${activeTab === 'editor' ? 'assignment-page__tab--active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            Editor
          </button>
        </div>

        {/* Main Layout */}
        <div className="assignment-page__layout">
          {/* Left Panel: Question + Data */}
          <div className={`assignment-page__left ${activeTab === 'question' || activeTab === 'data' ? 'assignment-page__left--visible' : ''}`}>
            {/* Question Panel */}
            <div className={`assignment-page__question-panel ${activeTab === 'question' ? 'assignment-page__panel--visible' : ''}`}>
              <h3 className="assignment-page__section-title">📝 Question</h3>
              <p className="assignment-page__question-text">{assignment.question}</p>

              <div className="assignment-page__hint-wrapper">
                <HintPanel assignmentId={id} userQuery={sqlQuery} />
              </div>
            </div>

            {/* Sample Data Panel */}
            <div className={`assignment-page__data-panel ${activeTab === 'data' ? 'assignment-page__panel--visible' : ''}`}>
              <SampleDataViewer tables={assignment.sampleTables} />
            </div>
          </div>

          {/* Right Panel: Editor + Results */}
          <div className={`assignment-page__right ${activeTab === 'editor' ? 'assignment-page__right--visible' : ''}`}>
            <SqlEditor
              value={sqlQuery}
              onChange={setSqlQuery}
              onExecute={handleExecuteQuery}
              isExecuting={isExecuting}
            />

            <ResultsPanel
              result={queryResult}
              error={queryError}
              isExecuting={isExecuting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentPage;
