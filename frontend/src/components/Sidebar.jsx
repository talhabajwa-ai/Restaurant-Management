import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaUtensils, 
  FaChair, 
  FaClipboardList, 
  FaReceipt, 
  FaUsers, 
  FaChartBar, 
  FaSignOutAlt,
  FaBars
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard', roles: ['admin', 'manager', 'waiter', 'cashier'] },
    { path: '/menu', icon: FaUtensils, label: 'Menu', roles: ['admin', 'manager', 'waiter'] },
    { path: '/tables', icon: FaChair, label: 'Tables', roles: ['admin', 'manager', 'waiter'] },
    { path: '/orders', icon: FaClipboardList, label: 'Orders', roles: ['admin', 'manager', 'waiter'] },
    { path: '/billing', icon: FaReceipt, label: 'Billing', roles: ['admin', 'manager', 'cashier'] },
    { path: '/staff', icon: FaUsers, label: 'Staff', roles: ['admin', 'manager'] },
    { path: '/reports', icon: FaChartBar, label: 'Reports', roles: ['admin', 'manager'] },
  ];

  const filteredMenuItems = menuItems.filter(item => hasRole(item.roles));

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-dark-800 rounded-lg text-white"
      >
        <FaBars size={24} />
      </button>

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-dark-800 border-r border-dark-700
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-dark-700">
            <h1 className="text-2xl font-bold text-white">RMS</h1>
            <p className="text-sm text-gray-400 mt-1">Restaurant Management</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {filteredMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => 
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-dark-700">
            <div className="mb-4 px-4">
              <p className="text-white font-medium">{user?.name}</p>
              <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <FaSignOutAlt size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;