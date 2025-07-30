import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 py-2 px-2 ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
        }`}
        
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
