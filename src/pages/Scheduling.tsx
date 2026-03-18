import { Zap, Globe, Layout, Check, Save, Loader2, User, Play, Pause, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import './Scheduling.css';

const VOICES = [
  { id: 'tc_5f8d7b0de146f10007b8042f', name: 'Camila', gender: 'Feminino', preview: '/assets/previews/camila.mp3' },
  { id: 'tc_61b9a899a28a0b3f64b21d4f', name: 'Carlos', gender: 'Masculino', preview: '/assets/previews/carlos.mp3' },
  { id: 'tc_6777669145604e14c7ff8f03', name: 'Victoria', gender: 'Feminino', preview: '/assets/previews/victoria.mp3' },
  { id: 'tc_6837b58f80ceeb17115bb771', name: 'Walter', gender: 'Masculino', preview: '/assets/previews/walter.mp3' },
  { id: 'tc_684a5a7ba2ce934624b59c6e', name: 'Nia', gender: 'Feminino', preview: '/assets/previews/nia.mp3' },
  { id: 'tc_686dc45bbd6351e06ee64daf', name: 'Elise', gender: 'Feminino', preview: '/assets/previews/elise.mp3' }
];

const LANGUAGES = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Alemão'];

const Scheduling: React.FC = () => {
  const [automationActive, setAutomationActive] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [theme, setTheme] = useState('');
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_configs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setAutomationActive(data.automation_active ?? false);
        setSelectedDays(data.schedule_days || []);
        setTheme(data.script_theme || '');
        setLanguage(data.voice_language || 'Português');
        if (data.voice_id) setSelectedVoice(data.voice_id);
      }
    } catch (err: any) {
      console.error('Erro ao carregar agendamento:', err);
      setError("Não foi possível carregar suas configurações.");
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async () => {
    setSaving(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from('user_configs')
        .upsert({
          user_id: user.id,
          automation_active: automationActive,
          schedule_days: selectedDays,
          script_theme: theme,
          voice_language: language,
          voice_id: selectedVoice,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert("Configurações de automação salvas!");
    } catch (err: any) {
      setError(err.message || "Erro ao salvar as configurações.");
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handlePreview = (voice: any) => {
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

  if (loading) return (
    <div className="scheduling-loader">
      <Loader2 size={32} className="animate-spin text-blue" />
      <p>Configurando seu estúdio...</p>
    </div>
  );

  return (
    <div className="scheduling-container">
      <header className="page-header">
        <h1 className="page-title">Automação de Conteúdo</h1>
        <p className="page-description">Configure a geração automática dos seus vídeos virais.</p>
      </header>

      <div className="scheduling-grid">
        <div className="scheduling-sidebar">
           <div className="status-card serene-card">
              <div className="status-header">
                 <div className="status-title">
                    <Zap size={18} className={automationActive ? "active-zap" : ""} />
                    <span>Automação Ativa</span>
                 </div>
                 <div 
                   className={`modern-toggle ${automationActive ? 'active' : ''}`}
                   onClick={() => setAutomationActive(!automationActive)}
                 >
                   <div className="toggle-handle" />
                 </div>
              </div>
              <p className="status-desc">
                {automationActive 
                  ? "Sua conta está gerando novos conteúdos conforme o agendamento." 
                  : "A geração automática está pausada no momento."}
              </p>
           </div>

           <div className="info-modern-card">
              <h3>Dicas de Automação</h3>
              <ul>
                 <li>Temas amplos tendem a performar melhor.</li>
                 <li>Escolha vozes que combinem com seu nicho.</li>
                 <li>Vídeos são renderizados no horário selecionado.</li>
              </ul>
           </div>
        </div>

        <div className="scheduling-content">
           <section className="config-section serene-card">
              <h2 className="section-title">Configurações Gerais</h2>
              <div className="form-row">
                 <div className="form-group">
                    <label><Layout size={16} /> Tema Principal</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Curiosidades sobre tecnologia"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                    />
                 </div>
                 <div className="form-group">
                    <label><Globe size={16} /> Idioma Oficial</label>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                       {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                    </select>
                 </div>
              </div>

              <div className="voice-selection-box">
                 <label className="input-label">Selecionar Narrador</label>
                 <div className="voice-cards-grid">
                    {VOICES.map(voice => (
                      <div 
                        key={voice.id} 
                        className={`modern-voice-card ${selectedVoice === voice.id ? 'selected' : ''}`}
                        onClick={() => setSelectedVoice(voice.id)}
                      >
                         <div className="voice-main-info">
                            <div className="voice-icon-box">
                               <User size={16} />
                            </div>
                            <div className="voice-text-info">
                               <span className="voice-name">{voice.name}</span>
                               <span className="voice-tag">{voice.gender}</span>
                            </div>
                         </div>
                         <button 
                           className={`voice-play-circle ${playingVoice === voice.id ? 'playing' : ''}`}
                           onClick={(e) => { e.stopPropagation(); handlePreview(voice); }}
                         >
                            {playingVoice === voice.id ? <Pause size={14} /> : <Play size={14} />}
                         </button>
                         {selectedVoice === voice.id && <div className="selected-dot"><Check size={10} /></div>}
                      </div>
                    ))}
                 </div>
              </div>

              <div className="calendar-box">
                 <label className="input-label">Dias de Geração</label>
                 <div className="modern-days-row">
                    {days.map(day => (
                      <button 
                        key={day}
                        className={`modern-day-item ${selectedDays.includes(day) ? 'active' : ''}`}
                        onClick={() => toggleDay(day)}
                      >
                        {day}
                      </button>
                    ))}
                 </div>
              </div>
           </section>

           <div className="action-footer">
              {error && <span className="error-text-small">{error}</span>}
              <button 
                className="primary-save-btn"
                onClick={saveSchedule}
                disabled={saving}
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span>Salvar Alterações</span>
                <ChevronRight size={16} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Scheduling;
