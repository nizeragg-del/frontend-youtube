import { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../../logo.png';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });
        if (authError) throw authError;
        alert('Conta criada com sucesso! Verifique seu email para confirmar.');
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card-modern serene-card">
          <header className="login-header">
            <img src={logo} alt="Flowyn Logo" className="login-logo-img" />
            <h1 className="login-title">{isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}</h1>
            <p className="login-subtitle">A plataforma de IA para vídeos virais.</p>
          </header>

          <div className="auth-tabs">
            <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Entrar</button>
            <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Cadastrar</button>
          </div>

          <form className="auth-form" onSubmit={handleAuth}>
            {error && (
              <div className="auth-error-box">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {!isLogin && (
              <div className="modern-input-group">
                <label>Nome Completo</label>
                <div className="input-field-wrapper">
                  <User size={18} className="field-icon" />
                  <input 
                    type="text" 
                    placeholder="Seu nome" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="modern-input-group">
              <label>E-mail</label>
              <div className="input-field-wrapper">
                <Mail size={18} className="field-icon" />
                <input 
                  type="email" 
                  placeholder="exemplo@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="modern-input-group">
              <label>Senha</label>
              <div className="input-field-wrapper">
                <Lock size={18} className="field-icon" />
                <input 
                  type="password" 
                  placeholder="********" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>{isLogin ? 'Entrar no Hub' : 'Iniciar agora'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {isLogin && <button className="forgot-password-link">Esqueci minha senha</button>}
        </div>
        
        <footer className="login-footer-text">
          <p>© 2024 Flowyn AI. Estúdio de Geração Inteligente.</p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
