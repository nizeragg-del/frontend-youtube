import { useState, useEffect, useRef } from 'react';
import { Shield, Key, AlertTriangle, Save, Youtube, Loader2, Play, Pause, User, Volume2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import './Settings.css';

const VOICES = [
  { id: 'tc_5f8d7b0de146f10007b8042f', name: 'Camila', gender: 'Feminino', preview: '/assets/previews/camila.mp3' },
  { id: 'tc_61b9a899a28a0b3f64b21d4f', name: 'Carlos', gender: 'Masculino', preview: '/assets/previews/carlos.mp3' },
  { id: 'tc_6777669145604e14c7ff8f03', name: 'Victoria', gender: 'Feminino', preview: '/assets/previews/victoria.mp3' },
  { id: 'tc_6837b58f80ceeb17115bb771', name: 'Walter', gender: 'Masculino', preview: '/assets/previews/walter.mp3' },
  { id: 'tc_684a5a7ba2ce934624b59c6e', name: 'Nia', gender: 'Feminino', preview: '/assets/previews/nia.mp3' },
  { id: 'tc_686dc45bbd6351e06ee64daf', name: 'Elise', gender: 'Feminino', preview: '/assets/previews/elise.mp3' }
];

const LANGUAGES = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Alemão'];

const YoutubeConnectButton = ({ clientId, clientSecret, onTokensReceived }: any) => {
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
        if (data.refresh_token) onTokensReceived(data.refresh_token);
      } catch (err) {
        alert('Erro ao conectar ao YouTube.');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <button className="modern-yt-btn" onClick={() => login()} disabled={loading}>
      <Youtube size={18} />
      {loading ? 'Conectando...' : 'Conectar Conta do YouTube'}
    </button>
  );
};

const Settings: React.FC = () => {
  const [manusKey, setManusKey] = useState('');
  const [typecastKey, setTypecastKey] = useState('');
  const [showManus, setShowManus] = useState(false);
  const [showTypecast, setShowTypecast] = useState(false);
  const [ytRefreshToken, setYtRefreshToken] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [voiceLanguage, setVoiceLanguage] = useState(LANGUAGES[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { fetchConfigs(); }, []);

  const fetchConfigs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('user_configs').select('*').eq('user_id', user.id).single();
      if (data) {
        setManusKey(data.manus_api_key || '');
        setTypecastKey(data.typecast_api_key || '');
        setYtRefreshToken(data.youtube_refresh_token || '');
        if (data.voice_id) setSelectedVoice(data.voice_id);
        if (data.voice_language) setVoiceLanguage(data.voice_language);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const saveConfigs = async (newToken?: string) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('user_configs').upsert({
        user_id: user.id,
        manus_api_key: manusKey,
        typecast_api_key: typecastKey,
        youtube_refresh_token: newToken || ytRefreshToken,
        voice_id: selectedVoice,
        voice_language: voiceLanguage,
        updated_at: new Date().toISOString()
      });
      setHasChanges(false);
      alert('Configurações salvas!');
    } catch (err) { alert('Erro ao salvar.'); } finally { setSaving(false); }
  };

  const togglePreview = (voice: any) => {
    if (playingVoice === voice.id) {
      audioRef.current?.pause();
      setPlayingVoice(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(voice.preview);
      audio.onended = () => setPlayingVoice(null);
      audio.play();
      audioRef.current = audio;
      setPlayingVoice(voice.id);
    }
  };

  const GLOBAL_YT_CLIENT_ID = import.meta.env.VITE_YOUTUBE_CLIENT_ID;
  const GLOBAL_YT_CLIENT_SECRET = import.meta.env.VITE_YOUTUBE_CLIENT_SECRET;

  if (loading) return <div className="loading-state-full"><Loader2 size={32} className="animate-spin" /></div>;

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1 className="page-title">Configurações Gerais</h1>
        <p className="page-description">Gerencie suas chaves de API e preferências globais.</p>
      </header>

      <div className="settings-grid-layout">
        <div className="settings-main-column">
          <section className="settings-card-modern serene-card">
            <div className="card-header-modern">
               <Shield size={20} className="text-blue" />
               <h2>Motores de IA</h2>
            </div>
            
            <div className="input-group-modern">
              <label>Chave API Manus (Roteiro & Imagens)</label>
              <div className="modern-input-wrapper">
                <Key size={16} className="input-icon-left" />
                <input 
                  type={showManus ? "text" : "password"} 
                  value={manusKey} 
                  onChange={(e) => { setManusKey(e.target.value); setHasChanges(true); }}
                  placeholder="sk-..."
                />
                <button className="eye-toggle" onClick={() => setShowManus(!showManus)}>
                  {showManus ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="input-group-modern">
              <label>Chave API Typecast (Narração)</label>
              <div className="modern-input-wrapper">
                <Key size={16} className="input-icon-left" />
                <input 
                  type={showTypecast ? "text" : "password"} 
                  value={typecastKey} 
                  onChange={(e) => { setTypecastKey(e.target.value); setHasChanges(true); }}
                  placeholder="token..."
                />
                <button className="eye-toggle" onClick={() => setShowTypecast(!showTypecast)}>
                  {showTypecast ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </section>

          <section className="settings-card-modern serene-card">
            <div className="card-header-modern">
               <Youtube size={20} className="text-red" />
               <h2>YouTube Automation</h2>
            </div>
            <p className="card-sub-p">Conecte seu canal para permitir postagens automáticas de Shorts.</p>
            
            <div className="yt-status-row">
              <div className={`status-pill ${ytRefreshToken ? 'active' : ''}`}>
                <div className="status-dot"></div>
                {ytRefreshToken ? 'Canal Conectado' : 'Desconectado'}
              </div>
              
              {GLOBAL_YT_CLIENT_ID && GLOBAL_YT_CLIENT_SECRET ? (
                <GoogleOAuthProvider clientId={GLOBAL_YT_CLIENT_ID}>
                  <YoutubeConnectButton 
                    clientId={GLOBAL_YT_CLIENT_ID} 
                    clientSecret={GLOBAL_YT_CLIENT_SECRET}
                    onTokensReceived={(token: string) => { setYtRefreshToken(token); saveConfigs(token); }}
                  />
                </GoogleOAuthProvider>
              ) : (
                <div className="error-badge-sm"><AlertTriangle size={14} /> ID do Cliente ausente</div>
              )}
            </div>
          </section>

          <section className="settings-card-modern serene-card">
            <div className="card-header-modern">
               <Volume2 size={20} className="text-blue" />
               <h2>Preferências de Voz Padrão</h2>
            </div>

            <div className="form-row-modern">
               <div className="input-group-modern">
                  <label>Idioma</label>
                  <select value={voiceLanguage} onChange={(e) => { setVoiceLanguage(e.target.value); setHasChanges(true); }}>
                    {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                  </select>
               </div>
            </div>

            <div className="voice-mini-grid">
               {VOICES.map(voice => (
                 <div 
                   key={voice.id} 
                   className={`voice-pill-card ${selectedVoice === voice.id ? 'active' : ''}`}
                   onClick={() => { setSelectedVoice(voice.id); setHasChanges(true); }}
                 >
                   <div className="voice-pill-info">
                      <div className="voice-pill-avatar"><User size={14} /></div>
                      <span>{voice.name}</span>
                   </div>
                   <button className="voice-pill-play" onClick={(e) => { e.stopPropagation(); togglePreview(voice); }}>
                      {playingVoice === voice.id ? <Pause size={14} /> : <Play size={14} />}
                   </button>
                 </div>
               ))}
            </div>
          </section>
        </div>

        <div className="settings-side-column">
           <div className="help-card serene-card">
              <h3>Suporte ao Usuário</h3>
              <p>Precisa de ajuda para obter suas chaves de API? Confira nossos tutoriais.</p>
              <button className="link-btn-modern">Ver Documentação</button>
           </div>
        </div>
      </div>

      <div className={`save-action-bar ${hasChanges ? 'visible' : ''}`}>
         <div className="save-bar-inner glass-effect">
            <div className="save-info">
               <span className="save-title">Alterações não salvas</span>
               <span className="save-subtitle">Clique em salvar para aplicar as novas chaves.</span>
            </div>
            <button className="modern-save-btn" onClick={() => saveConfigs()} disabled={saving}>
               {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
               <span>Salvar Tudo</span>
            </button>
         </div>
      </div>
    </div>
  );
};

export default Settings;
