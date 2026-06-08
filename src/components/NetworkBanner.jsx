import React from 'react';
import useNetworkStatus from '../hooks/useNetworkStatus';

const styles = {
  offline: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    background: '#dc2626',
    color: '#fff',
    padding: '10px 20px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '600',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 2px 12px rgba(220,38,38,0.4)',
  },
  reconnected: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    background: '#16a34a',
    color: '#fff',
    padding: '10px 20px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '600',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 2px 12px rgba(22,163,74,0.4)',
  },
};

const NetworkBanner = () => {
  const { isOnline, wasOffline } = useNetworkStatus();

  if (!isOnline) {
    return (
      <div style={styles.offline}>
        ⚠️ No internet connection. Please check your network.
      </div>
    );
  }

  if (wasOffline) {
    return (
      <div style={styles.reconnected}>
        ✅ Connection restored.
      </div>
    );
  }

  return null;
};

export default NetworkBanner;
