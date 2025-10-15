import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return {
    title: locale === 'pt' ? 'Termos e Condições | Clínica Ferreira Borges' : 'Terms and Conditions | Clínica Ferreira Borges',
    description: locale === 'pt' ? 'Termos e condições de uso dos serviços da Clínica Ferreira Borges' : 'Terms and conditions for using Clínica Ferreira Borges services',
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const content = locale === 'pt' ? {
    title: 'Termos e Condições',
    lastUpdated: 'Última atualização: Janeiro 2025',
    intro: 'Este site foi criado, é propriedade e é operado pela Ourique Smile Lda, com sede na Rua Ferreira Borges 173C, 1350-130 Lisboa, pessoa coletiva número 510 537 472, e a sua utilização é regida por estes Termos de Utilização.',
    sections: [
      {
        title: 'Aceitação dos Termos de Utilização',
        content: 'O utilizador do Site (denominado "Utilizador") reconhece que ao utilizar este Site aceita estes Termos de Utilização.'
      },
      {
        title: 'Alterações aos Termos de Utilização',
        content: 'A Ourique Smile Lda reserva-se o direito de alterar estes termos e condições a qualquer momento. As alterações entrarão em vigor imediatamente após a sua publicação neste website.'
      },
      {
        title: 'Acesso ao Site',
        content: 'O acesso ao Site não está sujeito a registo. A Ourique Smile Lda tem o direito exclusivo de, a qualquer momento, suspender, parcial ou totalmente, o acesso ao Site, em particular em operações de gestão, manutenção, reparação, alteração ou modernização e de encerrar, definitiva ou temporariamente, parcial ou totalmente, a qualquer momento, de acordo com a sua vontade, o Site ou qualquer um dos serviços, sem aviso prévio.'
      },
      {
        title: 'Utilização do Site',
        content: 'A utilização do Site está sujeita ao cumprimento das seguintes regras: Não utilizar o Site para enviar ou disponibilizar qualquer conteúdo ilegal, falso, enganador, ameaçador, malicioso, abusivo, difamatório, insultuoso, invasivo da privacidade, racial, ética ou moralmente reprovável, prejudicial ou ofensivo à dignidade das pessoas ou prejudicial aos menores, ou que possa afetar negativamente a marca ou imagem de qualquer empresa da Ourique Smile Lda; Não utilizar o Site para enviar ou disponibilizar informações ou conteúdos que pertençam a terceiros e que não tenha direito de usar; Não utilizar o Site para publicar ou transmitir qualquer material que contenha vírus, worms, bugs, cavalos de Tróia ou outros códigos informáticos, ficheiros ou programas que possam interromper, destruir ou limitar a funcionalidade de qualquer hardware ou software informático ou equipamento de comunicações; Não utilizar ou explorar o Site, incluindo os seus conteúdos, materiais, funcionalidades ou recursos, para fins comerciais ou de qualquer forma mediante pagamento.'
      },
      {
        title: 'Direitos de Propriedade Intelectual',
        content: 'O Utilizador reconhece que o Site, a sua estrutura e layout, a seleção, organização e apresentação do seu conteúdo, incluindo as suas funcionalidades e o software nele utilizado, bem como as marcas, logotipos e símbolos exibidos no Site, são propriedade da Ourique Smile Lda ou foram devidamente licenciados a seu favor. O Utilizador reconhece ainda que os conteúdos deste Site (textos, imagens, gráficos, som e animação e todas as outras informações disponibilizadas) estão protegidos por direitos de propriedade intelectual e compromete-se a respeitar tais direitos. O Utilizador não está autorizado a transmitir, comunicar ao público, publicar, disponibilizar ao público, modificar, transformar, copiar, vender, usar ou distribuir, de qualquer forma, os textos, imagens ou outras informações contidas neste Site ou parte do Site sem autorização prévia por escrito da Ourique Smile Lda.'
      },
      {
        title: 'Dados Pessoais',
        content: 'A utilização deste website não implica necessariamente a prestação de dados pessoais. No entanto, se desejar solicitar contacto e esclarecimento, submeter uma reclamação ou fazer comentários ou sugestões, deve fornecer-nos determinadas informações, incluindo o seu nome e dados de contacto, que serão processados de acordo com os termos estabelecidos na Política de Privacidade, disponível neste website.'
      },
      {
        title: 'Informações',
        content: 'As informações fornecidas no Site destinam-se essencialmente a esclarecer e informar os Utilizadores sobre aspectos relacionados com a atividade e serviços prestados pela empresa Ourique Smile Lda, bem como os produtos que promove e/ou vende.'
      },
      {
        title: 'Responsabilidade e Garantias',
        content: 'O Site foi desenvolvido pela Ourique Smile Lda tendo em mente os interesses dos seus Utilizadores, com o objetivo de divulgar e informar o público da sua atividade, nomeadamente na prestação de cuidados de saúde. No entanto, não podemos garantir que o Site ou qualquer funcionalidade disponível no mesmo atenderá a quaisquer necessidades e expectativas que possa ter ou que servirá os seus propósitos específicos. Em particular, as informações fornecidas no Site não constituem aconselhamento médico, pelo que recomendamos que consulte um profissional devidamente qualificado sempre que necessitar de aconselhamento mais específico. A Ourique Smile Lda também não garante que: Os resultados obtidos através da utilização do Site sejam corretos, verdadeiros, adequados ou fiáveis; Qualquer conselho, recomendação ou informação apresentada ou disponibilizada no Site seja atual, precisa, completa ou isenta de erros; Qualquer material ou outro tipo de conteúdo disponibilizado por terceiros através do Site seja seguro, legal ou apropriado. A Ourique Smile Lda não será responsável por erros que possam ocorrer devido a irregularidades do sistema, falha (temporária ou permanente) do Site, aplicações ou outras ferramentas. A Ourique Smile Lda não será responsável por quaisquer danos resultantes do uso indevido ou incapacidade de usar o Site.'
      },
      {
        title: 'Links para Sites de Terceiros',
        content: 'A Ourique Smile Lda pode fornecer links para páginas pertencentes a outras entidades. Estes sites não são propriedade, operados ou controlados pela Ourique Smile Lda. A Ourique Smile Lda não é, portanto, responsável, aprova ou de qualquer forma endossa ou subscreve o conteúdo destes sites ou os sites ligados ou referidos nos mesmos. O estabelecimento de links não implica, em regra, a existência de relações entre a Ourique Smile Lda e o proprietário ou gestor da página web à qual o link se refere. Portanto, a Ourique Smile Lda não é responsável pela legalidade, fiabilidade ou qualidade de qualquer conteúdo disponibilizado nesses sites, sendo a utilização destes links da exclusiva responsabilidade dos Utilizadores.'
      },
      {
        title: 'Segurança',
        content: 'A Ourique Smile Lda não garante que o Site funcionará ininterruptamente, sem erros ou falhas ou que estará disponível continuamente. A Ourique Smile Lda envidará os seus melhores esforços para garantir que o Site não contenha vírus ou outros elementos deste tipo que possam danificar o seu computador ou dispositivo móvel. No entanto, uma vez que a Ourique Smile Lda não pode controlar totalmente a circulação de informações pela Internet, não pode garantir que não contenha vírus ou outros elementos que possam danificar o seu computador ou dispositivo móvel.'
      },
      {
        title: 'Validade dos Termos e Condições de Utilização',
        content: 'Se qualquer parte ou disposição destes Termos de Utilização for inexequível ou em conflito com a lei aplicável, a validade das restantes partes ou disposições não será afetada.'
      },
      {
        title: 'Questões',
        content: 'Se tiver alguma questão sobre estes Termos de Utilização, envie-nos o seu pedido de esclarecimento através do formulário de contacto, selecionando o assunto "Proteção de Dados" ou por carta para Rua Ferreira Borges 173C, Campo de Ourique, 1350-130 Lisboa. Para outras questões, contacte-nos através do email geral@clinicaferreiraborges.pt ou telefone 935 189 807.'
      },
      {
        title: 'Lei Aplicável',
        content: 'A lei portuguesa será aplicável à gestão, administração, utilização e aplicação dos Termos de Utilização do Site.'
      },
      {
        title: 'Jurisdição',
        content: 'Para dirimir todas as questões e litígios que possam surgir, inerentes a estes Termos e Condições, será aplicável a jurisdição exclusiva do Tribunal da Comarca de Lisboa, renunciando expressamente a qualquer outra jurisdição.'
      }
    ]
  } : {
    title: 'Terms and Conditions',
    lastUpdated: 'Last updated: January 2025',
    intro: 'This website was created, is owned and operated by Ourique Smile Lda, with registered offices at Rua Ferreira Borges 173C, 1350-130 Lisboa, legal person number 510 537 472, and its use is governed by these Terms of Use.',
    sections: [
      {
        title: 'Acceptance of the Terms of Use',
        content: 'The user of the Site (referred as the "User") acknowledges that by using this Site they accept these Terms of Use.'
      },
      {
        title: 'Changes to the Terms of Use',
        content: 'Ourique Smile Lda reserves the right to change these terms and conditions at any time. Changes will take effect immediately after publication on this website.'
      },
      {
        title: 'Site Access',
        content: 'Access to the Site is not subject to registration. Ourique Smile Lda has the exclusive right to, at any time, suspend, partially or totally, access to the Site, in particular in management, maintenance, repair, alteration or modernization operations and to close, definitively or temporarily, partially or totally, at any time, according to its will, the Site or any of the services, without prior notice.'
      },
      {
        title: 'Use of the Site',
        content: 'Use of the Site is subject to compliance with the following rules: Do not use the Site to send or make available any content that is illegal, false, misleading, threatening, malicious, abusive, defamatory, insulting, invasive of privacy, racially, ethically or morally reprehensible, harmful or offensive to the dignity of persons or harmful to minors, or that may negatively affect the brand or image of any Ourique Smile Lda company; Do not use the Site to send or make available information or content that belongs to third parties and that you do not have the right to use; Do not use the Site to post or transmit any material that contains or may contain any viruses, worms, bugs, Trojan horses or other computer code, files or programs that could interrupt, destroy or limit the functionality of any computer hardware or software or communications equipment; Do not use or exploit the Website, including its contents, materials, functionalities or resources, for commercial purposes or in any way for payment.'
      },
      {
        title: 'Intellectual Property Rights',
        content: 'The User acknowledges that the Site, its structure and layout, the selection, organization and presentation of its content, including its functionalities and the software used therein, as well as the trademarks, logos and symbols displayed on the Site, are the property of Ourique Smile Lda or have been duly licensed in its favour. The User further acknowledges that the contents of this Site (texts, images, graphics, sound and animation and all other information made available) are protected by intellectual property rights and undertakes to respect such rights. The User is not authorized to transmit, communicate to the public, publish, make available to the public, modify, transform, copy, sell, use or distribute, in any way, the texts, images or other information contained on this Site or part of the Site without prior written authorization from Ourique Smile Lda.'
      },
      {
        title: 'Personal Data',
        content: 'The use of this website does not necessarily imply the provision of personal data. However, if you wish to request contact and clarification, submit a complaint or make comments or suggestions, you must provide us with certain information, including your name and contact details, which will be processed in accordance with the terms set out in the Privacy Policy, available on this website.'
      },
      {
        title: 'Information',
        content: 'The information provided on the Site is essentially intended to clarify and inform Users about aspects relating to the activity and services provided by the company Ourique Smile Lda, as well as the products it promotes and/or sells.'
      },
      {
        title: 'Liability and Guarantees',
        content: 'The Site was developed by Ourique Smile Lda with the interests of its Users in mind, with the aim of disseminating and informing the public of its activity, namely in the provision of health care. However, we cannot guarantee that the Site or any functionality available on it will meet any needs and expectations you may have or that it will serve your specific purposes. In particular, the information provided on the Site does not constitute medical advice, so we recommend that you consult a suitably qualified professional whenever you need more specific advice. Ourique Smile Lda also does not guarantee that: The results obtained through the use of the Site are correct, true, proper or reliable; Any advice, recommendation or information presented or made available on the Site is current, accurate, complete or error-free; Any material or other type of content made available by third parties through the Site is safe, legal or appropriate. Ourique Smile Lda shall not be liable for errors that may occur due to system irregularities, failure (temporary or permanent) of the Site, applications or other tools. Ourique Smile Lda shall not be liable for any damages resulting from improper use or inability to use the Site.'
      },
      {
        title: 'Links to Third-Party Sites',
        content: 'Ourique Smile Lda may provide links to pages belonging to other entities. These sites are not owned, operated or controlled by Ourique Smile Lda. Ourique Smile Lda is therefore not responsible for, approves or in any way endorses or subscribes to the content of these sites or the sites linked to or referred to in them. The establishment of links does not imply, as a rule, the existence of relations between Ourique Smile Lda and the owner or manager of the web page to which the link refers. Therefore, Ourique Smile Lda is not responsible for the legality, reliability or quality of any content made available there, and the use of these links is the sole responsibility of the Users.'
      },
      {
        title: 'Security',
        content: 'Ourique Smile Lda does not guarantee that the Site will operate uninterruptedly, be free of errors or faults or that it will be available continuously. Ourique Smile Lda makes its best efforts to ensure that the Site does not contain any viruses or other elements of this kind that could damage your computer or mobile device. However, since Ourique Smile Lda cannot fully control the circulation of information over the Internet, it cannot guarantee that it does not contain any viruses or other elements that could damage your computer or mobile device.'
      },
      {
        title: 'Validity of the Terms and Conditions of Use',
        content: 'If any part or provision of these Terms of Use is unenforceable or in conflict with applicable law, the validity of the remaining parts or provisions shall not be affected.'
      },
      {
        title: 'Questions',
        content: 'If you have any questions about these Terms of Use, please send us your request for clarification via the contact form, selecting the subject "Data Protection" or by letter to Rua Ferreira Borges 173C, Campo de Ourique, 1350-130 Lisboa. For other questions, contact us via email at geral@clinicaferreiraborges.pt or phone 935 189 807.'
      },
      {
        title: 'Applicable Law',
        content: 'Portuguese law shall apply to the management, administration, use and enforcement of the Terms of Use of the Site.'
      },
      {
        title: 'Jurisdiction',
        content: 'To settle all questions and disputes that may arise, inherent to these Terms and Conditions, the exclusive jurisdiction of the District Court of Lisbon shall apply, expressly waiving any other jurisdiction.'
      }
    ]
  };

  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'pt' ? 'Legal' : 'Legal'}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#0098AA' }}>
              {content.title}
            </h1>
            <p className="text-sm text-gray-500 mb-6">{content.lastUpdated}</p>
            <p className="text-base text-gray-600 leading-relaxed">{content.intro}</p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {content.sections.map((section, index) => (
                <div key={index} className="pb-8 border-b border-gray-200 last:border-0">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    {section.title}
                  </h2>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Regulatory Info */}
            <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: '#4E5865' }}>
                {locale === 'pt' ? 'Informação Regulamentar' : 'Regulatory Information'}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Entidade Reguladora da Saúde</p>
                <p>N.º Registo ERS: 25393</p>
                <p>Estabelecimento Fixo: E128470</p>
                <p>Licença nº 10984/2015</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
