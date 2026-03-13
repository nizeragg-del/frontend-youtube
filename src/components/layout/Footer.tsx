import { Share2, Globe } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <p className="copyright">© 2024 Gerador de Vídeos Evangélicos IA</p>
        </div>
        
        <div className="footer-center">
          <a href="#">Termos de Uso</a>
          <a href="#">Privacidade</a>
          <a href="#">Contato</a>
        </div>
        
        <div className="footer-right">
          <button className="footer-icon-btn"><Share2 size={18} /></button>
          <button className="footer-language">
            <Globe size={18} />
            <div className="globe-icon-placeholder" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
