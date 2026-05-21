import React, { useState } from 'react';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { PATTERNS } from '../utils/validation';

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '40px 36px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  title: { fontSize: '20px', fontWeight: '700', color: '#2d2d2d', marginBottom: '8px', textAlign: 'center' },
  sub: { fontSize: '13px', color: '#888', marginBottom: '24px', textAlign: 'center' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' },
  label: { fontSize: '12px', fontWeight: '600', color: '#555' },
  input: {
    padding: '12px 14px',
    border: '1.5px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#2d2d2d',
    outline: 'none',
    background: '#f7f7fb',
    width: '100%',
    boxSizing: 'border-box',
  },
  inputError: {
    padding: '12px 14px',
    border: '1.5px solid #fc8181',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#2d2d2d',
    outline: 'none',
    background: '#fff5f5',
    width: '100%',
    boxSizing: 'border-box',
  },
  error: { fontSize: '12px', color: '#e53e3e' },
  btn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '10px',
  },
  btnDisabled: {
    width: '100%',
    padding: '14px',
    background: '#ccc',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'not-allowed',
    marginTop: '10px',
  },
};

const ChangePassword = ({ user, onComplete }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!PATTERNS.password.test(newPassword)) {
      newErrors.newPassword = 'Password must be 6–128 printable characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await axios.patch(`http://localhost:3001/users/${user.id}`, {
        password: hashedPassword,
        mustChangePassword: false,
      });
      onComplete();
    } catch (e) {
      setErrors({ newPassword: 'Failed to update password. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.overlay}>
      <div style={s.card}>
        <div style={s.title}>🔐 Change Your Password</div>
        <div style={s.sub}>Your account requires a password change before continuing.</div>

        <div style={s.fieldGroup}>
          <label style={s.label}>New Password</label>
          <input
            style={errors.newPassword ? s.inputError : s.input}
            type="password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value.replace(/[^\x20-\x7E]/g, '').slice(0, 128)); setErrors({ ...errors, newPassword: '' }); }}
            placeholder="Min 6 characters"
            maxLength={128}
          />
          {errors.newPassword && <span style={s.error}>{errors.newPassword}</span>}
        </div>

        <div style={s.fieldGroup}>
          <label style={s.label}>Confirm Password</label>
          <input
            style={errors.confirmPassword ? s.inputError : s.input}
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value.replace(/[^\x20-\x7E]/g, '').slice(0, 128)); setErrors({ ...errors, confirmPassword: '' }); }}
            placeholder="Re-enter password"
            maxLength={128}
          />
          {errors.confirmPassword && <span style={s.error}>{errors.confirmPassword}</span>}
        </div>

        <button
          style={loading ? s.btnDisabled : s.btn}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Set New Password'}
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
