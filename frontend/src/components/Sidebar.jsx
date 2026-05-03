import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/my-profiles', label: 'My Profiles', icon: '💼' },
    { path: '/create-profile', label: 'Create Profile', icon: '➕' },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-indigo-700 to-indigo-900 text-white shadow-xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold">QR Card</h2>
        <p className="text-indigo-200 text-sm">Business Card & Analytics</p>
      </div>

      <nav className="mt-8">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 transition ${
                isActive
                  ? 'bg-indigo-600 border-l-4 border-white'
                  : 'hover:bg-indigo-600'
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
