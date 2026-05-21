import React, { useState } from 'react';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { PATTERNS } from '../utils/validation';

const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
  let pass = '';
  for (let i = 0; i < 12; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

const s = {
  card: {
    maxWidth: '900px',
    margin: '24px auto 0 auto',
    background: '#fff',
    borderRadius: '20px',
    padding: '30px 40px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  title: { fontSize: '18px', fontWeight: '700', color: '#2d2d2d', marginBottom: '16px' },
  row: { display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '14px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '4px', flex: '1', minWidth: '180px' },
  label: { fontSize: '12px', fontWeight: '600', color: '#555' },
  input: {
    padding: '10px 14px',
    border: '1.5px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#2d2d2d',
    outline: 'none',
    background: '#f7f7fb',
    width: '100%',
    boxSizing: 'border-box',
  },
  btn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    height: '40px',
  },
  error: { fontSize: '12px', color: '#e53e3e' },
  success: {
    background: '#f0fff4',
    border: '1px solid #68d391',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '13px',
    color: '#276749',
    marginTop: '10px',
  },
};

const CreateUser = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setError('');
    setResult(null);

    if (!name.trim() || !PATTERNS.name.test(name.trim())) {
      setError('Enter a valid name (letters, spaces, hyphens only)');
      return;
    }
    if (!email.trim() || !PATTERNS.email.test(email.trim())) {
      setError('Enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const existing = await axios.get(`http://localhost:3001/users?email=${encodeURIComponent(email.trim())}`);
      if (existing.data.length > 0) {
        setError('A user with this email already exists');
        setLoading(false);
        return;
      }

      const tempPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      await axios.post('http://localhost:3001/users', {
        name: name.trim(),
        email: email.trim(),
        password: hashedPassword,
        mustChangePassword: true,
      });

      setResult({ name: name.trim(), email: email.trim(), tempPassword });
      setName('');
      setEmail('');
    } catch (e) {
      setError('Failed to create user. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.card}>
      <div style={s.title}>👤 Create New User</div>
      <div style={s.row}>
        <div style={s.fieldGroup}>
          <label style={s.label}>Full Name</label>
          <input
            style={s.input}
            value={name}
            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s'\-]/g, ''))}
            placeholder="e.g. John Smith"
            maxLength={60}
          />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Email Address</label>
          <input
            style={s.input}
            value={email}
            onChange={(e) => setEmail(e.target.value.replace(/[^a-zA-Z0-9._%+\-@]/g, ''))}
            placeholder="e.g. john@globalpay.co.za"
            maxLength={254}
          />
        </div>
        <button style={s.btn} onClick={handleCreate} disabled={loading}>
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </div>
      {error && <div style={s.error}>{error}</div>}
      {result && (
        <div style={s.success}>
          <strong>User created successfully!</strong><br />
          Name: {result.name}<br />
          Email: {result.email}<br />
          Temporary Password: <strong>{result.tempPassword}</strong><br />
          <em>The user will be prompted to change their password on first login.</em>
        </div>
      )}
    </div>
  );
};

export default CreateUser;
