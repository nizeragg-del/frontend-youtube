import { useState, useEffect } from 'react';
import { Shield, Key, Check, AlertTriangle, Save, Youtube, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import './Settings.css';

const YoutubeConnectButton = ({ 
  clientId, 
  clientSecret, 
  onTokensReceived 
}: { 
  clientId: string; 
  clientSecret: string; 
  onTokensReceived: (token: string) => void;
}) => {
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/youtube.upload',
    onSuccess: async (codeResponse) => {
      setLoading(true);
      try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code: codeResponse.code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: 'postmessage',
            grant_type: 'authorization_code'
          })
        });
        const data = await response.json();
        if (data.refresh_token) {
          onTokensReceived(data.refresh_token);
        } else {
          console.error("Token response:", data);
          alert('Não foi possível obter o Refresh Token. Certifique-se de autorizar o aplicativo.');
        }
      } catch (err) {
        console.error('Erro na troca de código:', err);
        alert('Erro ao conectar ao YouTube.');
      } finally {
        setLoading(false);
      }
    },
    onError: errorResponse => {
      console.error('Login falhou:', errorResponse);
      alert('Login falhou. Verifique se o Client ID é válido e a URI está autorizada.');
    }
  });

  return (
    <button 
      className="yt-connect-btn" 
      onClick={() => login()} 
      disabled={loading}
      type="button"
    >
      {loading ? 'Conectando...' : 'Conectar YouTube'}
    </button>
  );
};

const Settings: React.FC = () => {
  const [manusKey, setManusKey] = useState('');
  const [typecastKey, setTypecastKey] = useState('');
  const [ytRefreshToken, setYtRefreshToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_configs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setManusKey(data.manus_api_key || '');
        setTypecastKey(data.typecast_api_key || '');
        setYtRefreshToken(data.youtube_refresh_token || '');
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveConfigs = async (newToken?: string) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Você precisa estar logado para salvar as configurações.');
        return;
      }

      const { error } = await supabase
        .from('user_configs')
        .upsert({
          user_id: user.id,
          manus_api_key: manusKey,
          typecast_api_key: typecastKey,
          youtube_refresh_token: newToken || ytRefreshToken,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setHasChanges(false);
      if (newToken) {
        alert('YouTube conectado e salvo com sucesso!');
      } else {
        alert('Configurações salvas!');
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar as configurações.');
    } finally {
      setSaving(false);
    }
  };

  // Pegamos as chaves globais do ambiente (Vercel/Vite)
  const GLOBAL_YT_CLIENT_ID = import.meta.env.VITE_YOUTUBE_CLIENT_ID;
  const GLOBAL_YT_CLIENT_SECRET = import.meta.env.VITE_YOUTUBE_CLIENT_SECRET;

  if (loading) return (
    <div className="settings-container loading-container">
      <Loader2 size={40} className="animate-spin" />
      <p>Carregando configurações...</p>
    </div>
  );

  return (
    <div className="settings-container">
      <header className="page-header">
        <div className="header-content">
          <div className="header-icon-box">
            <SettingsIcon size={32} />
          </div>
          <div className="header-text">
            <h1>Configurações de API</h1>
            <p className="subtitle">Conecte os motores que dão vida aos seus vídeos automáticos.</p>
          </div>
        </div>
      </header>

      <div className="apis-grid">
        {/* Manus AI */}
        <div className="api-card premium-card teal-border">
          <div className="card-glow teal-glow"></div>
          <div className="api-header">
            <div className="api-info">
              <div className="icon-circle teal-bg">
                <Shield size={24} />
              </div>
              <div className="title-group">
                <h3>Manus AI</h3>
                <p className="api-desc">Motor de roteiros e imagens</p>
              </div>
            </div>
            <div className={`status-badge ${manusKey ? 'connected' : 'error'}`}>
              {manusKey ? 'Ativo' : 'Pendente'}
            </div>
          </div>
          
          <div className="form-group">
            <label><Key size={14} /> Chave da API</label>
            <div className="input-with-icon">
              <input 
                type="password" 
                className="premium-input" 
                value={manusKey}
                onChange={(e) => { setManusKey(e.target.value); setHasChanges(true); }}
                placeholder="sk-..."
              />
              {manusKey && <Check size={16} className="valid-icon" />}
            </div>
          </div>
        </div>

        {/* Typecast AI */}
        <div className="api-card premium-card blue-border">
          <div className="card-glow blue-glow"></div>
          <div className="api-header">
            <div className="api-info">
              <div className="icon-circle blue-bg">
                <Shield size={24} />
              </div>
              <div className="title-group">
                <h3>Typecast AI</h3>
                <p className="api-desc">Narração realista premium</p>
              </div>
            </div>
            <div className={`status-badge ${typecastKey ? 'connected' : 'error'}`}>
              {typecastKey ? 'Ativo' : 'Pendente'}
            </div>
          </div>
          
          <div className="form-group">
            <label><Key size={14} /> Chave da API</label>
            <div className="input-with-icon">
              <input 
                type="password" 
                className="premium-input" 
                value={typecastKey}
                onChange={(e) => { setTypecastKey(e.target.value); setHasChanges(true); }}
                placeholder="Insira sua chave aqui"
              />
              {typecastKey && <Check size={16} className="valid-icon" />}
            </div>
          </div>
        </div>

        {/* YouTube API */}
        <div className="api-card premium-card red-border youtube-card">
          <div className="card-glow red-glow"></div>
          <div className="api-header">
            <div className="api-info">
              <div className="icon-circle red-bg">
                <Youtube size={24} />
              </div>
              <div className="title-group">
                <h3>YouTube Automation</h3>
                <p className="api-desc">Publicação de Shorts</p>
              </div>
            </div>
            <div className={`status-badge ${ytRefreshToken ? 'connected' : 'error'}`}>
              {ytRefreshToken ? 'Conectado' : 'Desconectado'}
            </div>
          </div>
          
          <div className="yt-actions-container">
            {GLOBAL_YT_CLIENT_ID && GLOBAL_YT_CLIENT_SECRET ? (
              <GoogleOAuthProvider clientId={GLOBAL_YT_CLIENT_ID}>
                <YoutubeConnectButton 
                  clientId={GLOBAL_YT_CLIENT_ID} 
                  clientSecret={GLOBAL_YT_CLIENT_SECRET}
                  onTokensReceived={(token) => {
                    setYtRefreshToken(token);
                    saveConfigs(token);
                  }}
                />
              </GoogleOAuthProvider>
            ) : (
               <div className="api-error-box">
                 <AlertTriangle size={18} />
                 <span>Configurações globais ausentes no servidor.</span>
               </div>
            )}
          </div>
        </div>
      </div>

      <div className={`floating-save-bar ${hasChanges ? 'visible' : ''}`}>
        <div className="save-bar-content glass-effect">
          <div className="save-bar-text">
            <h4>Alterações detectadas</h4>
            <p>Salve para aplicar as novas chaves ao motor.</p>
          </div>
          <button className="premium-save-btn" onClick={() => saveConfigs()} disabled={saving}>
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <span>Salvar Tudo</span>
                <Save size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
