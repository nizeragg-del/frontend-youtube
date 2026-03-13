import { Plus, Video, Instagram, Youtube, Facebook, Clock, CheckCircle } from 'lucide-react';
import './Scheduling.css';

const Scheduling: React.FC = () => {
  const schedules = [
    { id: 1, title: "A Fé de Abraão", platform: 'Youtube', status: 'Agendado', time: '14/03 - 10:00' },
    { id: 2, title: "Oração Matinal", platform: 'Instagram', status: 'Publicado', time: '12/03 - 08:30' },
    { id: 3, title: "História de Davi", platform: 'Facebook', status: 'Agendado', time: '15/03 - 19:00' },
  ];

  return (
    <div className="scheduling-container">
      <header className="page-header">
        <div>
          <h1>Agendamentos</h1>
          <p className="subtitle">Gerencie suas postagens e alcance mais fiéis.</p>
        </div>
        <button className="create-btn">
          <Plus size={20} />
          <span>Novo Agendamento</span>
        </button>
      </header>

      <div className="scheduling-grid">
        <section className="form-section serene-card">
          <h3>Programar Novo Vídeo</h3>
          <div className="form-group">
            <label>Selecione o Vídeo</label>
            <select className="serene-input">
              <option>Selecione uma história gerada...</option>
              <option>A História de Davi</option>
              <option>A Fé de Abraão</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Plataforma</label>
            <div className="platform-selector">
              <button className="platform-btn active"><Youtube size={18} /><span>YouTube</span></button>
              <button className="platform-btn"><Instagram size={18} /><span>Instagram</span></button>
              <button className="platform-btn"><Facebook size={18} /><span>Facebook</span></button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data</label>
              <input type="date" className="serene-input" />
            </div>
            <div className="form-group">
              <label>Hora</label>
              <input type="time" className="serene-input" />
            </div>
          </div>

          <button className="submit-btn" onClick={() => alert('Agendado com sucesso!')}>Agendar Publicação</button>
        </section>

        <section className="list-section">
          <h3>Próximas Postagens</h3>
          <div className="schedule-list">
            {schedules.map(item => (
              <div key={item.id} className="schedule-item serene-card">
                <div className="item-icon">
                  <Video size={20} />
                </div>
                <div className="item-info">
                  <h4>{item.title}</h4>
                  <div className="item-meta">
                    <Clock size={14} /> <span>{item.time}</span>
                    <span className="dot">•</span>
                    {item.platform === 'Youtube' && <Youtube size={14} />}
                    {item.platform === 'Instagram' && <Instagram size={14} />}
                    {item.platform === 'Facebook' && <Facebook size={14} />}
                    <span>{item.platform}</span>
                  </div>
                </div>
                <div className={`status-badge ${item.status.toLowerCase()}`}>
                  {item.status === 'Publicado' && <CheckCircle size={14} />}
                  <span>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Scheduling;
