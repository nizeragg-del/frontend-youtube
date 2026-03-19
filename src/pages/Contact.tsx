import { Mail, MessageCircle, MapPin } from 'lucide-react';
import './LegalPages.css';

const Contact = () => {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <h1>Contato</h1>
        <p>Estamos aqui para ajudar. Entre em contato conosco através dos canais abaixo:</p>
        
        <div className="contact-grid">
          <div className="contact-card">
            <Mail className="contact-icon" />
            <h3>E-mail</h3>
            <p>suporte@flowyn.com</p>
          </div>
          
          <div className="contact-card">
            <MessageCircle className="contact-icon" />
            <h3>WhatsApp</h3>
            <p>+55 (11) 99999-9999</p>
          </div>
          
          <div className="contact-card">
            <MapPin className="contact-icon" />
            <h3>Endereço</h3>
            <p>São Paulo, SP - Brasil</p>
          </div>
        </div>

        <section style={{ marginTop: '40px' }}>
          <h2>Horário de Atendimento</h2>
          <p>Segunda a Sexta: 09:00 às 18:00</p>
        </section>
      </div>
    </div>
  );
};

export default Contact;
