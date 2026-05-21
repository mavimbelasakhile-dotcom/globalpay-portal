import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import useIdleTimer from '../hooks/useIdleTimer';

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    fontFamily: "'Segoe UI', sans-serif",
    padding: '30px 20px',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1100px',
    margin: '0 auto 30px auto',
    color: '#fff',
  },
  brand: { fontSize: '20px', fontWeight: '700', letterSpacing: '0.5px' },
  userSection: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', fontWeight: '700', color: '#fff',
  },
  userName: { fontSize: '14px', fontWeight: '700', color: '#fff' },
  userRole: { fontSize: '11px', color: '#fbbf24', fontWeight: '600' },
  logoutBtn: {
    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
    color: '#fff', padding: '8px 16px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
  },
  dashboard: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px',
    maxWidth: '1100px', margin: '0 auto 24px auto',
  },
  dashCard: {
    background: '#fff', borderRadius: '16px', padding: '20px 16px',
    textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  dashIcon: { fontSize: '28px', marginBottom: '8px' },
  dashValue: { fontSize: '22px', fontWeight: '800', color: '#2d2d2d', marginBottom: '4px' },
  dashLabel: { fontSize: '12px', color: '#888', fontWeight: '600' },
  card: {
    maxWidth: '1100px', margin: '0 auto', background: '#fff',
    borderRadius: '20px', padding: '30px 40px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  title: { fontSize: '20px', fontWeight: '700', color: '#2d2d2d', marginBottom: '20px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f7f7fb', color: '#555', fontWeight: '700', borderBottom: '2px solid #e0e0e0' },
  td: { padding: '12px', borderBottom: '1px solid #f0f0f0', color: '#3c3c3c', verticalAlign: 'middle' },
  badgePending: { background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  badgeApproved: { background: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  badgeDeclined: { background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  approveBtn: {
    padding: '6px 12px', background: '#10b981', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '11px',
    fontWeight: '600', cursor: 'pointer', marginRight: '6px',
  },
  declineBtn: {
    padding: '6px 12px', background: '#ef4444', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '11px',
    fontWeight: '600', cursor: 'pointer',
  },
  downloadBtn: {
    padding: '6px 12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '11px',
    fontWeight: '600', cursor: 'pointer', marginLeft: '6px',
  },
  empty: { textAlign: 'center', color: '#aaa', padding: '30px', fontSize: '14px' },
  idleOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  idleCard: { background: '#fff', borderRadius: '20px', padding: '40px 36px', textAlign: 'center', maxWidth: '360px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  idleIcon: { fontSize: '48px', marginBottom: '14px' },
  idleTitle: { fontSize: '20px', fontWeight: '700', color: '#2d2d2d', marginBottom: '8px' },
  idleSub: { fontSize: '14px', color: '#888', marginBottom: '6px' },
  idleCountdown: { fontSize: '32px', fontWeight: '800', color: '#e53e3e', margin: '12px 0 20px' },
  idleBtnRow: { display: 'flex', gap: '12px', justifyContent: 'center' },
  idleContinueBtn: { padding: '12px 24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  idleLogoutBtn: { padding: '12px 24px', background: '#f0f0f0', color: '#555', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user || { name: 'Admin' };

  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);

  const handleLogout = () => navigate('/');
  const { showWarning, countdown, continueSession } = useIdleTimer(handleLogout);

  useEffect(() => {
    axios.get('http://localhost:3001/payments').then(res => setPayments(res.data)).catch(() => {});
    axios.get('http://localhost:3001/users').then(res => setUsers(res.data)).catch(() => {});
  }, []);

  const getUserName = (userId) => {
    const u = users.find(u => u.id === userId);
    return u ? u.name : 'Unknown';
  };

  const handleApprove = async (paymentId) => {
    await axios.patch(`http://localhost:3001/payments/${paymentId}`, { status: 'Successful' });
    setPayments(payments.map(p => p.id === paymentId ? { ...p, status: 'Successful' } : p));
  };

  const handleDecline = async (paymentId) => {
    await axios.patch(`http://localhost:3001/payments/${paymentId}`, { status: 'Declined' });
    setPayments(payments.map(p => p.id === paymentId ? { ...p, status: 'Declined' } : p));
  };

  const downloadInvoice = (p) => {
    const empName = getUserName(p.userId);
    const amt = parseFloat(p.amount);
    const adminFee = parseFloat((amt * 0.015).toFixed(2));
    const deliveryFee = parseFloat((amt * 0.07).toFixed(2));
    const total = parseFloat((amt + adminFee + deliveryFee).toFixed(2));

    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();

    doc.setFillColor(26, 26, 46);
    doc.rect(0, 0, pw, 40, 'F');
    doc.setFillColor(22, 33, 62);
    doc.rect(0, 35, pw, 5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('GlobalPay Portal', pw / 2, 18, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('ADMIN INVOICE', pw / 2, 28, { align: 'center' });

    doc.setTextColor(45, 45, 45);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT INVOICE', pw / 2, 55, { align: 'center' });

    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.5);
    doc.line(20, 60, pw - 20, 60);

    let y = 72;
    doc.setFontSize(10);

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
      doc.rect(20, y - 5, pw - 40, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(102, 126, 234);
      doc.text(title, 25, y);
      doc.setTextColor(45, 45, 45);
      y += 12;
    };

    addSection('TRANSACTION DETAILS');
    addRow('Transaction ID:', p.id);
    addRow('Date:', new Date(p.date).toLocaleString());
    addRow('Status:', p.status);

    addSection('EMPLOYEE');
    addRow('Name:', empName);

    addSection('RECIPIENT');
    addRow('Name:', p.recipientName);
    addRow('Account:', p.recipientAccount);
    addRow('Bank:', p.recipientBank);
    addRow('Swift Code:', p.swiftCode);

    addSection('PAYMENT BREAKDOWN');
    addRow('Amount:', `R${amt.toFixed(2)} ${p.currency}`);
    addRow('Admin Fee (1.5%):', `R${adminFee.toFixed(2)}`);
    addRow('Delivery Fee (7%):', `R${deliveryFee.toFixed(2)}`);

    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.line(25, y, pw - 25, y);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total:', 25, y);
    doc.setTextColor(102, 126, 234);
    doc.text(`R${total.toFixed(2)} ${p.currency}`, 90, y);
    y += 8;

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    addRow('Reference:', p.reference || 'N/A');

    y += 16;
    doc.setDrawColor(102, 126, 234);
    doc.line(20, y, pw - 20, y);
    y += 10;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by GlobalPay Portal Admin Panel.', pw / 2, y, { align: 'center' });

    doc.save(`Invoice_${p.id}.pdf`);
  };

  const statusBadge = (status) => {
    if (status === 'Successful') return <span style={s.badgeApproved}>✅ Approved</span>;
    if (status === 'Declined') return <span style={s.badgeDeclined}>❌ Declined</span>;
    return <span style={s.badgePending}>⏳ Pending</span>;
  };

  const pending = payments.filter(p => p.status === 'Pending Approval').length;
  const approved = payments.filter(p => p.status === 'Successful').length;
  const declined = payments.filter(p => p.status === 'Declined').length;

  return (
    <div style={s.page}>
      <div style={s.navbar}>
        <div style={s.brand}>🛡️ Admin Panel</div>
        <div style={s.userSection}>
          <div style={s.avatar}>A</div>
          <div>
            <div style={s.userName}>{user.name}</div>
            <div style={s.userRole}>ADMINISTRATOR</div>
          </div>
        </div>
        <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      <div style={s.dashboard}>
        <div style={s.dashCard}><div style={s.dashIcon}>📊</div><div style={s.dashValue}>{payments.length}</div><div style={s.dashLabel}>Total Payments</div></div>
        <div style={s.dashCard}><div style={s.dashIcon}>⏳</div><div style={s.dashValue}>{pending}</div><div style={s.dashLabel}>Pending Approval</div></div>
        <div style={s.dashCard}><div style={s.dashIcon}>✅</div><div style={s.dashValue}>{approved}</div><div style={s.dashLabel}>Approved</div></div>
        <div style={s.dashCard}><div style={s.dashIcon}>❌</div><div style={s.dashValue}>{declined}</div><div style={s.dashLabel}>Declined</div></div>
      </div>

      <div style={s.card}>
        <div style={s.title}>All Employee Payments</div>
        {payments.length === 0 ? (
          <div style={s.empty}>No payments have been submitted yet.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Date</th>
                <th style={s.th}>Employee</th>
                <th style={s.th}>Recipient</th>
                <th style={s.th}>Bank</th>
                <th style={s.th}>Amount</th>
                <th style={s.th}>Reference</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...payments].reverse().map((p) => (
                <tr key={p.id}>
                  <td style={s.td}>{new Date(p.date).toLocaleDateString()}</td>
                  <td style={s.td}>{getUserName(p.userId)}</td>
                  <td style={s.td}>{p.recipientName}</td>
                  <td style={s.td}>{p.recipientBank}</td>
                  <td style={s.td}>{p.currency} {parseFloat(p.amount).toFixed(2)}</td>
                  <td style={s.td}>{p.reference || '—'}</td>
                  <td style={s.td}>{statusBadge(p.status)}</td>
                  <td style={s.td}>
                    {p.status === 'Pending Approval' ? (
                      <>
                        <button style={s.approveBtn} onClick={() => handleApprove(p.id)}>Approve</button>
                        <button style={s.declineBtn} onClick={() => handleDecline(p.id)}>Decline</button>
                      </>
                    ) : '—'}
                    <button style={s.downloadBtn} onClick={() => downloadInvoice(p)}>📥 Invoice</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showWarning && (
        <div style={s.idleOverlay}>
          <div style={s.idleCard}>
            <div style={s.idleIcon}>⏱️</div>
            <div style={s.idleTitle}>Are you still there?</div>
            <div style={s.idleSub}>You'll be logged out in</div>
            <div style={s.idleCountdown}>{countdown}s</div>
            <div style={s.idleBtnRow}>
              <button style={s.idleContinueBtn} onClick={continueSession}>Continue</button>
              <button style={s.idleLogoutBtn} onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
