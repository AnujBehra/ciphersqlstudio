import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup as signupApi } from '../../services/api';
import './AuthPage.scss';

const SignupPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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
      const response = await signupApi(formData.name, formData.email, formData.password);
      localStorage.setItem('token', response.data.token);
      onLogin(response.data);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <h2 className="auth-page__title">Create Account</h2>
        <p className="auth-page__subtitle">Join CipherSQLStudio</p>

        {error && <div className="auth-page__error">{error}</div>}

        <form className="auth-page__form" onSubmit={handleSubmit}>
          <div className="auth-page__field">
            <label className="auth-page__label" htmlFor="name">Name</label>
            <input
              className="auth-page__input"
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-page__switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
