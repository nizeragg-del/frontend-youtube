import { useState, useEffect, useRef } from 'react';
import { Shield, Key, Check, AlertTriangle, Save, Youtube, Settings as SettingsIcon, Loader2, Play, Pause, User, Volume2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import './Settings.css';

const VOICES = [
  { id: 'tc_5f8d7b0de146f10007b8042f', name: 'Camila', gender: 'Feminino', desc: 'Narradora calma e inspiradora. Ideal para mensagens de fé.', preview: '/assets/previews/camila.mp3' },
  { id: 'tc_61b9a899a28a0b3f64b21d4f', name: 'Carlos', gender: 'Masculino', desc: 'Voz robusta e versátil para narrações impactantes.', preview: '/assets/previews/carlos.mp3' },
  { id: 'tc_6777669145604e14c7ff8f03', name: 'Victoria', gender: 'Feminino', desc: 'Tom profissional e suave, excelente para vídeos globais.', preview: '/assets/previews/victoria.mp3' },
  { id: 'tc_6837b58f80ceeb17115bb771', name: 'Walter', gender: 'Masculino', desc: 'Voz madura e confiável, perfeita para mensagens profundas.', preview: '/assets/previews/walter.mp3' },
  { id: 'tc_684a5a7ba2ce934624b59c6e', name: 'Nia', gender: 'Feminino', desc: 'Voz jovem e energética para conteúdos dinâmicos.', preview: '/assets/previews/nia.mp3' },
  { id: 'tc_686dc45bbd6351e06ee64daf', name: 'Elise', gender: 'Feminino', desc: 'Narração acolhedora e amigável.', preview: '/assets/previews/elise.mp3' }
];

const LANGUAGES = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Alemão'];

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
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [voiceLanguage, setVoiceLanguage] = useState(LANGUAGES[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        if (data.voice_id) setSelectedVoice(data.voice_id);
        if (data.voice_language) setVoiceLanguage(data.voice_language);
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
          voice_id: selectedVoice,
          voice_language: voiceLanguage,
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

  const togglePreview = (voice: typeof VOICES[0]) => {
    if (playingVoice === voice.id) {
      audioRef.current?.pause();
      setPlayingVoice(null);
    } else {
      // Parar qualquer áudio anterior
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(voice.preview);
      audio.onended = () => setPlayingVoice(null);
      audio.onerror = () => {
        setPlayingVoice(null);
        alert('Prévia de áudio não encontrada para esta voz.');
      };
      audio.play().catch(err => {
        console.error('Erro ao tocar áudio:', err);
        setPlayingVoice(null);
      });
      audioRef.current = audio;
      setPlayingVoice(voice.id);
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

      <div className="settings-section-divider">
        <h2 className="section-title"><Volume2 size={24} /> Configurações de Voz</h2>
        <p className="section-subtitle">Ajuste o idioma e a voz que o motor deve utilizar.</p>
      </div>

      <div className="voice-config-row">
        <div className="form-group lang-select-group">
          <label>Idioma da Narração</label>
          <select 
            className="premium-input" 
            value={voiceLanguage} 
            onChange={(e) => { setVoiceLanguage(e.target.value); setHasChanges(true); }}
          >
            {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>
        </div>
      </div>

      <div className="voice-gallery">
        {VOICES.map((voice) => (
          <div 
            key={voice.id} 
            className={`voice-card premium-card ${selectedVoice === voice.id ? 'selected-voice' : ''}`}
            onClick={() => { setSelectedVoice(voice.id); setHasChanges(true); }}
          >
            <div className="voice-card-header">
              <div className="voice-main-info">
                <div className={`voice-avatar ${voice.gender === 'Feminino' ? 'pink-bg' : 'blue-bg'}`}>
                  <User size={20} />
                </div>
                <div className="voice-name-group">
                  <h4>{voice.name}</h4>
                  <span className="voice-tag">{voice.gender}</span>
                </div>
              </div>
              <button 
                className={`preview-btn ${playingVoice === voice.id ? 'playing' : ''}`}
                onClick={(e) => { e.stopPropagation(); togglePreview(voice); }}
                type="button"
              >
                {playingVoice === voice.id ? <Pause size={18} /> : <Play size={18} />}
              </button>
            </div>
            
            <p className="voice-desc">{voice.desc}</p>
            
            <div className="voice-select-indicator">
              {selectedVoice === voice.id ? (
                <div className="selected-badge"><Check size={14} /> Selecionado</div>
              ) : (
                <div className="unselected-label">Clique para selecionar</div>
              )}
            </div>
          </div>
        ))}
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
