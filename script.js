(() => {
  "use strict";

  const config = window.CONFIG;
  const content = config.textos;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const app = {
    experience: document.querySelector("#experience"),
    topbar: document.querySelector("#topbar"),
    backButton: document.querySelector("#backButton"),
    progressBar: document.querySelector("#progressBar"),
    progressTrack: document.querySelector(".progress-track"),
    progressLabel: document.querySelector("#progressLabel"),
    progressPercent: document.querySelector("#progressPercent"),
    toast: document.querySelector("#toast"),
    confetti: document.querySelector("#confetti"),
    sparkles: document.querySelector("#sparkles")
  };

  const answers = {
    disponibilidade: "",
    passeio: "",
    estilo: "",
    convite: "",
    conviteId: "",
    dia: "",
    data: "",
    observacoes: ""
  };

  const state = {
    current: "intro",
    history: [],
    editing: null,
    isTransitioning: false,
    isSending: false,
    timers: [],
    submitted: false,
    delivered: {
      supabase: false,
      formspree: false
    }
  };

  const stages = {
    intro: { progress: 0, label: "Uma surpresa pra você" },
    disponibilidade: { progress: 14, label: "Só aquecendo" },
    passeio: { progress: 28, label: "Conhecendo seu estilo" },
    estilo: { progress: 42, label: "Quase lá" },
    coragem: { progress: 56, label: "Respira fundo..." },
    convite: { progress: 70, label: "A pergunta de verdade" },
    planejamento: { progress: 84, label: "Combinando os detalhes" },
    resumo: { progress: 96, label: "Última conferida" },
    final: { progress: 100, label: "Tudo pronto" }
  };

  const renderers = {
    intro: renderIntro,
    disponibilidade: renderDisponibilidade,
    passeio: renderPasseio,
    estilo: renderEstilo,
    coragem: renderCoragem,
    convite: renderConvite,
    planejamento: renderPlanejamento,
    resumo: renderResumo,
    final: renderFinal
  };

  function element(tag, options = {}, children = []) {
    const node = document.createElement(tag);

    if (options.className) node.className = options.className;
    if (options.text !== undefined) node.textContent = options.text;
    if (options.type) node.type = options.type;
    if (options.id) node.id = options.id;
    if (options.name) node.name = options.name;
    if (options.value !== undefined) node.value = options.value;
    if (options.placeholder) node.placeholder = options.placeholder;

    Object.entries(options.attrs || {}).forEach(([name, value]) => {
      node.setAttribute(name, String(value));
    });

    Object.entries(options.dataset || {}).forEach(([name, value]) => {
      node.dataset[name] = value;
    });

    const normalizedChildren = Array.isArray(children) ? children : [children];
    normalizedChildren.filter(Boolean).forEach((child) => {
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    });

    return node;
  }

  function personalize(text) {
    return String(text)
      .replaceAll("{nome}", config.nomeDestinataria)
      .replaceAll("{remetente}", config.nomeRemetente);
  }

  function createStage(modifier = "") {
    const className = modifier ? `stage stage--${modifier}` : "stage";
    const stage = element("article", { className });
    stage.tabIndex = -1;
    return stage;
  }

  function addHeading(stage, text, level = 2) {
    const heading = element(`h${level}`, { text: personalize(text) });
    stage.append(heading);
    return heading;
  }

  function addEyebrow(stage, text) {
    stage.append(element("p", { className: "eyebrow", text }));
  }

  function createButton(text, className = "primary-button") {
    return element("button", { className, text, type: "button" });
  }

  function createChoice(text, selected = false) {
    const button = element("button", {
      className: `choice${selected ? " is-selected" : ""}`,
      text,
      type: "button",
      attrs: { "aria-pressed": selected }
    });
    return button;
  }

  function lockChoices(container, selectedButton) {
    container.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
      button.setAttribute("aria-pressed", String(button === selectedButton));
      button.classList.toggle("is-selected", button === selectedButton);
    });
  }

  function addReaction(stage, text) {
    const previous = stage.querySelector(".reaction");
    if (previous) previous.remove();
    const reaction = element("div", {
      className: "reaction",
      text,
      attrs: { role: "status" }
    });
    stage.append(reaction);
    reaction.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "nearest" });
  }

  function later(callback, delay) {
    const timer = window.setTimeout(callback, reduceMotion.matches ? Math.min(delay, 80) : delay);
    state.timers.push(timer);
    return timer;
  }

  function clearTimers() {
    state.timers.forEach(window.clearTimeout);
    state.timers = [];
  }

  function updateProgress() {
    const info = stages[state.current];
    const isIntro = state.current === "intro";
    const isFinal = state.current === "final";
    app.topbar.hidden = isIntro;
    app.backButton.hidden = isFinal || state.submitted;

    app.progressBar.style.width = `${info.progress}%`;
    app.progressTrack.setAttribute("aria-valuenow", String(info.progress));
    app.progressLabel.textContent = info.label;
    app.progressPercent.textContent = `${info.progress}%`;
  }

  function renderCurrent() {
    clearTimers();
    app.experience.replaceChildren(renderers[state.current]());
    updateProgress();
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
    later(() => app.experience.querySelector(".stage")?.focus({ preventScroll: true }), 40);
  }

  function goTo(nextStage, options = {}) {
    if (state.isTransitioning || nextStage === state.current) return;

    const { addHistory = true } = options;
    state.isTransitioning = true;
    clearTimers();

    if (addHistory) state.history.push(state.current);
    const currentElement = app.experience.querySelector(".stage");
    currentElement?.classList.add("is-leaving");

    window.setTimeout(() => {
      state.current = nextStage;
      state.isTransitioning = false;
      renderCurrent();
    }, reduceMotion.matches ? 10 : 230);
  }

  function returnAfterEdit(field) {
    if (state.editing !== field) return false;
    state.editing = null;
    later(() => goTo("resumo", { addHistory: false }), 850);
    return true;
  }

  function renderIntro() {
    const stage = createStage("intro");
    stage.append(element("div", { className: "intro-mark", text: "✦", attrs: { "aria-hidden": true } }));
    addHeading(stage, content.abertura.titulo, 1);
    stage.append(element("p", { className: "lead", text: content.abertura.subtitulo }));

    const start = createButton(content.abertura.botao);
    start.addEventListener("click", () => goTo("disponibilidade"));
    stage.append(element("div", { className: "button-row" }, start));
    return stage;
  }

  function renderDisponibilidade() {
    const stage = createStage();
    addEyebrow(stage, "Pergunta 01");
    addHeading(stage, content.disponibilidade.pergunta);

    const choices = element("div", { className: "choices", attrs: { role: "group", "aria-label": "Opções de disponibilidade" } });
    content.disponibilidade.opcoes.forEach((option) => {
      const button = createChoice(option.valor, answers.disponibilidade === option.valor);
      button.addEventListener("click", () => {
        answers.disponibilidade = option.valor;
        lockChoices(choices, button);
        addReaction(stage, option.reacao);
        if (!returnAfterEdit("disponibilidade")) later(() => goTo("passeio"), 1100);
      });
      choices.append(button);
    });
    stage.append(choices);
    return stage;
  }

  function renderPasseio() {
    const stage = createStage();
    addEyebrow(stage, content.passeio.introducao);
    const heading = addHeading(stage, content.passeio.pergunta);
    heading.classList.add("delayed-question");

    const choices = element("div", { className: "choices choices--grid", attrs: { role: "group", "aria-label": "Preferências de passeio" } });
    content.passeio.opcoes.forEach((option) => {
      const icon = element("span", { className: "choice-icon", text: option.icone, attrs: { "aria-hidden": true } });
      const title = element("span", { className: "choice-title", text: option.valor });
      const note = element("span", { className: "choice-note", text: option.legenda });
      const button = element("button", {
        className: `choice choice--card${answers.passeio === option.valor ? " is-selected" : ""}`,
        type: "button",
        attrs: { "aria-pressed": answers.passeio === option.valor }
      }, [icon, title, note]);

      button.addEventListener("click", () => {
        answers.passeio = option.valor;
        lockChoices(choices, button);
        showToast("Boa escolha — anotado ✨");
        if (!returnAfterEdit("passeio")) later(() => goTo("estilo"), 650);
      });
      choices.append(button);
    });
    stage.append(choices);
    return stage;
  }

  function renderEstilo() {
    const stage = createStage();
    addEyebrow(stage, "Pergunta 03");
    addHeading(stage, content.estilo.pergunta);

    const choices = element("div", { className: "choices", attrs: { role: "group", "aria-label": "Opções de estilo de encontro" } });
    content.estilo.opcoes.forEach((option) => {
      const button = createChoice(option.valor, answers.estilo === option.valor);
      button.addEventListener("click", () => {
        answers.estilo = option.valor;
        lockChoices(choices, button);
        addReaction(stage, option.reacao);
        if (!returnAfterEdit("estilo")) later(() => goTo("coragem"), 1150);
      });
      choices.append(button);
    });
    stage.append(choices);
    return stage;
  }

  function renderCoragem() {
    const stage = createStage("courage");
    const sequence = element("div", { className: "message-sequence", attrs: { "aria-live": "polite" } });
    const buttonRow = element("div", { className: "button-row" });
    stage.append(sequence, buttonRow);

    content.preparacao.mensagens.forEach((message, index) => {
      later(() => {
        sequence.append(element("p", { className: "sequence-line", text: message }));
      }, index * 570);
    });

    later(() => {
      const reveal = createButton(content.preparacao.botao);
      reveal.addEventListener("click", () => goTo("convite"));
      buttonRow.append(reveal);
      reveal.focus({ preventScroll: true });
    }, content.preparacao.mensagens.length * 570 + 140);

    return stage;
  }

  function renderConvite() {
    const stage = createStage("invite");
    stage.append(element("div", { className: "invite-mark", text: "💗", attrs: { "aria-hidden": true } }));
    addHeading(stage, content.convite.pergunta);
    stage.append(element("p", { className: "lead", text: content.convite.apoio }));

    const choices = element("div", { className: "choices invite-options", attrs: { role: "group", "aria-label": "Respostas ao convite" } });
    content.convite.opcoes.forEach((option) => {
      const button = createChoice(option.valor, answers.conviteId === option.id);
      button.dataset.answer = option.id;
      button.addEventListener("click", () => {
        answers.convite = option.valor;
        answers.conviteId = option.id;

        if (option.id === "nao") {
          answers.dia = "";
          answers.data = "";
          answers.observacoes = "";
        }

        lockChoices(choices, button);
        addReaction(stage, option.reacao);
        if (option.id === "sim") launchConfetti();

        if (state.editing === "convite") {
          state.editing = null;
          const destination = option.id === "nao" ? "resumo" : "planejamento";
          later(() => goTo(destination, { addHistory: false }), 1150);
          return;
        }

        const destination = option.id === "nao" ? "resumo" : "planejamento";
        later(() => goTo(destination), 1300);
      });
      choices.append(button);
    });
    stage.append(choices);
    return stage;
  }

  function renderPlanejamento() {
    const stage = createStage();
    addEyebrow(stage, "Só mais um detalhe");
    addHeading(stage, content.planejamento.pergunta);

    const dayChoices = element("div", {
      className: "choices",
      attrs: { role: "radiogroup", "aria-label": "Preferência de dia" }
    });

    const dateGroup = element("div", { className: "field-group", attrs: { hidden: true } });
    const dateLabel = element("label", { className: "field-label", text: "Qual data funciona melhor?", attrs: { for: "specificDate" } });
    const dateInput = element("input", {
      className: "date-field",
      id: "specificDate",
      name: "specificDate",
      type: "date",
      value: answers.data,
      attrs: { min: todayLocal(), "aria-describedby": "dateHint" }
    });
    const dateHint = element("p", { className: "field-hint", id: "dateHint", text: "Escolha hoje ou uma data futura." });
    dateGroup.append(dateLabel, dateHint, dateInput);

    const continueButton = createButton(state.editing === "planejamento" ? "Salvar alterações" : "Continuar");
    continueButton.disabled = !answers.dia || (isSpecificDate() && !answers.data);

    content.planejamento.opcoes.forEach((option) => {
      const selected = answers.dia === option;
      const button = element("button", {
        className: `choice planning-choice${selected ? " is-selected" : ""}`,
        text: option,
        type: "button",
        attrs: { role: "radio", "aria-checked": selected }
      });

      button.addEventListener("click", () => {
        answers.dia = option;
        if (!isSpecificDate()) answers.data = "";
        dayChoices.querySelectorAll("button").forEach((item) => {
          const isSelected = item === button;
          item.classList.toggle("is-selected", isSelected);
          item.setAttribute("aria-checked", String(isSelected));
        });
        dateGroup.hidden = !isSpecificDate();
        continueButton.disabled = isSpecificDate() ? !answers.data : false;
        if (isSpecificDate()) later(() => dateInput.focus(), 80);
      });
      dayChoices.append(button);
    });

    dateGroup.hidden = !isSpecificDate();
    dateInput.addEventListener("change", () => {
      if (dateInput.value && dateInput.value < todayLocal()) {
        dateInput.setCustomValidity("Escolha uma data de hoje em diante.");
        dateInput.reportValidity();
        answers.data = "";
        continueButton.disabled = true;
        return;
      }
      dateInput.setCustomValidity("");
      answers.data = dateInput.value;
      continueButton.disabled = !answers.data;
    });

    const notesGroup = element("div", { className: "field-group" });
    const notesLabel = element("label", {
      className: "field-label",
      text: content.planejamento.observacao,
      attrs: { for: "notes" }
    });
    const notes = element("textarea", {
      className: "text-field",
      id: "notes",
      name: "notes",
      value: answers.observacoes,
      placeholder: content.planejamento.placeholder,
      attrs: { maxlength: 700 }
    });
    notes.addEventListener("input", () => {
      answers.observacoes = notes.value.trimStart();
    });
    notesGroup.append(notesLabel, notes);

    continueButton.addEventListener("click", () => {
      if (!answers.dia) {
        showToast("Escolha uma opção de dia para continuar.");
        return;
      }
      if (isSpecificDate() && !isValidFutureDate(answers.data)) {
        dateInput.setCustomValidity("Escolha uma data de hoje em diante.");
        dateInput.reportValidity();
        return;
      }
      answers.observacoes = notes.value.trim();
      state.editing = null;
      goTo("resumo");
    });

    stage.append(dayChoices, dateGroup, notesGroup, element("div", { className: "button-row" }, continueButton));
    return stage;
  }

  function renderResumo() {
    const stage = createStage();
    addEyebrow(stage, "Resumo");
    addHeading(stage, content.resumo.titulo);
    stage.append(element("p", { className: "lead", text: personalize(content.resumo.subtitulo) }));

    const summary = element("div", { className: "summary-card" });
    const rows = [
      ["Disponibilidade", answers.disponibilidade, "disponibilidade", "disponibilidade"],
      ["Rolê preferido", answers.passeio, "passeio", "passeio"],
      ["Estilo do encontro", answers.estilo, "estilo", "estilo"],
      ["Resposta ao convite", answers.convite, "convite", "convite"]
    ];

    if (answers.conviteId !== "nao") {
      rows.push(["Preferência de dia", answers.dia, "planejamento", "planejamento"]);
      rows.push(["Data escolhida", answers.data ? formatDate(answers.data) : "Não se aplica", "planejamento", "planejamento"]);
      rows.push(["Observações", answers.observacoes || "Nenhuma observação", "planejamento", "planejamento"]);
    }

    rows.forEach(([label, value, target, field]) => {
      const copy = element("div", { className: "summary-copy" }, [
        element("span", { className: "summary-label", text: label }),
        element("span", { className: "summary-value", text: value || "Não respondido" })
      ]);
      const edit = element("button", {
        className: "edit-button",
        type: "button",
        text: "Alterar",
        attrs: { "aria-label": `Alterar ${label.toLowerCase()}` }
      });
      edit.addEventListener("click", () => {
        state.editing = field;
        goTo(target, { addHistory: false });
      });
      summary.append(element("div", { className: "summary-row" }, [copy, edit]));
    });

    const honeypot = element("input", {
      className: "honeypot",
      id: "website",
      name: "_gotcha",
      type: "text",
      attrs: { tabindex: "-1", autocomplete: "off", "aria-hidden": "true" }
    });

    const consent = element("p", { className: "consent-note", text: content.resumo.aviso });
    const status = element("p", { className: "send-status", attrs: { role: "status", "aria-live": "polite" } });
    const sendButton = createButton(content.resumo.botao);
    sendButton.addEventListener("click", () => submitAnswers(sendButton, status, honeypot));

    stage.append(summary, consent, honeypot, status, element("div", { className: "button-row" }, sendButton));
    return stage;
  }

  function renderFinal() {
    const finalCopy = content.finais[answers.conviteId] || content.finais.talvez;
    const stage = createStage("final");
    const icon = answers.conviteId === "sim" ? "💌" : answers.conviteId === "talvez" ? "✨" : "😊";
    stage.append(element("div", { className: "final-mark", text: icon, attrs: { "aria-hidden": true } }));
    addHeading(stage, finalCopy.titulo, 1);
    stage.append(element("p", { className: "lead", text: finalCopy.text }));
    stage.append(element("p", { className: "final-signature", text: `— ${config.nomeRemetente}` }));
    if (answers.conviteId === "sim") later(launchConfetti, 180);
    return stage;
  }

  function validateAnswers() {
    if (!answers.disponibilidade || !answers.passeio || !answers.estilo || !answers.convite) {
      return "Alguma resposta obrigatória ficou faltando. Volte e confira o resumo.";
    }
    if (answers.conviteId !== "nao" && !answers.dia) {
      return "Escolha uma preferência de dia antes de enviar.";
    }
    if (answers.conviteId !== "nao" && isSpecificDate() && !isValidFutureDate(answers.data)) {
      return "A data escolhida precisa ser hoje ou uma data futura.";
    }
    return "";
  }

  function formspreeIsConfigured() {
    const endpoint = String(config.formspreeEndpoint || "").trim();
    if (!/^https:\/\/formspree\.io\/f\/[a-z0-9]+$/i.test(endpoint)) return false;
    return !/(SEU_ID|XXXX|EXEMPLO)/i.test(endpoint);
  }

  function supabaseIsConfigured() {
    const url = String(config.supabaseUrl || "").trim();
    const key = String(config.supabasePublishableKey || "").trim();
    const table = String(config.supabaseTable || "").trim();

    return (
      /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url) &&
      /^sb_publishable_[a-z0-9_-]+$/i.test(key) &&
      /^[a-z_][a-z0-9_]*$/i.test(table) &&
      !/(SEU_PROJETO|SUA_CHAVE|EXEMPLO)/i.test(`${url} ${key}`)
    );
  }

  async function submitAnswers(button, status, honeypot) {
    if (state.isSending || state.submitted) return;

    const validationError = validateAnswers();
    if (validationError) {
      showSendError(status, validationError);
      return;
    }

    const useSupabase = supabaseIsConfigured();
    const useFormspree = formspreeIsConfigured();

    if (!useSupabase && !useFormspree) {
      showSendError(
        status,
        "O envio ainda não está configurado. Quem criou o convite precisa configurar o Supabase ou o Formspree no arquivo config.js. Suas respostas continuam aqui."
      );
      return;
    }

    if (honeypot.value) {
      showSendError(status, "Não foi possível validar este envio. Recarregue a página e tente novamente.");
      return;
    }

    state.isSending = true;
    button.disabled = true;
    button.replaceChildren(
      element("span", { className: "button-loader", attrs: { "aria-hidden": true } }),
      document.createTextNode("Enviando com carinho...")
    );
    status.classList.remove("is-error");
    status.textContent = useSupabase ? "Salvando as respostas com segurança..." : "Enviando as respostas por e-mail...";

    try {
      if (useSupabase && !state.delivered.supabase) {
        await sendToSupabase();
        state.delivered.supabase = true;
      }

      if (useFormspree && !state.delivered.formspree) {
        status.textContent = useSupabase ? "Salvo no banco. Enviando também por e-mail..." : "Enviando as respostas por e-mail...";
        await sendToFormspree(honeypot.value);
        state.delivered.formspree = true;
      }

      state.submitted = true;
      status.textContent = "Enviado com sucesso!";
      goTo("final");
    } catch (error) {
      const partialDelivery = state.delivered.supabase || state.delivered.formspree;
      if (partialDelivery) lockSummaryEditing();
      const baseMessage = error instanceof TypeError
        ? "Não foi possível conectar ao serviço de envio. Verifique a internet e tente novamente."
        : error.message;
      const retryMessage = partialDelivery
        ? "O que já foi enviado não será duplicado; tente novamente para concluir o destino restante."
        : "Suas respostas foram mantidas; você pode tentar novamente.";
      showSendError(
        status,
        `${baseMessage} ${retryMessage}`
      );
      button.replaceChildren(document.createTextNode("Tentar enviar novamente 💌"));
      button.disabled = false;
    } finally {
      state.isSending = false;
    }
  }

  function buildAnswerRecord() {
    const planningApplies = answers.conviteId !== "nao";
    return {
      nome_destinataria: config.nomeDestinataria,
      nome_remetente: config.nomeRemetente,
      disponibilidade: answers.disponibilidade,
      preferencia_passeio: answers.passeio,
      estilo_encontro: answers.estilo,
      resposta_convite: answers.convite,
      resposta_convite_id: answers.conviteId,
      disponibilidade_dia: planningApplies ? answers.dia || "Não se aplica" : "Não se aplica",
      data_escolhida: planningApplies && answers.data ? answers.data : null,
      observacoes: planningApplies ? answers.observacoes || "Não se aplica" : "Não se aplica"
    };
  }

  async function sendToSupabase() {
    const baseUrl = String(config.supabaseUrl).replace(/\/+$/, "");
    const table = encodeURIComponent(config.supabaseTable);
    const response = await fetch(`${baseUrl}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: config.supabasePublishableKey,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(buildAnswerRecord())
    });

    if (!response.ok) {
      let detail = "Não foi possível salvar as respostas no banco de dados.";
      try {
        const data = await response.json();
        if (data?.message) detail = `O banco de dados recusou o envio: ${data.message}`;
      } catch {
        // Mantém a mensagem amigável quando a resposta não é JSON.
      }
      throw new Error(detail);
    }
  }

  async function sendToFormspree(honeypotValue) {
    const payload = new FormData();
    const record = buildAnswerRecord();
    payload.append("_subject", "💌 Nova resposta ao convite interativo");
    payload.append("Identificação", `Convite de ${config.nomeRemetente} para ${config.nomeDestinataria}`);
    payload.append("Disponibilidade", record.disponibilidade);
    payload.append("Preferência de passeio", record.preferencia_passeio);
    payload.append("Estilo de encontro", record.estilo_encontro);
    payload.append("Resposta ao convite", record.resposta_convite);
    payload.append("Disponibilidade de dia", record.disponibilidade_dia);
    payload.append("Data escolhida", record.data_escolhida ? formatDate(record.data_escolhida) : "Não se aplica");
    payload.append("Observações", record.observacoes);
    payload.append("_gotcha", honeypotValue);

    const response = await fetch(config.formspreeEndpoint, {
      method: "POST",
      body: payload,
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      let message = "Não foi possível enviar o e-mail agora.";
      try {
        const data = await response.json();
        if (Array.isArray(data.errors) && data.errors[0]?.message) message = data.errors[0].message;
      } catch {
        // Mantém a mensagem amigável quando a resposta não é JSON.
      }
      throw new Error(message);
    }
  }

  function lockSummaryEditing() {
    app.experience.querySelectorAll(".edit-button").forEach((editButton) => {
      editButton.disabled = true;
      editButton.title = "Uma parte do envio já foi concluída; termine o envio antes de alterar as respostas.";
    });
  }

  function showSendError(status, message) {
    status.classList.add("is-error");
    status.textContent = message;
    status.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "nearest" });
  }

  function isSpecificDate() {
    const specificDateOption = content.planejamento.opcoes.at(-1);
    return answers.dia === specificDateOption;
  }

  function todayLocal() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function isValidFutureDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= todayLocal();
  }

  function formatDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Não se aplica";
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  let toastTimer = 0;
  function showToast(message) {
    window.clearTimeout(toastTimer);
    app.toast.textContent = message;
    app.toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => app.toast.classList.remove("is-visible"), 1700);
  }

  function launchConfetti() {
    if (reduceMotion.matches) return;
    app.confetti.replaceChildren();
    const colors = ["#f06f9e", "#b990f5", "#7055b8", "#ffd166", "#ffffff"];
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < 34; index += 1) {
      const piece = element("span", { className: "confetti-piece" });
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.setProperty("--confetti-color", colors[index % colors.length]);
      piece.style.setProperty("--fall-duration", `${1.9 + Math.random() * 1.6}s`);
      piece.style.setProperty("--fall-delay", `${Math.random() * 0.35}s`);
      piece.style.setProperty("--drift-x", `${-70 + Math.random() * 140}px`);
      piece.style.setProperty("--rotation", `${360 + Math.random() * 720}deg`);
      fragment.append(piece);
    }

    app.confetti.append(fragment);
    window.setTimeout(() => app.confetti.replaceChildren(), 3900);
  }

  function createSparkles() {
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 16; index += 1) {
      const sparkle = element("span", { className: "sparkle" });
      sparkle.style.left = `${4 + Math.random() * 92}%`;
      sparkle.style.top = `${4 + Math.random() * 90}%`;
      sparkle.style.setProperty("--duration", `${6 + Math.random() * 7}s`);
      sparkle.style.setProperty("--delay", `${-Math.random() * 8}s`);
      fragment.append(sparkle);
    }
    app.sparkles.append(fragment);
  }

  function applyTheme() {
    const theme = config.tema || {};
    const root = document.documentElement;
    if (theme.rosa) root.style.setProperty("--pink", theme.rosa);
    if (theme.lilas) root.style.setProperty("--lilac", theme.lilas);
    if (theme.roxo) root.style.setProperty("--purple", theme.roxo);
    if (theme.fundo) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.fundo);
    document.title = personalize(content.tituloPagina);
  }

  app.backButton.addEventListener("click", () => {
    if (state.isTransitioning || state.isSending || state.submitted) return;

    if (state.delivered.supabase || state.delivered.formspree) {
      showToast("Conclua o destino pendente antes de alterar as respostas.");
      return;
    }

    if (state.editing) {
      state.editing = null;
      goTo("resumo", { addHistory: false });
      return;
    }

    let previous = state.history.pop();
    if (!previous) previous = "intro";
    goTo(previous, { addHistory: false });
  });

  applyTheme();
  createSparkles();
  renderCurrent();
})();
