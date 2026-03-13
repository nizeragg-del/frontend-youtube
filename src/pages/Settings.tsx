import { useState, useEffect } from 'react';
import { Shield, Key, Check, AlertTriangle, ExternalLink, Save, Youtube } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Settings.css';

const Settings: React.FC = () => {
  const [manusKey, setManusKey] = useState('');
  const [typecastKey, setTypecastKey] = useState('');
  const [ytClientId, setYtClientId] = useState('');
  const [ytClientSecret, setYtClientSecret] = useState('');
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

      const { data, error } = await supabase
        .from('user_configs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setManusKey(data.manus_api_key || '');
        setTypecastKey(data.typecast_api_key || '');
        setYtClientId(data.youtube_client_id || '');
        setYtClientSecret(data.youtube_client_secret || '');
        setYtRefreshToken(data.youtube_refresh_token || '');
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveConfigs = async () => {
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
          youtube_client_id: ytClientId,
          youtube_client_secret: ytClientSecret,
          youtube_refresh_token: ytRefreshToken,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setHasChanges(false);
      alert('Configurações salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar as configurações.');
    } finally {
      setSaving(false);
    }
  };

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
        {/* Manus AI */}
        <div className="api-card serene-card">
          <div className="api-header">
            <div className="api-info">
              <Shield size={24} className="api-icon" />
              <h3>Manus AI</h3>
            </div>
            <div className={`status-label ${manusKey ? 'connected' : 'error'}`}>
              {manusKey ? <Check size={14} /> : <AlertTriangle size={14} />}
              {manusKey ? 'Configurado' : 'Ação Necessária'}
            </div>
          </div>
          <p className="api-desc">Geração de roteiros e imagens via IA.</p>
          <div className="form-group">
            <label><Key size={14} /> Chave da API</label>
            <input 
              type="password" 
              className="serene-input" 
              value={manusKey}
              onChange={(e) => { setManusKey(e.target.value); setHasChanges(true); }}
              placeholder="sk-..."
            />
          </div>
        </div>

        {/* Typecast AI */}
        <div className="api-card serene-card">
          <div className="api-header">
            <div className="api-info">
              <Shield size={24} className="api-icon" />
              <h3>Typecast AI</h3>
            </div>
            <div className={`status-label ${typecastKey ? 'connected' : 'error'}`}>
              {typecastKey ? <Check size={14} /> : <AlertTriangle size={14} />}
              {typecastKey ? 'Configurado' : 'Ação Necessária'}
            </div>
          </div>
          <p className="api-desc">Narração realista com vozes premium.</p>
          <div className="form-group">
            <label><Key size={14} /> Chave da API</label>
            <input 
              type="password" 
              className="serene-input" 
              value={typecastKey}
              onChange={(e) => { setTypecastKey(e.target.value); setHasChanges(true); }}
              placeholder="Paste your key here"
            />
          </div>
        </div>

        {/* YouTube API */}
        <div className="api-card serene-card youtube-card">
          <div className="api-header">
            <div className="api-info">
              <Youtube size={24} className="api-icon youtube" />
              <h3>YouTube Automation</h3>
            </div>
            <div className={`status-label ${ytRefreshToken ? 'connected' : 'error'}`}>
              {ytRefreshToken ? <Check size={14} /> : <AlertTriangle size={14} />}
              {ytRefreshToken ? 'Conectado' : 'Desconectado'}
            </div>
          </div>
          <p className="api-desc">Publicação automática de Shorts após a geração.</p>
          
          <div className="form-group">
            <label>Client ID</label>
            <input 
              type="text" 
              className="serene-input" 
              value={ytClientId}
              onChange={(e) => { setYtClientId(e.target.value); setHasChanges(true); }}
              placeholder="Google Client ID"
            />
          </div>
          <div className="form-group">
            <label>Client Secret</label>
            <input 
              type="password" 
              className="serene-input" 
              value={ytClientSecret}
              onChange={(e) => { setYtClientSecret(e.target.value); setHasChanges(true); }}
              placeholder="Google Client Secret"
            />
          </div>
          <div className="form-group">
            <label>Refresh Token</label>
            <input 
              type="password" 
              className="serene-input" 
              value={ytRefreshToken}
              onChange={(e) => { setYtRefreshToken(e.target.value); setHasChanges(true); }}
              placeholder="OAuth2 Refresh Token"
            />
          </div>

          <div className="api-actions">
            <a href="https://console.cloud.google.com/" target="_blank" className="docs-link">
              <span>Google Cloud Console</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className="save-bar serene-card glass-accent">
          <p>Você tem alterações não salvas.</p>
          <button className="save-btn" onClick={saveConfigs} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Todas as Configurações'}
            <Save size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Settings;
