import { NavLink } from 'react-router-dom';
import { BarChart3, Users, Briefcase } from 'lucide-react';

export default function AdminSidebar() {
  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/admin/users', label: 'Manage Users', icon: Users },
    { path: '/admin/profiles', label: 'Manage Profiles', icon: Briefcase },
  ];

  return (
    <aside className="w-64 bg-purple-700 text-white shadow-xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold">QR Generator</h2>
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
            <item.icon className="w-5 h-5" />
            <span className="font-semibold">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
