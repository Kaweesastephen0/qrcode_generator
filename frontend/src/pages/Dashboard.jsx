import { useAuth } from '../context/AuthContext.jsx';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="page-shell">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.fullName || 'User'}</h1>
            <p className="subtitle">Your account is active and ready for QR code generation.</p>
          </div>
          <button className="secondary-button" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="info-grid">
          <div className="info-panel">
            <span>Username</span>
            <strong>{user?.username}</strong>
          </div>
          <div className="info-panel">
            <span>Email</span>
            <strong>{user?.email}</strong>
          </div>
          <div className="info-panel">
            <span>Role</span>
            <strong>{user?.role}</strong>
          </div>
          <div className="info-panel">
            <span>Last login</span>
            <strong>{user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
