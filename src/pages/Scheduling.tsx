import { Zap, Globe, Layout, Calendar as CalendarIcon, ToggleLeft, ToggleRight, Check, Save, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './Scheduling.css';

const Scheduling: React.FC = () => {
  const [automationActive, setAutomationActive] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [theme, setTheme] = useState('');
  const [language, setLanguage] = useState('Português');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        .select('automation_active, schedule_days, script_theme, script_language')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setAutomationActive(data.automation_active || false);
        setSelectedDays(data.schedule_days || []);
        setTheme(data.script_theme || '');
        setLanguage(data.script_language || 'Português');
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
          script_language: language,
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
            <label><Globe size={18} /> Linguagem do Áudio/Roteiro</label>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="flowyn-input"
            >
              <option>Português</option>
              <option>English</option>
              <option>Español</option>
            </select>
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
