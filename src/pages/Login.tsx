import { useState } from 'react';
import { Video, Mail, Lock, ArrowRight } from 'lucide-react';
import './Login.css';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="login-page">
      <div className="login-card serene-card">
        <div className="login-header">
          <div className="logo-section">
            <Video size={32} className="logo-icon" />
            <h1>GVE</h1>
          </div>
          <p className="login-subtitle">Gerador de Vídeos Evangélicos</p>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(true)}
          >
            Entrar
          </button>
          <button 
            className={`tab ${!isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(false)}
          >
            Criar Conta
          </button>
        </div>

        <div className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label>Nome Completo</label>
              <div className="input-with-icon">
                <input type="text" placeholder="Seu nome" />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input type="email" placeholder="exemplo@email.com" />
            </div>
          </div>

          <div className="form-group">
            <label>Senha</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input type="password" placeholder="••••••••" />
            </div>
          </div>

          <button className="login-btn">
            <span>{isLogin ? 'Entrar no Painel' : 'Criar minha conta'}</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {isLogin && (
          <div className="login-footer">
            <a href="#">Esqueceu sua senha?</a>
          </div>
        )}
      </div>
      
      <p className="page-footer-text">© 2026 GVE - Transformando Fé em Conteúdo.</p>
    </div>
  );
};

export default Login;
