import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Loader2, AlertCircle, Zap, ChevronLeft, ChevronRight, 
  CheckCircle2, Upload, Play, Download, Music
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import './Home.css';

type GenerationStep = 'mode_selection' | 'image_upload' | 'prompt_input' | 'processing_script' | 'script_review' | 'rendering' | 'completed';

const Home = () => {
  const [step, setStep] = useState<GenerationStep>('mode_selection');
  const [videoType, setVideoType] = useState<'viral' | 'creative'>('viral');
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [scriptData, setScriptData] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não logado");

      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('generations')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('generations')
          .getPublicUrl(fileName);
        
        uploadedUrls.push(publicUrl);
      }

      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      setError("Erro ao carregar imagens.");
    } finally {
      setLoading(false);
    }
  };

  const startGeneration = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // 1. Criar registro no Supabase
      const { data: gen, error: genError } = await supabase
        .from('generations')
        .insert({
          user_id: user.id,
          topic: prompt,
          video_type: videoType,
          image_references: images,
          status: 'scripting'
        })
        .select()
        .single();

      if (genError) throw genError;
      setGenerationId(gen.id);

      // 2. Trigger GitHub Action Phase 1
      const { data: config } = await supabase
        .from('user_configs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const response = await fetch(`https://api.github.com/repos/${import.meta.env.VITE_BACKEND_REPO_OWNER}/${import.meta.env.VITE_BACKEND_REPO_NAME}/actions/workflows/render.yml/dispatches`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            topic: prompt,
            user_id: user.id,
            generation_id: gen.id,
            video_type: videoType,
            image_references: images.join(','),
            phase: 'script',
            voice_id: config?.voice_id || 'tc_5f8d7b0de146f10007b8042f',
            voice_language: config?.voice_language || 'Português'
          }
        })
      });

      if (!response.ok) throw new Error("Erro ao iniciar motor.");

      setStep('processing_script');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!generationId) return;

    const channel = supabase
      .channel(`gen_${generationId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'generations', 
        filter: `id=eq.${generationId}` 
      }, (payload) => {
        const updated = payload.new;
        if (updated.status === 'awaiting_audio' && updated.script_data) {
          setScriptData(updated.script_data);
          setStep('script_review');
        } else if (updated.status === 'completed' && updated.video_url) {
          setVideoUrl(updated.video_url);
          setStep('completed');
        } else if (updated.status === 'failed') {
          setError("Geração falhou no servidor.");
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [generationId]);

  const confirmRender = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await fetch(`https://api.github.com/repos/${import.meta.env.VITE_BACKEND_REPO_OWNER}/${import.meta.env.VITE_BACKEND_REPO_NAME}/actions/workflows/render.yml/dispatches`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            topic: prompt,
            user_id: user?.id,
            generation_id: generationId,
            phase: 'render'
          }
        })
      });

      if (!response.ok) throw new Error("Erro ao iniciar renderização.");
      setStep('rendering');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 'mode_selection':
        return (
          <div className="step-container animate-in">
            <h2 className="step-title">Escolha o estilo do vídeo</h2>
            <div className="mode-cards">
              <div className={`mode-card ${videoType === 'viral' ? 'selected' : ''}`} onClick={() => setVideoType('viral')}>
                <Zap size={32} />
                <div className="mode-content">
                  <h3>Vídeo Viral</h3>
                  <p>Focado em retenção e algoritmos de redes sociais.</p>
                </div>
              </div>
              <div className={`mode-card ${videoType === 'creative' ? 'selected' : ''}`} onClick={() => setVideoType('creative')}>
                <Sparkles size={32} />
                <div className="mode-content">
                  <h3>Criativo</h3>
                  <p>Ideal para produtos, serviços e branding personalizado.</p>
                </div>
              </div>
            </div>
            <button className="primary-button" onClick={() => setStep(videoType === 'creative' ? 'image_upload' : 'prompt_input')}>
              Continuar <ChevronRight size={18} />
            </button>
          </div>
        );

      case 'image_upload':
        return (
          <div className="step-container animate-in">
             <button className="back-button" onClick={() => setStep('mode_selection')}><ChevronLeft size={16} /> Voltar</button>
             <h2 className="step-title">Anexe referências visuais</h2>
             <p className="step-desc">Adicione fotos do seu produto ou referências de estilo para a IA.</p>
             <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
               <Upload size={32} />
               <span>Clique para carregar imagens</span>
               <input type="file" hidden multiple ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
             </div>
             {images.length > 0 && (
               <div className="image-preview-grid">
                 {images.map((img, i) => <img key={i} src={img} alt="Ref" />)}
               </div>
             )}
             <button className="primary-button" onClick={() => setStep('prompt_input')} disabled={loading}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Seguir para o Roteiro"}
             </button>
          </div>
        );

      case 'prompt_input':
        return (
          <div className="step-container animate-in">
            <button className="back-button" onClick={() => setStep(videoType === 'creative' ? 'image_upload' : 'mode_selection')}><ChevronLeft size={16} /> Voltar</button>
            <h2 className="step-title">Qual é o tema do vídeo?</h2>
            <div className="input-pannel">
              <div className="pill-input-wrapper">
                <textarea 
                  placeholder="Ex: Curiosidades sobre o espaço ou Promoção de Tênis esportivo..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={2}
                />
              </div>
              <button 
                className="primary-button active"
                onClick={startGeneration}
                style={{ marginTop: '20px', width: '100%' }}
                disabled={loading || !prompt.trim()}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Gerar Roteiro e Cenas"}
              </button>
            </div>
          </div>
        );

      case 'processing_script':
        return (
          <div className="status-container animate-in">
            <Loader2 size={48} className="animate-spin text-blue" />
            <h2>O motor está criando seu roteiro...</h2>
            <p>Isso leva cerca de 1 minuto. Acompanhe abaixo.</p>
          </div>
        );

      case 'script_review':
        return (
          <div className="step-container animate-in">
            <h2 className="step-title"><CheckCircle2 className="text-green" /> Roteiro Gerado!</h2>
            <div className="script-review-card">
              <h3>{scriptData?.title}</h3>
              <p>{scriptData?.text}</p>
              <div className="hashtags">{scriptData?.hashtags?.join(' ')}</div>
            </div>
            
            <div className="audio-selection">
              <h3><Music size={18} /> Escolha uma trilha sonora</h3>
              <div className="audio-grid">
                <div className="audio-item selected"><Play size={14} /> Viral Cinematic</div>
                <div className="audio-item"><Play size={14} /> Corporate Flow</div>
                <div className="audio-item"><Play size={14} /> Upbeat Tech</div>
              </div>
            </div>

            <button className="primary-button" onClick={confirmRender} disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Tudo Certo, Renderizar Vídeo!"}
            </button>
          </div>
        );

      case 'rendering':
        return (
          <div className="status-container animate-in">
            <div className="render-animation">
               <div className="render-bar"></div>
            </div>
            <h2>Estamos montando seu vídeo...</h2>
            <p>Configurando áudio, legendas e cenas. Quase pronto!</p>
          </div>
        );

      case 'completed':
        return (
          <div className="step-container animate-in">
            <h2 className="step-title">Vídeo Pronto para Download! 🚀</h2>
            <div className="video-preview-card">
              <video src={videoUrl!} controls />
            </div>
            <div className="completion-actions">
               <a href={videoUrl!} download className="download-button">
                 <Download size={18} /> Baixar Vídeo
               </a>
               <button className="secondary-button" onClick={() => setStep('mode_selection')}>
                 Criar Novo Vídeo
               </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="home-container">
      <main className="home-content">
        <header className="home-header">
          <h1 className="home-title">Flowyn AI Pipeline</h1>
          <p className="home-subtitle">Sua fábrica de conteúdo interativa.</p>
        </header>

        <div className="generation-area">
          {renderStep()}
        </div>

        {error && (
          <div className="home-error-badge">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </main>

      <footer className="home-footer">
        <p>Flowyn AI v2.0 - Upgrade drástico concluído.</p>
      </footer>
    </div>
  );
};

export default Home;
