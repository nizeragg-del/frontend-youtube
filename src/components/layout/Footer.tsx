import { Share2, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Flowyn Automação',
          text: 'Crie vídeos incríveis com IA!',
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert('Link copiado para a área de transferência!');
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  };

  const handleLanguage = () => {
    alert('Seleção de idioma em breve!');
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <p className="copyright">© 2024 flowyn automação</p>
        </div>
        
        <div className="footer-center">
          <Link to="/termos">Termos de Uso</Link>
          <Link to="/privacidade">Privacidade</Link>
          <Link to="/contato">Contato</Link>
        </div>
        
        <div className="footer-right">
          <button className="footer-icon-btn" onClick={handleShare} title="Compartilhar">
            <Share2 size={18} />
          </button>
          <button className="footer-language" onClick={handleLanguage} title="Idioma">
            <Globe size={18} />
            <div className="globe-icon-placeholder" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
