import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const navigate = useNavigate();
  const { register, user, loading, error, setError } = useAuth();
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', confirmPassword: '' });
  const [validationErrors, setValidationErrors] = useState([]);
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
    setValidationErrors([]);
    setError('');

    const errors = [];
    if (!form.fullName.trim()) errors.push('Full Name is required.');
    if (!form.username.trim()) errors.push('Username is required.');
    if (!form.email.trim()) errors.push('Email is required.');
    if (!form.password) errors.push('Password is required.');
    if (form.password !== form.confirmPassword) errors.push('Passwords do not match.');

    const username = form.username.trim();
    const hasNumber = /\d/.test(username);
    const hasSymbol = /[^A-Za-z0-9]/.test(username);
    const hasSpace = /\s/.test(username);
    if (hasSpace) errors.push('Username cannot contain spaces.');
    if (!hasNumber || !hasSymbol) errors.push('Username must include at least one number and one symbol.');

    if (errors.length) {
      setValidationErrors(errors);
      return;
    }

    try {
      await register({
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        password: form.password
      });
      navigate('/login');
    } catch (err) {
      setValidationErrors([err.message]);
    }
  };

  return (
    <div className="page-shell auth-page">
      <div className="auth-card auth-card--auth">
        <div className="auth-card__header auth-card__header--compact">
          <div>
            <p className="eyebrow">QR Code Business Card Generator</p>
            <h1>Register your account</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <label className="field-label">
            Full Name
            <div className="input-icon">
              <i className="fa-solid fa-signature" />
              <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter full name" />
            </div>
          </label>

          <label className="field-label">
            Username
            <div className="input-icon">
              <i className="fa-solid fa-user" />
              <input name="username" value={form.username} onChange={handleChange} placeholder="Enter username" />
            </div>
          </label>

          <label className="field-label">
            Email
            <div className="input-icon">
              <i className="fa-solid fa-envelope" />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter email" />
            </div>
          </label>

          <label className="field-label field-label--password">
            Password
            <div className="input-icon">
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
                className="eye-toggle"
                onClick={() => setShowPassword((current) => !current)}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </label>

          <label className="field-label">
            Confirm Password
            <div className="input-icon">
              <i className="fa-solid fa-lock" />
              <input
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowPassword((current) => !current)}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </label>

          {(validationErrors.length || error) && (
            <div className="alert-box">
              {[...validationErrors, error].filter(Boolean).map((message, index) => (
                <p key={index}>{message}</p>
              ))}
            </div>
          )}

          <button type="submit" disabled={loading} className="primary-button">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="form-note">
          Already registered? <Link to="/login">Login here</Link>.
        </p>
      </div>
    </div>
  );
};

export default Register;
