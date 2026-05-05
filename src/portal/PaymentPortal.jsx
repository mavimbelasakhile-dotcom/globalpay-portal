import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { validatePaymentForm, sanitise } from '../utils/validation';
import useIdleTimer from '../hooks/useIdleTimer';

const currencies = [
  { code: 'ZAR', label: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'USD', label: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', label: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', label: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CNY', label: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
];

const southAfricanBanks = [
  { name: 'Capitec',        swift: 'CABLZAJJ' },
  { name: 'FNB',            swift: 'FIRNZAJJ' },
  { name: 'Absa',           swift: 'ABSAZAJJ' },
  { name: 'Investec',       swift: 'IVESZAJJ' },
  { name: 'Grindrod',       swift: 'GRIDZAJJ' },
  { name: 'Nedbank',        swift: 'NEDSZAJJ' },
  { name: 'African Bank',   swift: 'AFRCZAJJ' },
  { name: 'Discovery Bank', swift: 'DISCZAJJ' },
  { name: 'Bank Zero',      swift: 'N/A' },
  { name: 'TymeBank',       swift: 'TYMEZAJJ' },
];

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: "'Segoe UI', sans-serif",
    padding: '30px 20px',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '900px',
    margin: '0 auto 30px auto',
    color: '#fff',
  },
  brand: { fontSize: '20px', fontWeight: '700', letterSpacing: '0.5px' },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.3)',
    border: '2px solid rgba(255,255,255,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  userName: { fontSize: '14px', fontWeight: '700', color: '#fff' },
  userEmail: { fontSize: '12px', opacity: 0.75, color: '#fff' },
  logoutBtn: {
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.4)',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  card: {
    maxWidth: '900px',
    margin: '0 auto',
    background: '#fff',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  dashboard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    maxWidth: '900px',
    margin: '0 auto 24px auto',
  },
  dashCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px 16px',
    textAlign: 'center',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  dashIcon: { fontSize: '28px', marginBottom: '8px' },
  dashValue: { fontSize: '22px', fontWeight: '800', color: '#2d2d2d', marginBottom: '4px' },
  dashLabel: { fontSize: '12px', color: '#888', fontWeight: '600' },
  cardTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#2d2d2d',
    marginBottom: '6px',
  },
  cardSubtitle: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '30px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  fieldGroupFull: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    gridColumn: 'span 2',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#555',
  },
  inputBox: {
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
  inputBoxError: {
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
  select: {
    padding: '12px 14px',
    border: '1.5px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#2d2d2d',
    outline: 'none',
    background: '#f7f7fb',
    width: '100%',
    cursor: 'pointer',
  },
  errorText: {
    fontSize: '12px',
    color: '#e53e3e',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #f0f0f0',
    margin: '28px 0',
  },
  summaryBox: {
    background: '#f7f7fb',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
    gridColumn: 'span 2',
  },
  summaryTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#555',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#555',
    marginBottom: '8px',
  },
  summaryTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '16px',
    fontWeight: '700',
    color: '#2d2d2d',
    borderTop: '1px solid #e0e0e0',
    paddingTop: '10px',
    marginTop: '4px',
  },
  submitBtn: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    gridColumn: 'span 2',
  },
  submitBtnDisabled: {
    width: '100%',
    padding: '15px',
    background: '#ccc',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'not-allowed',
    gridColumn: 'span 2',
  },
  successOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  successCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '50px 40px',
    textAlign: 'center',
    maxWidth: '380px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  successIcon: { fontSize: '56px', marginBottom: '16px' },
  successTitle: { fontSize: '22px', fontWeight: '700', color: '#2d2d2d', marginBottom: '8px' },
  successSub: { fontSize: '14px', color: '#888', marginBottom: '24px' },
  successBtn: {
    padding: '12px 30px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  historyCard: {
    maxWidth: '900px',
    margin: '24px auto 0 auto',
    background: '#fff',
    borderRadius: '20px',
    padding: '30px 40px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  historyTitle: { fontSize: '18px', fontWeight: '700', color: '#2d2d2d', marginBottom: '16px' },
  historyTable: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f7f7fb', color: '#555', fontWeight: '700', borderBottom: '2px solid #e0e0e0' },
  td: { padding: '12px', borderBottom: '1px solid #f0f0f0', color: '#3c3c3c', verticalAlign: 'middle' },
  badgePending:  { background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  badgeSuccess:  { background: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  badgeDeclined: { background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  badgeContact:  { background: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  emptyHistory:  { textAlign: 'center', color: '#aaa', padding: '30px', fontSize: '14px' },
  downloadBtn: {
    padding: '6px 12px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  paymentMethods: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  methodCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '14px 18px',
    border: '1.5px solid #e0e0e0',
    borderRadius: '12px',
    background: '#f7f7fb',
    cursor: 'pointer',
    flex: '1',
    minWidth: '80px',
    transition: 'all 0.2s',
  },
  methodCardActive: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '14px 18px',
    border: '2px solid #667eea',
    borderRadius: '12px',
    background: '#eef2ff',
    cursor: 'pointer',
    flex: '1',
    minWidth: '80px',
    boxShadow: '0 2px 8px rgba(102,126,234,0.2)',
  },
  methodIcon: { fontSize: '24px' },
  methodName: { fontSize: '11px', fontWeight: '600', color: '#555', textAlign: 'center' },
  idleOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  idleCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '40px 36px',
    textAlign: 'center',
    maxWidth: '360px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  idleIcon: { fontSize: '48px', marginBottom: '14px' },
  idleTitle: { fontSize: '20px', fontWeight: '700', color: '#2d2d2d', marginBottom: '8px' },
  idleSub: { fontSize: '14px', color: '#888', marginBottom: '6px' },
  idleCountdown: { fontSize: '32px', fontWeight: '800', color: '#e53e3e', margin: '12px 0 20px' },
  idleBtnRow: { display: 'flex', gap: '12px', justifyContent: 'center' },
  idleContinueBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  idleLogoutBtn: {
    padding: '12px 24px',
    background: '#f0f0f0',
    color: '#555',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

const FEE_RATE = 0.015;     // 1.5% admin fee
const DELIVERY_RATE = 0.07; // 7% delivery fee

const paymentMethods = [
  { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' },
  { id: 'paypal',        name: 'PayPal',        icon: '💳' },
  { id: 'bitcoin',       name: 'Bitcoin',       icon: '₿' },
  { id: 'apple_pay',     name: 'Apple Pay',     icon: '🍎' },
];

const PaymentPortal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user || { name: 'Customer' };

  const [form, setForm] = useState({
    recipientName: '',
    recipientAccount: '',
    recipientBank: '',
    swiftCode: '',
    amount: '',
    currency: 'ZAR',
    paymentMethod: 'bank_transfer',
    reference: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [payments, setPayments] = useState([]);

  // Load payment history for this user on mount
  useEffect(() => {
    if (user.id) {
      axios.get(`http://localhost:3001/payments?userId=${user.id}`)
        .then((res) => setPayments(res.data))
        .catch(() => {});
    }
  }, [user.id]);

  const selectedCurrency = currencies.find((c) => c.code === form.currency);
  const amount = parseFloat(form.amount) || 0;
  const adminFee = parseFloat((amount * FEE_RATE).toFixed(2));
  const deliveryFee = parseFloat((amount * DELIVERY_RATE).toFixed(2));
  const total = parseFloat((amount + adminFee + deliveryFee).toFixed(2));

  // Per-field regex whitelist — strips invalid chars as user types
  const fieldFilters = {
    recipientName:    (v) => v.replace(/[^a-zA-Z\s'\-]/g, ''),
    recipientAccount: (v) => v.replace(/[^0-9]/g, '').slice(0, 34),
    amount:           (v) => v.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'),
    reference:        (v) => v.replace(/[^a-zA-Z0-9\s\-#/]/g, '').slice(0, 100),
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Dropdowns — no filtering needed
    if (name === 'currency') {
      setForm({ ...form, currency: value });
      return;
    }

    if (name === 'recipientBank') {
      const match = southAfricanBanks.find((b) => b.name === value);
      setForm((prev) => ({
        ...prev,
        recipientBank: value,
        swiftCode: match?.swift || prev.swiftCode,
      }));
      setErrors((prev) => ({ ...prev, recipientBank: '', swiftCode: '' }));
      return;
    }

    // Apply per-field filter if defined, otherwise generic sanitise
    const filtered = fieldFilters[name] ? fieldFilters[name](value) : sanitise(value);
    setForm({ ...form, [name]: filtered });
    setErrors({ ...errors, [name]: '' });
  };

  const validate = () => validatePaymentForm(form);

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      // Save payment record with "Pending Approval" status
      const newPayment = {
        userId: user.id,
        recipientName: form.recipientName,
        recipientAccount: form.recipientAccount,
        recipientBank: form.recipientBank,
        swiftCode: form.swiftCode,
        amount: parseFloat(form.amount),
        currency: form.currency,
        paymentMethod: form.paymentMethod,
        reference: form.reference,
        status: 'Pending Approval',
        date: new Date().toISOString(),
      };
      await axios.post('http://localhost:3001/payments', newPayment);
      // Refresh history
      const res = await axios.get(`http://localhost:3001/payments?userId=${user.id}`);
      setPayments(res.data);
    } catch (e) {
      // continue even if save fails
    } finally {
      setLoading(false);
      setSuccess(true);
    }
  };

  const handleLogout = () => navigate('/');

  const { showWarning, countdown, continueSession } = useIdleTimer(handleLogout);

  const handleNewPayment = () => {
    setSuccess(false);
    setForm({ recipientName: '', recipientAccount: '', recipientBank: '', swiftCode: '', amount: '', currency: 'ZAR', paymentMethod: 'bank_transfer', reference: '' });
    setErrors({});
  };

  const statusBadge = (status) => {
    if (status === 'Successful') return <span style={s.badgeSuccess}>✅ Successful</span>;
    if (status === 'Declined')   return <span style={s.badgeDeclined}>❌ Declined</span>;
    if (status === 'Smart inContact') return <span style={s.badgeContact}>📞 Smart inContact</span>;
    return <span style={s.badgePending}>⏳ Pending Approval</span>;
  };

  const downloadReceipt = (p) => {
    const curr = currencies.find((c) => c.code === p.currency);
    const sym = curr ? curr.symbol : '';
    const amt = parseFloat(p.amount);
    const admin = parseFloat((amt * FEE_RATE).toFixed(2));
    const delivery = parseFloat((amt * DELIVERY_RATE).toFixed(2));
    const totalAmt = parseFloat((amt + admin + delivery).toFixed(2));
    const method = paymentMethods.find(m => m.id === p.paymentMethod)?.name || 'Bank Transfer';

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header gradient bar
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setFillColor(118, 75, 162);
    doc.rect(0, 35, pageWidth, 5, 'F');

    // Company branding
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('GlobalPay Portal', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('International Payment Transfer | Send money securely across borders', pageWidth / 2, 28, { align: 'center' });

    // Receipt title
    doc.setTextColor(45, 45, 45);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT RECEIPT', pageWidth / 2, 55, { align: 'center' });

    // Divider
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.5);
    doc.line(20, 60, pageWidth - 20, 60);

    // Transaction info
    let y = 72;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);

    const addRow = (label, value) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text(label, 25, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(45, 45, 45);
      doc.text(String(value), 90, y);
      y += 8;
    };

    const addSection = (title) => {
      y += 4;
      doc.setFillColor(247, 247, 251);
      doc.rect(20, y - 5, pageWidth - 40, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(102, 126, 234);
      doc.setFontSize(10);
      doc.text(title, 25, y);
      doc.setTextColor(45, 45, 45);
      y += 12;
    };

    addSection('TRANSACTION DETAILS');
    addRow('Transaction ID:', p.id);
    addRow('Date:', new Date(p.date).toLocaleString());
    addRow('Status:', p.status);
    addRow('Payment Method:', method);

    addSection('SENDER DETAILS');
    addRow('Name:', user.name);
    addRow('Email:', user.email);

    addSection('RECIPIENT DETAILS');
    addRow('Name:', p.recipientName);
    addRow('Account Number:', p.recipientAccount);
    addRow('Bank:', p.recipientBank);
    addRow('Swift Code:', p.swiftCode);

    addSection('PAYMENT BREAKDOWN');
    addRow('Amount:', `${sym}${amt.toFixed(2)} ${p.currency}`);
    addRow('Admin Fee (1.5%):', `${sym}${admin.toFixed(2)}`);
    addRow('Delivery Fee (7%):', `${sym}${delivery.toFixed(2)}`);

    // Total line
    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.line(25, y, pageWidth - 25, y);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total Deducted:', 25, y);
    doc.setTextColor(102, 126, 234);
    doc.text(`${sym}${totalAmt.toFixed(2)} ${p.currency}`, 90, y);
    y += 8;

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    addRow('Reference:', p.reference || 'N/A');

    // Footer
    y += 16;
    doc.setDrawColor(102, 126, 234);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a system-generated receipt from GlobalPay Portal.', pageWidth / 2, y, { align: 'center' });
    doc.text('International Payment Transfer — Send money securely across borders.', pageWidth / 2, y + 5, { align: 'center' });

    // Save
    doc.save(`GlobalPay_Receipt_${p.id}.pdf`);
  };

  return (
    <div style={s.page}>
      {/* Navbar */}
      <div style={s.navbar}>
        <div style={s.brand}>🌐 GlobalPay Portal</div>
        <div style={s.userSection}>
          <div style={s.avatar}>{user.name.charAt(0).toUpperCase()}</div>
          <div style={s.userDetails}>
            <div style={s.userName}>{user.name}</div>
            <div style={s.userEmail}>{user.email}</div>
          </div>
        </div>
        <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      {/* Dashboard */}
      <div style={s.dashboard}>
        <div style={s.dashCard}>
          <div style={s.dashIcon}>📊</div>
          <div style={s.dashValue}>{payments.length}</div>
          <div style={s.dashLabel}>Total Payments</div>
        </div>
        <div style={s.dashCard}>
          <div style={s.dashIcon}>📅</div>
          <div style={s.dashValue}>{payments.filter(p => new Date(p.date).toDateString() === new Date().toDateString()).length}</div>
          <div style={s.dashLabel}>Today's Payments</div>
        </div>
        <div style={s.dashCard}>
          <div style={s.dashIcon}>💰</div>
          <div style={s.dashValue}>R{payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toFixed(2)}</div>
          <div style={s.dashLabel}>Total Amount</div>
        </div>
        <div style={s.dashCard}>
          <div style={s.dashIcon}>⏳</div>
          <div style={s.dashValue}>{payments.filter(p => p.status === 'Pending Approval').length}</div>
          <div style={s.dashLabel}>Pending</div>
        </div>
      </div>

      {/* Payment Card */}
      <div style={s.card}>
        <div style={s.cardTitle}>International Payment Transfer</div>
        <div style={s.cardSubtitle}>Send money securely across borders</div>

        <div style={s.grid}>
          {/* Recipient Name */}
          <div style={s.fieldGroup}>
            <label style={s.label}>Recipient Full Name</label>
            <input
              style={errors.recipientName ? s.inputBoxError : s.inputBox}
              name="recipientName"
              type="text"
              placeholder="e.g. John Smith"
              value={form.recipientName}
              onChange={handleChange}
              maxLength={60}
            />
            {errors.recipientName && <span style={s.errorText}>{errors.recipientName}</span>}
          </div>

          {/* Recipient Account */}
          <div style={s.fieldGroup}>
            <label style={s.label}>Account Number / IBAN</label>
            <input
              style={errors.recipientAccount ? s.inputBoxError : s.inputBox}
              name="recipientAccount"
              type="text"
              inputMode="numeric"
              placeholder="Digits only, e.g. 123456789012"
              value={form.recipientAccount}
              onChange={handleChange}
              maxLength={34}
            />
            {errors.recipientAccount && <span style={s.errorText}>{errors.recipientAccount}</span>}
          </div>

          {/* Bank Name */}
          <div style={s.fieldGroup}>
            <label style={s.label}>Recipient Bank Name</label>
            <select
              style={errors.recipientBank ? s.inputBoxError : s.select}
              name="recipientBank"
              value={form.recipientBank}
              onChange={handleChange}
            >
              <option value="">-- Select a Bank --</option>
              {southAfricanBanks.map((bank) => (
                <option key={bank.name} value={bank.name}>{bank.name}</option>
              ))}
            </select>
            {errors.recipientBank && <span style={s.errorText}>{errors.recipientBank}</span>}
          </div>

          {/* SWIFT Code */}
          <div style={s.fieldGroup}>
            <label style={s.label}>Swift Code</label>
            <input
              style={{ ...s.inputBox, background: '#e9e9f0', color: '#888', cursor: 'not-allowed' }}
              name="swiftCode"
              value={form.swiftCode}
              readOnly
              placeholder="Auto-filled when bank is selected"
            />
            {errors.swiftCode && <span style={s.errorText}>{errors.swiftCode}</span>}
          </div>

          {/* Amount */}
          <div style={s.fieldGroup}>
            <label style={s.label}>Amount</label>
            <input
              style={errors.amount ? s.inputBoxError : s.inputBox}
              name="amount"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 1500.00"
              value={form.amount}
              onChange={handleChange}
              maxLength={13}
            />
            {errors.amount && <span style={s.errorText}>{errors.amount}</span>}
          </div>

          {/* Currency */}
          <div style={s.fieldGroup}>
            <label style={s.label}>Currency</label>
            <select style={s.select} name="currency" value={form.currency} onChange={handleChange}>
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.label}</option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div style={s.fieldGroupFull}>
            <label style={s.label}>Payment Method</label>
            <div style={s.paymentMethods}>
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  style={form.paymentMethod === method.id ? s.methodCardActive : s.methodCard}
                  onClick={() => {
                    setForm({ ...form, paymentMethod: method.id });
                    setErrors({ ...errors, paymentMethod: '' });
                  }}
                >
                  <span style={s.methodIcon}>{method.icon}</span>
                  <span style={s.methodName}>{method.name}</span>
                </div>
              ))}
            </div>
            {errors.paymentMethod && <span style={s.errorText}>{errors.paymentMethod}</span>}
          </div>

          {/* Reference */}
          <div style={s.fieldGroupFull}>
            <label style={s.label}>Payment Reference (optional)</label>
            <input
              style={errors.reference ? s.inputBoxError : s.inputBox}
              name="reference"
              type="text"
              placeholder="e.g. Invoice #1042"
              value={form.reference}
              onChange={handleChange}
              maxLength={100}
            />
            {errors.reference && <span style={s.errorText}>{errors.reference}</span>}
          </div>

          {/* Summary */}
          {amount > 0 && (
            <div style={s.summaryBox}>
              <div style={s.summaryTitle}>Transfer Summary</div>
              <div style={s.summaryRow}><span>Amount</span><span>{selectedCurrency.symbol}{amount.toFixed(2)} {form.currency}</span></div>
              <div style={s.summaryRow}><span>Admin Fee (1.5%)</span><span>{selectedCurrency.symbol}{adminFee.toFixed(2)}</span></div>
              <div style={s.summaryRow}><span>Delivery Fee (7%)</span><span>{selectedCurrency.symbol}{deliveryFee.toFixed(2)}</span></div>
              <div style={s.summaryTotal}><span>Total Deducted</span><span>{selectedCurrency.symbol}{total.toFixed(2)} {form.currency}</span></div>
            </div>
          )}

          {/* Submit */}
          <button
            style={loading ? s.submitBtnDisabled : s.submitBtn}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Processing Payment...' : `Send Payment`}
          </button>
        </div>
      </div>

      {/* Processing notification modal */}
      {success && (
        <div style={s.successOverlay}>
          <div style={s.successCard}>
            <div style={s.successIcon}>🔄</div>
            <div style={s.successTitle}>Transaction Processing</div>
            <div style={s.successSub}>
              Your payment is being processed. Please monitor your banking app's
              notifications and refresh the screen to view the updated status.
            </div>
            <button style={s.successBtn} onClick={() => window.location.reload()}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div style={s.historyCard}>
        <div style={s.historyTitle}>📋 Payment History</div>
        {payments.length === 0 ? (
          <div style={s.emptyHistory}>No payments yet. Your transaction history will appear here.</div>
        ) : (
          <table style={s.historyTable}>
            <thead>
              <tr>
                <th style={s.th}>Date</th>
                <th style={s.th}>Recipient</th>
                <th style={s.th}>Bank</th>
                <th style={s.th}>Amount</th>
                <th style={s.th}>Reference</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {[...payments].reverse().map((p) => (
                <tr key={p.id}>
                  <td style={s.td}>{new Date(p.date).toLocaleDateString()}</td>
                  <td style={s.td}>{p.recipientName}</td>
                  <td style={s.td}>{p.recipientBank}</td>
                  <td style={s.td}>{p.currency} {parseFloat(p.amount).toFixed(2)}</td>
                  <td style={s.td}>{p.reference || '—'}</td>
                  <td style={s.td}>{statusBadge(p.status)}</td>
                  <td style={s.td}>
                    <button style={s.downloadBtn} onClick={() => downloadReceipt(p)}>
                      📥 Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Idle session warning */}
      {showWarning && (
        <div style={s.idleOverlay}>
          <div style={s.idleCard}>
            <div style={s.idleIcon}>⏱️</div>
            <div style={s.idleTitle}>Are you still there?</div>
            <div style={s.idleSub}>You've been inactive. You'll be logged out in</div>
            <div style={s.idleCountdown}>{countdown}s</div>
            <div style={s.idleBtnRow}>
              <button style={s.idleContinueBtn} onClick={continueSession}>
                Continue Session
              </button>
              <button style={s.idleLogoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPortal;
