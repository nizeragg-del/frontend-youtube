import { NavLink, useNavigate } from 'react-router-dom';
import { MessageSquare, Calendar, Settings, LogOut, Clock, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';
import './Sidebar.css';
import logo from '../../../logo.png';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Mock data for now
    setHistory([
      { id: '1', title: 'Mensagem motivacional de Ro...', status: 'complete', count: 0 },
      { id: '2', title: 'Estudo visual sobre Parábo...', status: 'complete', count: 2 },
      { id: '3', title: 'Explicação do Salmo 23 con...', status: 'complete', count: 3 },
      { id: '4', title: 'Vídeo curto do Versículo do...', status: 'complete', count: 2 },
    ]);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="Flowyn Logo" className="brand-logo" />
      </div>
      
      <div className="sidebar-section-label">PROJETOS</div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <MessageSquare size={18} />
          <span>Nova Geração</span>
        </NavLink>
        
        <NavLink to="/agendamentos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Calendar size={18} />
          <span>Automação</span>
        </NavLink>
        
        <NavLink to="/configuracoes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={18} />
          <span>Configurações</span>
        </NavLink>
      </nav>

      <div className="sidebar-history-container">
        <div className="sidebar-section-label">GERAÇÕES RECENTES</div>
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
