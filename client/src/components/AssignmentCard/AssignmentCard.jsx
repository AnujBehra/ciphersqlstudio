import { Link } from 'react-router-dom';
import './AssignmentCard.scss';

const AssignmentCard = ({ assignment }) => {
  const getDifficultyClass = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'assignment-card__badge--easy';
      case 'medium': return 'assignment-card__badge--medium';
      case 'hard': return 'assignment-card__badge--hard';
      default: return '';
    }
  };

  return (
    <Link to={`/assignment/${assignment._id}`} className="assignment-card">
      <div className="assignment-card__header">
        <h3 className="assignment-card__title">{assignment.title}</h3>
        <span className={`assignment-card__badge ${getDifficultyClass(assignment.description)}`}>
          {assignment.description}
        </span>
      </div>
      <p className="assignment-card__question">{assignment.question}</p>
      <div className="assignment-card__footer">
        <span className="assignment-card__cta">Start Solving →</span>
      </div>
    </Link>
  );
};

export default AssignmentCard;
