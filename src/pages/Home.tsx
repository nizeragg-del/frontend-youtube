import { useState } from 'react';
import { Send, Sparkles, Mic, Image as ImageIcon, Video, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const suggestions = [
    "Mensagem motivacional de Romanos 15:13",
    "Vídeo curto do Versículo do Dia",
    "Estudo visual sobre Parábolas",
    "Explicação do Salmo 23"
  ];

  const features = [
    "Qualidade 4K",
    "Narração Realista",
    "Legendas Automáticas"
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Por favor, descreva o tema do vídeo.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Você precisa estar logado para gerar vídeos.");
        navigate('/login');
        return;
      }

      const { data: config, error: configError } = await supabase
        .from('user_configs')
        .select('manus_api_key, typecast_api_key, voice_id, voice_language')
        .eq('user_id', user.id)
        .single();

      if (configError || !config?.manus_api_key || !config?.typecast_api_key) {
        setError("API Keys não configuradas. Por favor, acesse as Configurações.");
        return;
      }

      const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
      const owner = import.meta.env.VITE_BACKEND_REPO_OWNER;
      const repo = import.meta.env.VITE_BACKEND_REPO_NAME;

      if (!githubToken || !owner || !repo) {
        setError("Configuração do servidor de renderização incompleta.");
        return;
      }

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/render.yml/dispatches`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            topic: prompt,
            user_id: user.id,
            voice_id: config.voice_id || 'tc_5f8d7b0de146f10007b8042f',
            voice_language: config.voice_language || 'Português'
          }
        })
      });

      if (!response.ok) {
        throw new Error("Falha ao iniciar processo no GitHub.");
      }

      setPrompt("");
      alert("🚀 Sucesso! O motor foi iniciado. O progresso aparecerá no Histórico.");
      
    } catch (err: any) {
      setError(err.message || "Erro ao iniciar a geração.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-page">
      <header className="hero-header">
        <div className="brand-badge">Flowyn AI</div>
        <h1 className="hero-title">O que vamos criar <span className="text-gradient">hoje?</span></h1>
        <p className="hero-subtitle">
          Transforme passagens bíblicas e mensagens de fé em vídeos inspiradores com o poder da inteligência artificial.
        </p>
      </header>

      <section className="prompt-section">
        <div className="prompt-container">
          <div className="prompt-header">
            <Sparkles size={16} className="sparkle-icon" />
            <span>Novo Projeto</span>
          </div>
          <div className="prompt-input-area">
            <textarea 
              placeholder="Descreva o tema, o versículo ou a mensagem... Ex: 'Mensagem de esperança baseada em Romanos 15:13'."
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (error) setError(null);
              }}
              disabled={loading}
            />
          </div>

          <div className="prompt-actions">
            <div className="action-icons">
              <button className="tool-btn teal-hover" title="Gravar Áudio"><Mic size={18} /></button>
              <button className="tool-btn blue-hover" title="Enviar Imagem"><ImageIcon size={18} /></button>
              <button className="tool-btn red-hover" title="Adicionar Vídeo"><Video size={18} /></button>
            </div>
            
            <button 
              className={`generate-btn ${loading ? 'loading' : ''}`}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <div className="loader-container">
                  <Loader2 size={18} className="animate-spin" />
                  <span>Iniciando...</span>
                </div>
              ) : (
                <>
                  <span>Criar Vídeo</span>
                  <Send size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message shake">
            <AlertCircle size={16} />
            <span>{error}</span>
            {error.includes("Configurações") && (
              <button onClick={() => navigate('/configuracoes')} className="link-btn">Ajustar Agora</button>
            )}
          </div>
        )}

        <div className="suggestions-container">
          <span className="suggestions-label">Sugestões para você</span>
          <div className="suggestions-grid">
            {suggestions.map((s, i) => (
              <button key={i} className="suggestion-pill" onClick={() => setPrompt(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="features-badges">
          {features.map((f, i) => (
            <div key={i} className="feature-badge">
              <CheckCircle2 size={14} />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
