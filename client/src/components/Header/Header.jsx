import { Link } from 'react-router-dom';
import './Header.scss';

const Header = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          <span className="header__logo-icon">⟨/⟩</span>
          <span className="header__logo-text">CipherSQLStudio</span>
        </Link>

        <nav className="header__nav">
          {user ? (
            <div className="header__user">
              <span className="header__user-name">{user.name}</span>
              <button className="header__btn header__btn--logout" onClick={onLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="header__auth">
              <Link to="/login" className="header__btn header__btn--login">
                Login
              </Link>
              <Link to="/signup" className="header__btn header__btn--signup">
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
