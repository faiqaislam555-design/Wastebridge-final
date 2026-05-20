import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../dashboard/components/Sidebar';
import Topbar from '../../dashboard/components/Topbar';
import './SharedLayout.css';

const SharedLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="dashboard-main-wrapper">
        <Topbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SharedLayout;