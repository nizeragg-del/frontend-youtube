import './LegalPages.css';

const Terms = () => {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <h1>Termos de Uso</h1>
        <p className="last-updated">Última atualização: 19 de março de 2026</p>
        
        <section>
          <h2>1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e usar o Flowyn Automação, você concorda em cumprir e estar vinculado a estes Termos de Uso.
            Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
          </p>
        </section>

        <section>
          <h2>2. Descrição do Serviço</h2>
          <p>
            O Flowyn Automação é uma plataforma de criação de vídeos auxiliada por inteligência artificial.
            Reservamo-nos o direito de modificar, suspender ou descontinuar o serviço a qualquer momento.
          </p>
        </section>

        <section>
          <h2>3. Responsabilidades do Usuário</h2>
          <p>
            Você é responsável por manter a confidencialidade de sua conta e senha.
            Você concorda em não usar o serviço para qualquer finalidade ilegal ou não autorizada.
          </p>
        </section>

        <section>
          <h2>4. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo e tecnologia da plataforma são de propriedade da Flowyn Automação ou de seus licenciadores.
            Os vídeos gerados pelos usuários estão sujeitos aos termos das APIs de terceiros utilizadas (como OpenAI, Google, etc.).
          </p>
        </section>

        <section>
          <h2>5. Limitação de Responsabilidade</h2>
          <p>
            A Flowyn Automação não será responsável por quaisquer danos indiretos, incidentais ou consequentes resultantes do uso ou da incapacidade de usar o serviço.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
