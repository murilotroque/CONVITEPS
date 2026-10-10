# Convite interativo

Site estático, mobile-first e sem frameworks para criar uma experiência divertida de convite. O fluxo guarda as respostas somente na memória do navegador e só envia os dados depois do clique em **Confirmar e enviar**.

## Personalização rápida

Abra `config.js` e altere:

```js
const CONFIG = {
  nomeDestinataria: "NOME_DELA",
  nomeRemetente: "MEU_NOME",
  formspreeEndpoint: "https://formspree.io/f/SEU_ID_AQUI",
  supabaseUrl: "https://SEU_PROJETO.supabase.co",
  supabasePublishableKey: "SUA_CHAVE_PUBLICAVEL_AQUI",
  supabaseTable: "respostas_convite",
  // ...
};
```

- Os nomes, textos, opções, reações, mensagens finais e cores ficam centralizados nesse arquivo.
- Mantenha o `id: "sim"`, `id: "talvez"` e `id: "nao"` das respostas do convite, pois eles controlam os caminhos condicionais.

## Salvar e consultar as respostas no Supabase

O Supabase funciona como banco de dados deste site. Cada confirmação cria uma linha e você consulta tudo em **Table Editor → respostas_convite** no painel do seu projeto.

1. Crie um projeto em [supabase.com](https://supabase.com/).
2. Abra o **SQL Editor**, cole o SQL abaixo e execute uma vez:

```sql
create table public.respostas_convite (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  nome_destinataria text not null,
  nome_remetente text not null,
  disponibilidade text not null,
  preferencia_passeio text not null,
  estilo_encontro text not null,
  resposta_convite text not null,
  resposta_convite_id text not null
    check (resposta_convite_id in ('sim', 'talvez', 'nao')),
  disponibilidade_dia text not null,
  data_escolhida date,
  observacoes text not null
    check (char_length(observacoes) <= 700)
);

alter table public.respostas_convite enable row level security;

revoke all on table public.respostas_convite from anon, authenticated;
grant insert on table public.respostas_convite to anon;

drop policy if exists "visitante pode enviar resposta" on public.respostas_convite;
create policy "visitante pode enviar resposta"
on public.respostas_convite
for insert
to anon
with check (true);
```

3. No painel do Supabase, abra **Connect** ou **Settings → API Keys**.
4. Copie a URL do projeto para `supabaseUrl`.
5. Copie somente a chave pública que começa com `sb_publishable_` para `supabasePublishableKey`.
6. Não use chave `secret` nem `service_role` no site.
7. Faça um envio de teste e confira a nova linha no **Table Editor**.

A política concede ao visitante apenas `INSERT`. Como não existe política nem permissão pública de `SELECT`, quem abre o convite não consegue listar as respostas. Você continua vendo os registros normalmente ao entrar no painel do Supabase como proprietário.

Se Supabase e Formspree estiverem configurados, o site salva no banco e também envia o e-mail. Se apenas um deles estiver configurado, usa somente esse destino. Em uma falha parcial, a nova tentativa envia apenas ao destino pendente para evitar duplicações.

## Ativar o envio real pelo Formspree

1. Crie uma conta em [formspree.io](https://formspree.io/) e crie um formulário.
2. No painel do formulário, configure e verifique o e-mail que receberá as respostas.
3. Copie o endpoint fornecido, no formato `https://formspree.io/f/xxxxxxxx`.
4. Cole o endpoint em `formspreeEndpoint`, dentro de `config.js`.
5. Abra o site por um servidor local e faça um envio de teste. Confira a caixa de entrada e também a pasta de spam.

O endpoint público do formulário pode ficar no navegador. Não coloque senha de e-mail, token privado ou qualquer outra credencial no JavaScript.

Enquanto `SEU_ID_AQUI` não for substituído, o site explica que a integração ainda precisa ser configurada e não finge que houve envio. Em uma falha real, as respostas permanecem na tela e o botão permite tentar novamente.

### Proteção contra spam

O formulário já usa o campo invisível `_gotcha`. No painel do Formspree, habilite também os filtros de spam e demais proteções disponíveis no seu plano. No envio direto ao Supabase, o honeypot bloqueia preenchimentos automáticos simples; para uma proteção mais forte em um link público, use futuramente uma Edge Function com CAPTCHA ou limite de requisições.

## Executar localmente

Por usar apenas HTML, CSS e JavaScript, não há dependências para instalar.

No PowerShell, dentro da pasta do projeto, execute uma das opções:

```powershell
py -m http.server 8080
```

ou:

```powershell
python -m http.server 8080
```

Depois abra `http://localhost:8080`. Usar um servidor local reproduz melhor o comportamento da hospedagem do que abrir o arquivo `index.html` diretamente.

## Publicação

O projeto pode ser publicado como site estático:

- **Netlify:** arraste a pasta `convite-interativo` para o painel de deploy ou conecte um repositório.
- **Vercel:** importe o repositório, selecione esta pasta como diretório raiz e use a configuração estática padrão.
- **GitHub Pages:** envie os arquivos para um repositório e ative Pages nas configurações, apontando para a branch que contém o projeto.

Configure e teste o Supabase e/ou o endpoint do Formspree antes de compartilhar o link final. O site não foi publicado automaticamente.

## Estrutura

```text
convite-interativo/
├── index.html   # estrutura semântica e carregamento
├── style.css    # identidade visual, animações e responsividade
├── script.js    # fluxo, validação, resumo e envios
├── config.js    # textos, nomes, cores e integrações
├── assets/      # espaço para fotos e recursos futuros
└── README.md
```

