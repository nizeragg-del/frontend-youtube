import { NavLink, useNavigate } from 'react-router-dom';
import { MessageSquare, Calendar, Settings, LogOut, Zap, Clock, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Mock data for now, will connect to DB later if table exists
    setHistory([
      { id: '1', title: 'Generate a Cinematic Image on Bibl...', status: 'complete', count: 0 },
      { id: '2', title: 'Generate High-Quality Cinem...', status: 'complete', count: 2 },
      { id: '3', title: 'Generate Cinematic Image fro...', status: 'complete', count: 3 },
      { id: '4', title: 'Generate Cinematic Image Ba...', status: 'complete', count: 2 },
    ]);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon-container">
          <Zap size={24} fill="currentColor" />
        </div>
        <div className="logo-text-group">
          <span className="logo-text">flowyn</span>
          <span className="logo-subtitle">Automação</span>
        </div>
      </div>
      
      <div className="sidebar-section-label orange">Projetos</div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item orange-nav ${isActive ? 'active' : ''}`}>
          <MessageSquare size={18} />
          <span>Início / Chat</span>
        </NavLink>
        
        <NavLink to="/agendamentos" className={({ isActive }) => `nav-item orange-nav ${isActive ? 'active' : ''}`}>
          <Calendar size={18} />
          <span>Agendamentos</span>
        </NavLink>
        
        <NavLink to="/configuracoes" className={({ isActive }) => `nav-item orange-nav ${isActive ? 'active' : ''}`}>
          <Settings size={18} />
          <span>Configurações API</span>
        </NavLink>
      </nav>

      <div className="sidebar-history-container">
        <div className="sidebar-section-label blue">Todas as tarefas</div>
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-item">
              <div className="history-icon">
                <Clock size={14} className="blue-icon" />
              </div>
              <span className="history-text">{item.title}</span>
              {item.count > 0 && <span className="history-badge">{item.count}</span>}
            </div>
          ))}
        </div>
      </div>
      
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Sair</span>
          <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
