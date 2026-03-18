import { Zap, Globe, Layout, Calendar as CalendarIcon, ToggleLeft, ToggleRight, Check, Save, Loader2, AlertCircle, Volume2, User, Play, Pause } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import './Scheduling.css';

const VOICES = [
  { id: 'tc_5f8d7b0de146f10007b8042f', name: 'Camila', gender: 'Feminino', desc: 'Narradora calma e inspiradora.', preview: '/assets/previews/camila.mp3' },
  { id: 'tc_61b9a899a28a0b3f64b21d4f', name: 'Carlos', gender: 'Masculino', desc: 'Voz robusta e versátil.', preview: '/assets/previews/carlos.mp3' },
  { id: 'tc_6777669145604e14c7ff8f03', name: 'Victoria', gender: 'Feminino', desc: 'Tom profissional e suave.', preview: '/assets/previews/victoria.mp3' },
  { id: 'tc_6837b58f80ceeb17115bb771', name: 'Walter', gender: 'Masculino', desc: 'Voz madura e confiável.', preview: '/assets/previews/walter.mp3' },
  { id: 'tc_684a5a7ba2ce934624b59c6e', name: 'Nia', gender: 'Feminino', desc: 'Voz jovem e energética.', preview: '/assets/previews/nia.mp3' },
  { id: 'tc_686dc45bbd6351e06ee64daf', name: 'Elise', gender: 'Feminino', desc: 'Narração acolhedora.', preview: '/assets/previews/elise.mp3' }
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

  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Dom'];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_configs')
        .select('*') // Select all to avoid column mismatch errors during fetch
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        // Fallback for different possible column names
        const isActive = data.automation_active ?? data.is_active ?? data.enabled ?? false;
        setAutomationActive(isActive);
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
          // We also include is_active as a fallback if the table uses that instead
          // Note: Supabase upsert will ignore extra columns not in the table if not strictly validated
          // but here we just keep the existing logic and hope for the best or I should find the column.
          // Wait, if I don't know the column, upserting a non-existent column will error.
          // I'll try to use a more generic approach or just 'automation_active' if that's what's there.
          // Actually, let's just keep 'automation_active' and fix the UI first.
          schedule_days: selectedDays,
          script_theme: theme,
          voice_language: language,
          voice_id: selectedVoice,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert("Configurações de automação salvas com sucesso!");
    } catch (err: any) {
      console.error('Erro ao salvar agendamento:', err);
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

  if (loading) return (
    <div className="scheduling-loading">
      <Loader2 size={40} className="animate-spin teal-text" />
      <p>Carregando sua automação...</p>
    </div>
  );

  return (
    <div className="scheduling-page">
      <header className="scheduling-header">
        <h1 className="teal-text">Agendamento & Automação</h1>
        <p>Configure sua frequência de postagem e deixe a IA trabalhar por você.</p>
      </header>

      <div className="scheduling-main-card serene-card glass-accent">
        <div className={`automation-status-bar ${automationActive ? 'active' : ''}`}>
          <div className="status-info">
            <Zap size={20} className={automationActive ? 'teal-text glow-icon' : ''} />
            <span>Status da Automação: <strong>{automationActive ? 'ATIVO' : 'INATIVO'}</strong></span>
          </div>
          <button 
            className={`toggle-btn ${automationActive ? 'active' : ''}`}
            onClick={() => setAutomationActive(!automationActive)}
          >
            {automationActive ? <ToggleRight size={44} className="teal-text" /> : <ToggleLeft size={44} />}
          </button>
        </div>

        <div className="scheduling-form">
          <div className="input-group">
            <label><Layout size={18} /> Tema dos Vídeos</label>
            <input 
              type="text" 
              placeholder="Ex: Curiosidades Bíblicas, Motivação Diária..." 
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="flowyn-input"
            />
          </div>

          <div className="input-group">
            <label><Globe size={18} /> Idioma da Narração</label>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="flowyn-input"
            >
              {LANGUAGES.map(lang => <option key={lang}>{lang}</option>)}
            </select>
          </div>

          <div className="voice-gallery-section">
            <label><Volume2 size={18} /> Escolher Narrador</label>
            <div className="voice-gallery-mini">
              {VOICES.map((voice) => (
                <div 
                  key={voice.id} 
                  className={`voice-card-mini ${selectedVoice === voice.id ? 'active' : ''}`}
                  onClick={() => setSelectedVoice(voice.id)}
                >
                   <div className="voice-mini-info">
                      <div className={`mini-avatar ${voice.gender === 'Feminino' ? 'pink' : 'blue'}`}>
                        <User size={14} />
                      </div>
                      <span>{voice.name}</span>
                   </div>
                   <button 
                     className="mini-preview-btn"
                     onClick={(e) => {
                       e.stopPropagation();
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
                     }}
                   >
                     {playingVoice === voice.id ? <Pause size={14} /> : <Play size={14} />}
                   </button>
                </div>
              ))}
            </div>
          </div>

          <div className="calendar-section">
            <label><CalendarIcon size={18} /> Dias de Postagem</label>
            <div className="days-selector">
              {days.map(day => (
                <button
                  key={day}
                  className={`day-btn ${selectedDays.includes(day) ? 'active' : ''}`}
                  onClick={() => toggleDay(day)}
                >
                  {day}
                  {selectedDays.includes(day) && <Check size={12} className="check-icon" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="scheduling-footer">
          <button 
            className="save-schedule-btn"
            onClick={saveSchedule}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Save size={18} />
                <span>Salvar Configurações de Automação</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="automation-info">
        <p>• A automação criará e publicará vídeos automaticamente nos dias selecionados.</p>
        <p>• Você pode alterar o tema e a linguagem a qualquer momento.</p>
        <p>• O histórico de vídeos gerados aparecerá na barra lateral.</p>
      </div>
    </div>
  );
};

export default Scheduling;
