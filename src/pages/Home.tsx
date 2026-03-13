import { useState } from 'react';
import { Send, Sparkles, Mic, Image as ImageIcon, Video, User, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const suggestionCards = [
    {
      title: "Pregação sobre Esperança",
      description: "Crie uma mensagem motivacional baseada em Romanos 15:13.",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
      tag: "SUGESTÃO"
    },
    {
      title: "Versículo do Dia",
      description: "Vídeo curto e impactante otimizado para Reels e TikTok.",
      image: "https://images.unsplash.com/photo-1490814523974-84441556a42a?auto=format&fit=crop&q=80&w=600",
      tag: "REDES SOCIAIS"
    },
    {
      title: "Estudo Bíblico Visual",
      description: "Explicação visual detalhada de parábolas clássicas.",
      image: "https://images.unsplash.com/photo-1544648183-2070f3f2187b?auto=format&fit=crop&q=80&w=600",
      tag: "ESTUDO"
    }
  ];

  const features = [
    "Qualidade 4K",
    "Narração Realista",
    "Legendas Automáticas",
    "Trilhas Livres de Direitos"
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Por favor, descreva o tema do vídeo.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Verificar Autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Você precisa estar logado para gerar vídeos.");
        navigate('/login');
        return;
      }

      // 2. Verificar Configurações de API
      const { data: config, error: configError } = await supabase
        .from('user_configs')
        .select('manus_api_key, typecast_api_key')
        .eq('user_id', user.id)
        .single();

      if (configError || !config?.manus_api_key || !config?.typecast_api_key) {
        setError("API Keys não configuradas. Por favor, acesse as Configurações.");
        return;
      }

      // 3. Disparar GitHub Action
      const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
      const owner = import.meta.env.VITE_BACKEND_REPO_OWNER;
      const repo = import.meta.env.VITE_BACKEND_REPO_NAME;

      if (!githubToken || !owner || !repo) {
        setError("Configuração do servidor de renderização incompleta (GitHub Token).");
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
            user_id: user.id
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao iniciar processo no GitHub.");
      }

      setPrompt("");
      alert("🚀 Sucesso! O motor de geração foi iniciado. Você receberá uma notificação quando o vídeo estiver pronto.");
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao iniciar a geração.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-page">
      <section className="hero-header">
        <div className="hero-icon-wrapper">
          <div className="hero-main-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
            </svg>
          </div>
        </div>
        <h1 className="hero-title">O que vamos criar hoje?</h1>
        <p className="hero-subtitle">
          Transforme passagens bíblicas e mensagens de fé em vídeos inspiradores com o poder da Inteligência Artificial.
        </p>
      </section>

      <section className="suggestions-grid">
        {suggestionCards.map((card, idx) => (
          <motion.div 
            key={idx}
            className="suggestion-card serene-card"
            whileHover={{ y: -5 }}
            onClick={() => setPrompt(card.description)}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-image-wrapper">
              <img src={card.image} alt={card.title} />
              <span className="card-tag">{card.tag}</span>
            </div>
            <div className="card-content">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="prompt-section">
        <div className="prompt-container serene-card">
          <div className="prompt-input-area">
            <div className="prompt-icon-left">
              <Sparkles size={24} className="sparkle-icon" />
            </div>
            <textarea 
              placeholder="Descreva o tema, o versículo ou a mensagem que você deseja transformar em vídeo... Ex: 'Crie um vídeo de 1 minuto sobre o Salmo 23 com imagens de natureza'."
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (error) setError(null);
              }}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
              {error.includes("Configurações") && (
                <button onClick={() => navigate('/settings')} className="link-btn">Ir para Configurações</button>
              )}
            </div>
          )}

          <div className="prompt-actions">
            <div className="action-icons">
              <button className="tool-btn"><Mic size={20} /></button>
              <button className="tool-btn"><ImageIcon size={20} /></button>
              <button className="tool-btn"><Video size={20} /></button>
              <button className="tool-btn"><User size={20} /></button>
            </div>
            <button 
              className="generate-btn" 
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Gerando...</span>
                </>
              ) : (
                <>
                  <span>Gerar Vídeo</span>
                  <Send size={18} />
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="features-badges">
          {features.map((f, i) => (
            <div key={i} className="feature-badge">
              <CheckCircle2 size={16} />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
