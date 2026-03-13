import { User, Video } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <header className="navbar glass-accent">
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="navbar-logo">
            <Video size={28} className="logo-icon" />
            <span className="logo-text">Gerador de Vídeos Evangélicos</span>
          </div>
        </div>

        <nav className="navbar-center">
          <NavLink to="/" className="nav-link">Início</NavLink>
          <NavLink to="/agendamentos" className="nav-link">Meus Vídeos</NavLink>
          <NavLink to="/modelos" className="nav-link">Modelos</NavLink>
          <NavLink to="/suporte" className="nav-link">Suporte</NavLink>
        </nav>
        
        <div className="navbar-right">
          <button className="auth-btn-primary">Criar Conta</button>
          <div className="user-profile">
            <div className="avatar">
              <User size={20} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
