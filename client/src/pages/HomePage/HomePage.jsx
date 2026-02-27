import { useState, useEffect } from 'react';
import { getAssignments } from '../../services/api';
import AssignmentCard from '../../components/AssignmentCard/AssignmentCard';
import './HomePage.scss';

const HomePage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await getAssignments();
        setAssignments(response.data);
      } catch (err) {
        setError(err.message || 'Failed to load assignments.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const filteredAssignments = filter === 'all'
    ? assignments
    : assignments.filter(a => a.description.toLowerCase() === filter);

  if (loading) {
    return (
      <div className="home-page">
        <div className="container">
          <div className="home-page__loading">
            <div className="home-page__spinner" />
            <p>Loading assignments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <div className="container">
          <div className="home-page__error">
            <p>⚠️ {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="container">
        <div className="home-page__hero">
          <h1 className="home-page__title">SQL Assignments</h1>
          <p className="home-page__subtitle">
            Practice SQL queries with real-time execution and intelligent hints.
          </p>
        </div>

        <div className="home-page__filters">
          {['all', 'easy', 'medium', 'hard'].map((level) => (
            <button
              key={level}
              className={`home-page__filter-btn ${filter === level ? 'home-page__filter-btn--active' : ''}`}
              onClick={() => setFilter(level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        <div className="home-page__grid">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((assignment) => (
              <AssignmentCard key={assignment._id} assignment={assignment} />
            ))
          ) : (
            <p className="home-page__no-results">No assignments found for this filter.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
