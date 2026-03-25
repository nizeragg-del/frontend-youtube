import { useState, useEffect } from 'react';
import { Send, Sparkles, Loader2, AlertCircle, Plus, Zap, History, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const navigate = useNavigate();

  const infoCards = [
    {
      title: "Nichos Inteligentes",
      description: "A IA escolhe sub-temas virais dentro do seu nicho favorito.",
      icon: <Zap size={24} />,
      color: "#E11D48"
    },
    {
      title: "Vídeos Diários",
      description: "Sua conta cresce sozinha com postagens agendadas para o horário de pico.",
      icon: <History size={24} />,
      color: "#F59E0B"
    },
    {
      title: "Títulos & Hashtags",
      description: "Metadados otimizados automaticamente para o algoritmo do YouTube Shorts.",
      icon: <Sparkles size={24} />,
      color: "#3B82F6"
    },
    {
      title: "Vozes Humanizadas",
      description: "Escolha entre diversos narradores com entonação natural em português.",
      icon: <Globe size={24} />,
      color: "#10B981"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCardIndex((prev) => (prev + 1) % infoCards.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const suggestions = [
    { text: "Curiosidade sobre o espaço", icon: <Zap size={14} /> },
    { text: "Mensagem de fé (Salmo 23)", icon: <Sparkles size={14} /> },
    { text: "História Bíblica de Davi", icon: <History size={14} /> }
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
    <div className="home-container">
      <main className="home-content">
        <header className="home-header">
          <h1 className="home-title">Olá! O que vamos criar hoje?</h1>
          <p className="home-subtitle">Crie vídeos virais com IA em segundos.</p>
        </header>

        <div className="generation-area">
          <div className="suggestions-row">
            {suggestions.map((s, i) => (
              <button key={i} className="suggestion-card" onClick={() => setPrompt(s.text)}>
                <span className="suggestion-icon">{s.icon}</span>
                <span className="suggestion-text">{s.text}</span>
              </button>
            ))}
          </div>

          <div className="input-pannel">
            <div className={`pill-input-wrapper ${loading ? 'loading-state' : ''}`}>
              <Plus className="input-plus-icon" size={20} />
              <textarea 
                placeholder="Descreva um nicho (ex: Motivação Bíblica) para gerar um vídeo viral..."
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (error) setError(null);
                }}
                disabled={loading}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
              <button 
                className={`send-button ${prompt.trim() ? 'active' : ''}`}
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            
            {error && (
              <div className="home-error-badge">
                <AlertCircle size={14} />
                <span>{error}</span>
                {error.includes("Configurações") && (
                  <button onClick={() => navigate('/configuracoes')} className="error-link">Configurar</button>
                )}
              </div>
            )}
          </div>

          <div className="info-carousel-container">
            <div className="info-carousel-track" style={{ transform: `translateX(-${cardIndex * 100}%)` }}>
              {infoCards.map((card, i) => (
                <div key={i} className="info-card-slide">
                  <div className="info-modern-card-content">
                     <div className="info-card-text">
                        <h3>{card.title}</h3>
                        <p>{card.description}</p>
                     </div>
                     <div className="info-card-visual" style={{ color: card.color }}>
                        {card.icon}
                     </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="carousel-dots">
              {infoCards.map((_, i) => (
                <div 
                  key={i} 
                  className={`carousel-dot ${cardIndex === i ? 'active' : ''}`}
                  onClick={() => setCardIndex(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <footer className="home-footer">
        <p>A Flowyn AI pode cometer erros. Verifique informações importantes.</p>
      </footer>
    </div>
  );
};

export default Home;
