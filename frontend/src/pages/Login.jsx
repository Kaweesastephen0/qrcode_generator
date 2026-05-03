import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const navigate = useNavigate();
  const { login, user, loading, error, setError } = useAuth();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [validationError, setValidationError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setValidationError('');

    if (!form.identifier.trim() || !form.password) {
      setValidationError('Email/Username and password are required.');
      return;
    }

    try {
      await login(form);
    } catch (err) {
      setValidationError(err.message);
    }
  };

  return (
    <div className="page-shell auth-page">
      <div className="auth-card auth-card--auth">
        <div className="auth-card__header auth-card__header--compact">
          <div>
            <p className="eyebrow">Qr code Generator</p>
            <h1>Sign in to your account</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <label className="field-label">
            Email or Username
            <div className="input-icon">
              <i className="fa-solid fa-user" />
              <input
                name="identifier"
                value={form.identifier}
                onChange={handleChange}
                placeholder="Email or username"
              />
            </div>
          </label>

          <label className="field-label field-label--password">
            Password
            <div className="password-row input-icon">
              <i className="fa-solid fa-lock" />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
              <button
                type="button"
                className="ghost-button"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <div className="form-bottom-row">
            <span />
            <Link to="/" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          {(validationError || error) && (
            <div className="alert-box">
              <p>{validationError || error}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="primary-button">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="form-note">
          New to QR Builder? <Link to="/register">Join now</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
