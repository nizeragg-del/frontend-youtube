import { NavLink, useNavigate } from 'react-router-dom';
import { MessageSquare, Calendar, Settings, LogOut, Clock, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';
import './Sidebar.css';
import logo from '../../../logo.png';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
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
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && (
          <div className="sidebar-logo">
            <img src={logo} alt="Flowyn Logo" className="brand-logo" />
          </div>
        )}
        <button className="sidebar-toggle-btn" onClick={onToggle} title={isCollapsed ? "Expandir" : "Recolher"}>
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>
      
      {!isCollapsed && <div className="sidebar-section-label">PROJETOS</div>}
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Nova Geração">
          <MessageSquare size={18} />
          {!isCollapsed && <span>Nova Geração</span>}
        </NavLink>
        
        <NavLink to="/agendamentos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Automação">
          <Calendar size={18} />
          {!isCollapsed && <span>Automação</span>}
        </NavLink>
        
        <NavLink to="/configuracoes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Configurações">
          <Settings size={18} />
          {!isCollapsed && <span>Configurações</span>}
        </NavLink>
      </nav>

      <div className="sidebar-history-container">
        {!isCollapsed && <div className="sidebar-section-label">GERAÇÕES RECENTES</div>}
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-item" title={item.title}>
              <div className="history-icon">
                <Clock size={14} className="blue-icon" />
              </div>
              {!isCollapsed && <span className="history-text">{item.title}</span>}
              {!isCollapsed && item.count > 0 && <span className="history-badge">{item.count}</span>}
            </div>
          ))}
        </div>
      </div>
      
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout} title="Sair">
          <LogOut size={18} />
          {!isCollapsed && <span>Sair</span>}
          {!isCollapsed && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
