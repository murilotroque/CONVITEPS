/*
 * Personalize o convite por aqui. O endpoint do Formspree e a chave PUBLICÁVEL
 * do Supabase podem ficar no navegador. Nunca coloque chaves secretas neste arquivo.
 */
const CONFIG = {
  nomeDestinataria: "NOME_DELA",
  nomeRemetente: "MEU_NOME",
  formspreeEndpoint: "https://formspree.io/f/SEU_ID_AQUI",
  supabaseUrl: "https://bvdoncefyfviguxwpesp.supabase.co",
  supabasePublishableKey: "sb_publishable__oBL2o93QXXRBeiYVJb2tg_EKQHu_4t",
  supabaseTable: "respostas_convite",

  tema: {
    rosa: "#f06f9e",
    lilas: "#b990f5",
    roxo: "#7055b8",
    fundo: "#100d1b"
  },

  textos: {
    tituloPagina: "Tenho uma coisinha pra te perguntar...",
    abertura: {
      titulo: "Ei, {nome}, tenho uma coisinha pra te perguntar... 👀",
      subtitulo: "Na verdade, são algumas perguntas. Mas prometo que vale a pena chegar até o final.",
      botao: "Começar ✨"
    },
    disponibilidade: {
      pergunta: "Antes de tudo... como anda sua agenda ultimamente? 🤔",
      opcoes: [
        {
          valor: "Tá bem tranquila 😎",
          reacao: "Interessante... isso facilita algumas coisas 👀"
        },
        {
          valor: "Um pouquinho corrida 😅",
          reacao: "Entendi, vamos ver se encontramos um espacinho então."
        },
        {
          valor: "Depende de quem tá perguntando 👀",
          reacao: "Essa resposta foi suspeitamente interessante KKKK."
        }
      ]
    },
    passeio: {
      introducao: "Agora uma pergunta muito importante...",
      pergunta: "Qual desses rolês você escolheria?",
      opcoes: [
        { valor: "Comer alguma coisa 🍕", icone: "🍕", legenda: "Comida boa resolve muita coisa" },
        { valor: "Cinema 🍿", icone: "🍿", legenda: "Filme, comentários e pipoca" },
        { valor: "Passear e conversar 🌆", icone: "🌆", legenda: "Sem pressa e com assunto" },
        { valor: "Uma surpresa 🎁", icone: "🎁", legenda: "Um pouco de mistério faz bem" }
      ]
    },
    estilo: {
      pergunta: "Qual dessas opções combina mais com você?",
      opcoes: [
        { valor: "Um lugar tranquilo pra conversar.", reacao: "Boa. Conversa boa merece espaço e zero pressa." },
        { valor: "Alguma coisa divertida e diferente.", reacao: "Gostei da energia. Já dá pra pensar em algo fora do óbvio." },
        { valor: "Um passeio sem muito planejamento.", reacao: "Espontaneidade aprovada — com um mínimo de direção, talvez 😅" },
        { valor: "Tanto faz, o importante é a companhia.", reacao: "Essa foi forte... e muito bem colocada 👀" }
      ]
    },
    preparacao: {
      mensagens: [
        "Tá...",
        "Até aqui tudo bem.",
        "Agora vem a verdadeira pergunta...",
        "Promete que não vai rir? 😅"
      ],
      botao: "Pode perguntar 👀"
    },
    convite: {
      pergunta: "Você aceitaria sair comigo qualquer dia desses? 💗",
      apoio: "Sem pegadinha. A resposta é totalmente sua.",
      opcoes: [
        {
          id: "sim",
          valor: "Simm, bora! 💗",
          reacao: "Aí sim! Meu planejamento secreto acaba de ganhar uma chance real ✨"
        },
        {
          id: "talvez",
          valor: "Talvez... vamos conversar sobre isso 👀",
          reacao: "Justo! Conversar é um ótimo começo — sem pressão nenhuma."
        },
        {
          id: "nao",
          valor: "Prefiro não 😅",
          reacao: "Tudo bem! Obrigado por responder e entrar na brincadeira 😊"
        }
      ]
    },
    planejamento: {
      pergunta: "E quando seria um bom dia pra gente combinar alguma coisa?",
      opcoes: [
        "Durante a semana.",
        "No fim de semana.",
        "Ainda não sei.",
        "Quero escolher uma data."
      ],
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
        titulo: "Prontinho! 💗",
        texto: "Agora é só a gente combinar os detalhes."
      },
      talvez: {
        titulo: "Prontinho! ✨",
        texto: "Obrigado por responder. A gente conversa!"
      },
      nao: {
        titulo: "Prontinho! 😊",
        texto: "Obrigado por participar da brincadeira!"
      }
    }
  }
};

window.CONFIG = CONFIG;

