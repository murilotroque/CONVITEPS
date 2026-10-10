/*
 * Personalize o convite por aqui. O endpoint do Formspree e a chave PUBLICÁVEL
 * do Supabase podem ficar no navegador. Nunca coloque chaves secretas neste arquivo.
 */
const CONFIG = {
  nomeRemetente: "MEU_NOME",
  formspreeEndpoint: "https://formspree.io/f/SEU_ID_AQUI",
  supabaseUrl: "https://bvdoncefyfviguxwpesp.supabase.co",
  supabasePublishableKey: "sb_publishable__oBL2o93QXXRBeiYVJb2tg_EKQHu_4t",
  supabaseTable: "respostas_convite",

  tema: {
    vermelho: "#ef3340",
    vermelhoEscuro: "#8f1421",
    destaque: "#ff6b72",
    fundo: "#09090b"
  },

  textos: {
    tituloPagina: "Tenho uma coisinha pra te perguntar...",
    abertura: {
      titulo: "Ei, tenho uma coisinha pra te perguntar... 👀",
      subtitulo: "É rapidinho. Mas prometo que vale a pena chegar até o final.",
      botao: "Começar ✦"
    },
    convite: {
      pergunta: "Você aceitaria sair comigo qualquer dia desses? ❤️",
      apoio: "Sem pegadinha e sem pressão. A resposta é totalmente sua.",
      opcoes: [
        {
          id: "sim",
          valor: "Sim, bora! ❤️",
          reacao: "Aí sim! Agora vamos aos detalhes ✨"
        },
        {
          id: "nao",
          valor: "Prefiro não",
          reacao: "Tudo bem! Obrigado por responder com sinceridade 😊"
        }
      ]
    },
    periodo: {
      pergunta: "Qual período combina mais com você?",
      apoio: "Escolha o horário em que você costuma ficar mais à vontade.",
      opcoes: [
        { valor: "Dia ☀️", icone: "☀️", legenda: "Luz, energia e tempo de sobra" },
        { valor: "Tarde 🌤️", icone: "🌤️", legenda: "Um meio-termo perfeito" },
        { valor: "Noite 🌙", icone: "🌙", legenda: "Clima bom e conversa sem pressa" }
      ]
    },
    passeio: {
      introducao: "Agora escolha a vibe",
      pergunta: "Qual desses rolês você toparia?",
      apoio: "Vale escolher pelo estômago, pela curiosidade ou pelos dois.",
      opcoes: [
        { valor: "Sushi 🍣", icone: "🍣", legenda: "Combinados e conversa boa" },
        { valor: "Pizza 🍕", icone: "🍕", legenda: "Clássico que nunca decepciona" },
        { valor: "Massa 🍝", icone: "🍝", legenda: "Confortável e caprichado" },
        { valor: "Hambúrguer 🍔", icone: "🍔", legenda: "Casual e sem cerimônia" },
        { valor: "Cinema 🍿", icone: "🍿", legenda: "Filme, comentários e pipoca" },
        { valor: "Passear e conversar 🌆", icone: "🌆", legenda: "Sem pressa e com assunto" },
        { valor: "Café e sobremesa ☕", icone: "☕", legenda: "Doce, tranquilo e certeiro" },
        { valor: "Uma surpresa 🎁", icone: "🎁", legenda: "Um pouco de mistério faz bem" }
      ]
    },
    planejamento: {
      pergunta: "Qual dia funciona melhor pra você?",
      apoio: "Escolha uma data a partir de hoje.",
      observacao: "Tem algum lugar em mente ou alguma observação? 👀",
      placeholder: "Pode escrever aqui (opcional)..."
    },
    resumo: {
      titulo: "Só pra conferir...",
      subtitulo: "Estas são as respostas que serão enviadas para {remetente}.",
      aviso: "Nada será enviado até você tocar em “Confirmar e enviar”.",
      botao: "Confirmar e enviar 💌"
    },
    finais: {
      sim: {
        titulo: "Prontinho! ❤️",
        texto: "Agora é só a gente combinar os detalhes."
      },
      nao: {
        titulo: "Prontinho! 😊",
        texto: "Obrigado por participar da brincadeira!"
      }
    }
  }
};

window.CONFIG = CONFIG;
