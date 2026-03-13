import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <div className="layout-root">
      <Sidebar />
      <div className="layout-container">
        <Navbar />
        <main className="page-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
