import { useState } from 'react';
import { Send, Sparkles, Mic, Image as ImageIcon, Video, User, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import './Home.css';

const Home = () => {
  const [prompt, setPrompt] = useState("");

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
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <div className="prompt-actions">
            <div className="action-icons">
              <button className="tool-btn"><Mic size={20} /></button>
              <button className="tool-btn"><ImageIcon size={20} /></button>
              <button className="tool-btn"><Video size={20} /></button>
              <button className="tool-btn"><User size={20} /></button>
            </div>
            <button className="generate-btn">
              <span>Gerar Vídeo</span>
              <Send size={18} />
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
