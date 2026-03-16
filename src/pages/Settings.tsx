import { useState, useEffect } from 'react';
import { Check, AlertTriangle, Save, Youtube } from 'lucide-react';
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

  if (loading) return <div className="settings-container"><p>Carregando configurações...</p></div>;

  return (
    <div className="settings-container">
      <header className="page-header">
        <div>
          <h1>Configurações de API</h1>
          <p className="subtitle">Conecte os motores que dão vida aos seus vídeos.</p>
        </div>
      </header>

      <div className="apis-grid">
        {/* YouTube API Only */}
        <div className="api-card serene-card youtube-card" style={{ gridColumn: '1 / -1' }}>
          <div className="api-header">
            <div className="api-info">
              <Youtube size={24} className="api-icon youtube" />
              <h3>Conexão YouTube</h3>
            </div>
            <div className={`status-label ${ytRefreshToken ? 'connected' : 'error'}`}>
              {ytRefreshToken ? <Check size={14} /> : <AlertTriangle size={14} />}
              {ytRefreshToken ? 'Conta Vinculada' : 'Ação Necessária'}
            </div>
          </div>
          <p className="api-desc">Conecte seu canal para permitir postagens automáticas de Shorts de alta qualidade.</p>
          
          <div className="api-actions" style={{ marginTop: '20px' }}>
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
               <div className="error-box" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e74c3c', fontSize: '0.9rem' }}>
                 <AlertTriangle size={18} />
                 <span>Configurações globais de API (VITE_YOUTUBE_CLIENT_ID) ausentes no ambiente.</span>
               </div>
            )}
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className="save-bar serene-card glass-accent">
          <p>Você tem alterações não salvas.</p>
          <button className="save-btn" onClick={() => saveConfigs()} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Todas as Configurações'}
            <Save size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Settings;
