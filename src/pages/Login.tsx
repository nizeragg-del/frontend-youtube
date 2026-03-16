import { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
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
      <div className="login-card serene-card glass-effect">
        <div className="login-header">
          <div className="logo-section">
            <img src={logo} alt="Flowyn Logo" className="login-brand-logo" />
            <div className="logo-text-group">
              <span className="logo-text">flowyn</span>
              <span className="logo-subtitle">IA AUTOMAÇÃO</span>
            </div>
          </div>
          <p className="login-subtitle">Transforme sua fé em conteúdo inspirador.</p>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(true); setError(null); }}
          >
            Entrar
          </button>
          <button 
            className={`tab ${!isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(false); setError(null); }}
          >
            Criar Conta
          </button>
        </div>

        <form className="login-form" onSubmit={handleAuth}>
          {error && (
            <div className="error-message auth-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label>Nome Completo</label>
              <div className="input-with-icon">
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

          <div className="form-group">
            <label>Email</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input 
                type="email" 
                placeholder="exemplo@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Senha</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>{isLogin ? 'Entrar no Painel' : 'Criar minha conta'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {isLogin && (
          <div className="login-footer">
            <button className="link-btn">Esqueceu sua senha?</button>
          </div>
        )}
      </div>
      
      <p className="page-footer-text">© 2024 Flowyn IA - Tecnologia a serviço da Palavra.</p>
    </div>
  );
};

export default Login;
