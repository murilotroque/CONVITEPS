# Convite Interativo ❤️

Uma experiência web divertida para fazer um convite de um jeito diferente. O projeto combina uma interface escura em tons de vermelho, perguntas rápidas, animações leves e um resumo final antes do envio.

## ✨ Destaques

- Visual escuro, moderno e totalmente responsivo.
- Experiência otimizada para celulares.
- Convite direto com respostas claras e respeitosas.
- Escolha de período, rolê e data pelo calendário.
- Campo opcional para observações.
- Resumo editável antes da confirmação.
- Envio real somente após confirmação explícita.
- Feedback de carregamento, sucesso e erro.
- Navegação por teclado e suporte a movimento reduzido.

## 🧭 Como funciona

```text
Boas-vindas
    ↓
Convite principal
    ↓
Período → Rolê → Data e observações
    ↓
Resumo → Confirmação → Encerramento
```

Se a resposta ao convite for negativa, a experiência segue diretamente para o resumo e pode ser finalizada normalmente.

## 🛠️ Tecnologias

- HTML5 semântico
- CSS3 responsivo
- JavaScript puro
- Hospedagem estática

Não há frameworks nem dependências para instalar.

## 🚀 Executar localmente

No PowerShell, dentro da pasta do projeto, execute:

```powershell
py -m http.server 8080
```

Depois abra `http://localhost:8080` no navegador.

## 🎨 Personalização

Os textos, opções, reações, mensagens finais, cores e nome do remetente ficam centralizados em `config.js`.

```js
const CONFIG = {
  nomeRemetente: "MEU_NOME",
  tema: {
    vermelho: "#ef3340",
    vermelhoEscuro: "#8f1421",
    destaque: "#ff6b72",
    fundo: "#09090b"
  },
  textos: {
    // Perguntas, respostas e mensagens da experiência
  }
};
```

Mantenha os identificadores `sim` e `nao` das respostas ao editar o convite, pois eles controlam os caminhos da experiência.

## 📁 Estrutura

```text
.
├── index.html
├── style.css
├── script.js
├── config.js
├── assets/
└── README.md
```

## 🌐 Publicação

O projeto pode ser publicado diretamente no GitHub Pages, Netlify ou Vercel como um site estático. Basta importar o repositório ou enviar estes arquivos, sem comando de build.

---

Feito com HTML, CSS, JavaScript e coragem. ✦
