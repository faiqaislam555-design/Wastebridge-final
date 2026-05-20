import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DisposalSidebar from './DisposalSidebar';
import DisposalTopbar from './DisposalTopbar';
import { DisposalProvider } from './DisposalContext';
import '../../dashboard/styles/Dashboard.css';
import './DisposalLayout.css';

const DisposalLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <DisposalProvider>
      <div className="dashboard-layout">
        <DisposalSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="dashboard-main-wrapper">
          <DisposalTopbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="dashboard-content">
            <Outlet />
          </main>
        </div>
      </div>
    </DisposalProvider>
  );
};

export default DisposalLayout;
