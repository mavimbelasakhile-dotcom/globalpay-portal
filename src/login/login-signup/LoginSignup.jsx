import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/auth';
import { validateLoginForm } from '../../utils/validation';
import emailIcon from '../assets/email icon.webp';
import passwordIcon from '../assets/password icon.webp';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', sans-serif",
    padding: '30px 20px',
  },
  brand: { textAlign: 'center', marginBottom: '24px' },
  brandTitle: { fontSize: '28px', fontWeight: '800', color: '#fff', letterSpacing: '0.5px', marginBottom: '6px' },
  brandSlogan: { fontSize: '15px', fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginBottom: '4px' },
  brandSub: { fontSize: '13px', color: 'rgba(255,255,255,0.7)' },
  container: {
    width: '400px',
    background: '#fff',
    borderRadius: '20px',
    padding: '40px 35px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  header: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px', gap: '10px' },
  headerText: { fontSize: '26px', fontWeight: '700', color: '#2d2d2d' },
  underline: { width: '60px', height: '4px', background: 'linear-gradient(to right, #667eea, #764ba2)', borderRadius: '4px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' },
  inputBox: { display: 'flex', alignItems: 'center', background: '#f7f7fb', border: '1.5px solid #e0e0e0', borderRadius: '12px', padding: '12px 16px', gap: '12px' },
  inputBoxError: { display: 'flex', alignItems: 'center', background: '#fff5f5', border: '1.5px solid #fc8181', borderRadius: '12px', padding: '12px 16px', gap: '12px' },
  icon: { width: '20px', height: '20px', objectFit: 'contain', opacity: 0.6 },
  input: { border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: '#2d2d2d', width: '100%' },
  errorText: { fontSize: '12px', color: '#e53e3e', paddingLeft: '4px' },
  apiError: { background: '#fff5f5', border: '1px solid #fc8181', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#c53030', marginBottom: '14px', textAlign: 'center' },
  submitBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.5px', marginBottom: '14px' },
  submitBtnDisabled: { width: '100%', padding: '14px', background: '#ccc', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'not-allowed', letterSpacing: '0.5px', marginBottom: '14px' },
  notice: { textAlign: 'center', fontSize: '12px', color: '#aaa', marginTop: '4px' },
};

const MAX_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 30;

const LoginSignup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedOut, setLockedOut] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const fieldFilters = {
    email:    (v) => v.replace(/[^a-zA-Z0-9._%+\-@]/g, '').slice(0, 254),
    password: (v) => v.replace(/[^\x20-\x7E]/g, '').slice(0, 128),
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const filtered = fieldFilters[name] ? fieldFilters[name](value) : value;
    setFormData({ ...formData, [name]: filtered });
    setErrors({ ...errors, [name]: '' });
    setApiError('');
  };

  useEffect(() => {
    if (!lockedOut) return;
    if (countdown <= 0) {
      setLockedOut(false);
      setFailedAttempts(0);
      setApiError('');
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [lockedOut, countdown]);

  const handleSubmit = async () => {
    if (lockedOut) return;
    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setLoading(true);
    setApiError('');

    try {
      const user = await loginUser(formData);
      setFailedAttempts(0);
      navigate('/portal', { state: { user } });
    } catch (err) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setLockedOut(true);
        setCountdown(LOCKOUT_SECONDS);
        setApiError(`Too many failed attempts. Login disabled for ${LOCKOUT_SECONDS} seconds.`);
      } else {
        setApiError(`${err.message || 'Invalid credentials.'} — ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.brand}>
        <div style={styles.brandTitle}>🌐 GlobalPay Portal</div>
        <div style={styles.brandSlogan}>International Payment Transfer</div>
        <div style={styles.brandSub}>Send money securely across borders</div>
      </div>

      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerText}>Employee Login</div>
          <div style={styles.underline}></div>
        </div>

        {apiError && <div style={styles.apiError}>{apiError}</div>}

        <div style={styles.inputGroup}>
          <div style={errors.email ? styles.inputBoxError : styles.inputBox}>
            <img src={emailIcon} alt="email" style={styles.icon} />
            <input style={styles.input} type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} maxLength={254} />
          </div>
          {errors.email && <span style={styles.errorText}>{errors.email}</span>}
        </div>

        <div style={styles.inputGroup}>
          <div style={errors.password ? styles.inputBoxError : styles.inputBox}>
            <img src={passwordIcon} alt="password" style={styles.icon} />
            <input style={styles.input} type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} maxLength={128} />
          </div>
          {errors.password && <span style={styles.errorText}>{errors.password}</span>}
        </div>

        <button
          style={loading || lockedOut ? styles.submitBtnDisabled : styles.submitBtn}
          onClick={handleSubmit}
          disabled={loading || lockedOut}
        >
          {lockedOut ? `Locked — wait ${countdown}s` : loading ? 'Please wait...' : 'Login'}
        </button>

        <div style={styles.notice}>
          Employee accounts are pre-configured by the system administrator.
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
