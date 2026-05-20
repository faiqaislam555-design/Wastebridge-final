import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SharedSidebar from './SharedSidebar';
import SharedTopbar from './SharedTopbar';
import '../../dashboard/styles/Dashboard.css';
import './SharedLayout.css';

const SharedLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <SharedSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="dashboard-main-wrapper">
        <SharedTopbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SharedLayout;
