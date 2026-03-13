import { Shield, Key, Check, AlertTriangle, ExternalLink } from 'lucide-react';
import './Settings.css';

const Settings: React.FC = () => {
  const apis = [
    { id: 1, name: 'Manus AI', status: 'connected', description: 'Geração de roteiros e imagens via IA.' },
    { id: 2, name: 'Typecast AI', status: 'connected', description: 'Narração realista com vozes premium.' },
    { id: 3, name: 'YouTube API', status: 'error', description: 'Publicação automática de Shorts.' },
  ];

  return (
    <div className="settings-container">
      <header className="page-header">
        <div>
          <h1>Configurações de API</h1>
          <p className="subtitle">Conecte os motores que dão vida aos seus vídeos.</p>
        </div>
      </header>

      <div className="apis-grid">
        {apis.map(api => (
          <div key={api.id} className="api-card serene-card">
            <div className="api-header">
              <div className="api-info">
                <Shield size={24} className="api-icon" />
                <h3>{api.name}</h3>
              </div>
              <div className={`status-label ${api.status}`}>
                {api.status === 'connected' ? <Check size={14} /> : <AlertTriangle size={14} />}
                {api.status === 'connected' ? 'Conectado' : 'Ação Necessária'}
              </div>
            </div>
            
            <p className="api-desc">{api.description}</p>
            
            <div className="form-group">
              <label><Key size={14} /> Chave da API</label>
              <input 
                type="password" 
                className="serene-input" 
                placeholder="••••••••••••••••••••••••"
                defaultValue="valid_key_stored"
              />
            </div>

            <div className="api-actions">
              <button className="test-btn">Testar Conexão</button>
              <a href="#" className="docs-link">
                <span>Documentação</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="save-bar serene-card glass-accent">
        <p>Você tem alterações não salvas.</p>
        <button className="save-btn">Salvar Todas as Configurações</button>
      </div>
    </div>
  );
};

export default Settings;
