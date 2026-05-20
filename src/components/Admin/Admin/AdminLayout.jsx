import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import '../../dashboard/styles/Dashboard.css'; // Inherits base dashboard styling
import './AdminLayout.css';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="dashboard-main-wrapper">
        <AdminTopbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
