import { NavLink } from 'react-router-dom';

export default function AdminSidebar() {
  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Manage Users', icon: '👥' },
    { path: '/admin/profiles', label: 'Manage Profiles', icon: '💼' },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-purple-700 to-purple-900 text-white shadow-xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold">QR Card</h2>
        <p className="text-purple-200 text-sm">Admin Dashboard</p>
      </div>

      <nav className="mt-8">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 transition ${
                isActive
                  ? 'bg-purple-600 border-l-4 border-white'
                  : 'hover:bg-purple-600'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-semibold">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
