import { User, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  return (
    <header className="navbar glass-accent">
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <Video size={28} className="logo-icon" />
            <span className="logo-text">Gerador de Vídeos Evangélicos</span>
          </div>
        </div>

        <nav className="navbar-center">
          {/* Menu central opcional ou simplificado */}
        </nav>
        
        <div className="navbar-right">
          {!user && (
            <button className="auth-btn-primary" onClick={() => navigate('/login')}>Criar Conta</button>
          )}
          <div className="user-profile" onClick={() => navigate('/configuracoes')} style={{ cursor: 'pointer' }}>
            <span className="user-email">{user?.email?.split('@')[0]}</span>
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
