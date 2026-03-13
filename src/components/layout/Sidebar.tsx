import { NavLink, useNavigate } from 'react-router-dom';
import { MessageSquare, Calendar, Settings, LogOut, Video } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Video size={28} className="logo-icon" />
        <span className="logo-text">GVE</span>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <MessageSquare size={20} />
          <span>Início / Chat</span>
        </NavLink>
        
        <NavLink to="/agendamentos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Calendar size={20} />
          <span>Agendamentos</span>
        </NavLink>
        
        <NavLink to="/configuracoes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Configurações API</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
