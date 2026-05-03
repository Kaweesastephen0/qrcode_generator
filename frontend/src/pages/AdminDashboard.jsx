import { useAuth } from '../context/AuthContext.jsx';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="page-shell">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div>
            <h1>Admin Portal</h1>
            <p className="subtitle">Manage QR Code Business Card Generator resources and view your account details.</p>
          </div>
          <button className="secondary-button" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="info-grid">
          <div className="info-panel">
            <span>Admin Email</span>
            <strong>{user?.email}</strong>
          </div>
          <div className="info-panel">
            <span>Username</span>
            <strong>{user?.username}</strong>
          </div>
          <div className="info-panel">
            <span>Role</span>
            <strong>{user?.role}</strong>
          </div>
          <div className="info-panel">
            <span>Account Active</span>
            <strong>{user?.isActive ? 'Yes' : 'No'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
