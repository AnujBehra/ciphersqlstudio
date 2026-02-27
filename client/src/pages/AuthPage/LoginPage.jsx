import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../../services/api';
import './AuthPage.scss';

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginApi(formData.email, formData.password);
      localStorage.setItem('token', response.data.token);
      onLogin(response.data);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <h2 className="auth-page__title">Welcome Back</h2>
        <p className="auth-page__subtitle">Login to CipherSQLStudio</p>

        {error && <div className="auth-page__error">{error}</div>}

        <form className="auth-page__form" onSubmit={handleSubmit}>
          <div className="auth-page__field">
            <label className="auth-page__label" htmlFor="email">Email</label>
            <input
              className="auth-page__input"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="auth-page__field">
            <label className="auth-page__label" htmlFor="password">Password</label>
            <input
              className="auth-page__input"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button className="auth-page__submit" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-page__switch">
          Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
