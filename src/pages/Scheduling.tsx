import { Zap, Globe, Layout, Calendar as CalendarIcon, ToggleLeft, ToggleRight, Check } from 'lucide-react';
import { useState } from 'react';
import './Scheduling.css';

const Scheduling: React.FC = () => {
  const [automationActive, setAutomationActive] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Segunda', 'Quarta', 'Sexta']);
  const [theme, setTheme] = useState('');
  const [language, setLanguage] = useState('Português');

  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Dom'];

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="scheduling-page">
      <header className="scheduling-header">
        <h1 className="orange-text">Agendamento & Automação</h1>
        <p>Configure sua frequência de postagem e deixe a IA trabalhar por você.</p>
      </header>

      <div className="scheduling-main-card serene-card">
        <div className="automation-status-bar">
          <div className="status-info">
            <Zap size={20} className={automationActive ? 'orange-text' : ''} />
            <span>Status da Automação: <strong>{automationActive ? 'ATIVO' : 'INATIVO'}</strong></span>
          </div>
          <button 
            className={`toggle-btn ${automationActive ? 'active' : ''}`}
            onClick={() => setAutomationActive(!automationActive)}
          >
            {automationActive ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
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

        <div className="scheduling-footer">
          <button className="save-schedule-btn">
            Salvar Configurações de Automação
          </button>
        </div>
      </div>
      
      <div className="automation-info">
        <p>• A automação criará e publicará vídeos automaticamente nos dias selecionados.</p>
        <p>• O histórico de vídeos gerados aparecerá na barra lateral em "Histórico".</p>
      </div>
    </div>
  );
};

export default Scheduling;
