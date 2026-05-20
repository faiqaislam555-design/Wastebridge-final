import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../styles/Dashboard.css';

const GeneratorLayout = () => {
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

export default GeneratorLayout;
