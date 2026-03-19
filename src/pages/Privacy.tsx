import './LegalPages.css';

const Privacy = () => {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <h1>Política de Privacidade</h1>
        <p className="last-updated">Última atualização: 19 de março de 2026</p>
        
        <section>
          <h2>1. Coleta de Informações</h2>
          <p>
            Coletamos informações que você nos fornece diretamente ao criar uma conta, como nome e e-mail,
            além de dados técnicos sobre seu uso da plataforma.
          </p>
        </section>

        <section>
          <h2>2. Uso das Informações</h2>
          <p>
            Usamos suas informações para fornecer, manter e melhorar nossos serviços, além de processar as gerações de vídeo solicitadas.
          </p>
        </section>

        <section>
          <h2>3. Compartilhamento de Dados</h2>
          <p>
            Não vendemos seus dados pessoais. Podemos compartilhar informações com provedores de serviços (como Supabase, OpenAI) 
            estritamente para possibilitar o funcionamento da plataforma.
          </p>
        </section>

        <section>
          <h2>4. Segurança</h2>
          <p>
            Implementamos medidas de segurança para proteger suas informações, mas lembre-se que nenhum método de transmissão 
            pela internet é 100% seguro.
          </p>
        </section>

        <section>
          <h2>5. Seus Direitos</h2>
          <p>
            Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento através das configurações de sua conta.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
