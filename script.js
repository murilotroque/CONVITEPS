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
    periodo: "",
    passeio: "",
    convite: "",
    conviteId: "",
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
    convite: { progress: 25, label: "A pergunta de verdade" },
    periodo: { progress: 45, label: "Escolhendo o melhor horário" },
    passeio: { progress: 65, label: "Montando o rolê" },
    planejamento: { progress: 82, label: "Marcando no calendário" },
    resumo: { progress: 96, label: "Última conferida" },
    final: { progress: 100, label: "Tudo pronto" }
  };

  const renderers = {
    intro: renderIntro,
    convite: renderConvite,
    periodo: renderPeriodo,
    passeio: renderPasseio,
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
    return String(text).replaceAll("{remetente}", config.nomeRemetente);
  }

  function createStage(modifier = "") {
    const stage = element("article", { className: modifier ? `stage stage--${modifier}` : "stage" });
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

  function createChoice(text, selected = false, className = "") {
    return element("button", {
      className: `choice${className ? ` ${className}` : ""}${selected ? " is-selected" : ""}`,
      text,
      type: "button",
      attrs: { "aria-pressed": selected }
    });
  }

  function lockChoices(container, selectedButton) {
    container.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
      button.setAttribute("aria-pressed", String(button === selectedButton));
      button.classList.toggle("is-selected", button === selectedButton);
    });
  }

  function addReaction(stage, text) {
    stage.querySelector(".reaction")?.remove();
    const reaction = element("div", {
      className: "reaction",
      text,
      attrs: { role: "status" }
    });
    stage.append(reaction);
    reaction.scrollIntoView({ behavior: "auto", block: "nearest" });
  }

  function later(callback, delay) {
    const timer = window.setTimeout(callback, reduceMotion.matches ? Math.min(delay, 60) : delay);
    state.timers.push(timer);
    return timer;
  }

  function clearTimers() {
    state.timers.forEach(window.clearTimeout);
    state.timers = [];
  }

  function updateProgress() {
    const info = stages[state.current];
    app.topbar.hidden = state.current === "intro";
    app.backButton.hidden = state.current === "final" || state.submitted;
    app.progressBar.style.width = `${info.progress}%`;
    app.progressTrack.setAttribute("aria-valuenow", String(info.progress));
    app.progressLabel.textContent = info.label;
    app.progressPercent.textContent = `${info.progress}%`;
  }

  function renderCurrent() {
    clearTimers();
    app.experience.replaceChildren(renderers[state.current]());
    updateProgress();
    window.scrollTo({ top: 0, behavior: "auto" });
    later(() => app.experience.querySelector(".stage")?.focus({ preventScroll: true }), 30);
  }

  function goTo(nextStage, options = {}) {
    if (state.isTransitioning || nextStage === state.current) return;
    const { addHistory = true } = options;
    state.isTransitioning = true;
    clearTimers();
    if (addHistory) state.history.push(state.current);
    app.experience.querySelector(".stage")?.classList.add("is-leaving");

    window.setTimeout(() => {
      state.current = nextStage;
      state.isTransitioning = false;
      renderCurrent();
    }, reduceMotion.matches ? 10 : 160);
  }

  function returnAfterEdit(field) {
    if (state.editing !== field) return false;
    state.editing = null;
    later(() => goTo("resumo", { addHistory: false }), 360);
    return true;
  }

  function renderIntro() {
    const stage = createStage("intro");
    stage.append(element("div", { className: "intro-mark", text: "✦", attrs: { "aria-hidden": true } }));
    addHeading(stage, content.abertura.titulo, 1);
    stage.append(element("p", { className: "lead", text: content.abertura.subtitulo }));
    const start = createButton(content.abertura.botao);
    start.addEventListener("click", () => goTo("convite"));
    stage.append(element("div", { className: "button-row" }, start));
    return stage;
  }

  function renderConvite() {
    const stage = createStage("invite");
    stage.append(element("div", { className: "invite-mark", text: "❤️", attrs: { "aria-hidden": true } }));
    addHeading(stage, content.convite.pergunta);
    stage.append(element("p", { className: "lead", text: content.convite.apoio }));

    const choices = element("div", {
      className: "choices invite-options",
      attrs: { role: "group", "aria-label": "Respostas ao convite" }
    });

    content.convite.opcoes.forEach((option) => {
      const modifier = option.id === "nao" ? "choice--decline" : "choice--accept";
      const button = createChoice(option.valor, answers.conviteId === option.id, modifier);
      button.dataset.answer = option.id;
      button.addEventListener("click", () => {
        answers.convite = option.valor;
        answers.conviteId = option.id;
        lockChoices(choices, button);
        addReaction(stage, option.reacao);

        if (option.id === "nao") {
          answers.periodo = "";
          answers.passeio = "";
          answers.data = "";
          answers.observacoes = "";
        } else {
          launchConfetti();
        }

        let destination = option.id === "nao" ? "resumo" : "periodo";
        if (state.editing === "convite") {
          state.editing = null;
          if (option.id === "sim" && answers.periodo && answers.passeio && answers.data) destination = "resumo";
          later(() => goTo(destination, { addHistory: false }), 480);
          return;
        }

        later(() => goTo(destination), 480);
      });
      choices.append(button);
    });

    stage.append(choices);
    return stage;
  }

  function renderPeriodo() {
    const stage = createStage();
    addEyebrow(stage, "Primeiro detalhe");
    addHeading(stage, content.periodo.pergunta);
    stage.append(element("p", { className: "lead lead--left", text: content.periodo.apoio }));

    const choices = element("div", {
      className: "choices choices--period",
      attrs: { role: "group", "aria-label": "Período preferido" }
    });

    content.periodo.opcoes.forEach((option) => {
      const button = createCardChoice(option, answers.periodo === option.valor);
      button.addEventListener("click", () => {
        answers.periodo = option.valor;
        lockChoices(choices, button);
        showToast("Período anotado ✓");
        if (!returnAfterEdit("periodo")) later(() => goTo("passeio"), 320);
      });
      choices.append(button);
    });

    stage.append(choices);
    return stage;
  }

  function renderPasseio() {
    const stage = createStage();
    addEyebrow(stage, content.passeio.introducao);
    addHeading(stage, content.passeio.pergunta);
    stage.append(element("p", { className: "lead lead--left", text: content.passeio.apoio }));

    const choices = element("div", {
      className: "choices choices--grid",
      attrs: { role: "group", "aria-label": "Preferências de passeio" }
    });

    content.passeio.opcoes.forEach((option) => {
      const button = createCardChoice(option, answers.passeio === option.valor);
      button.addEventListener("click", () => {
        answers.passeio = option.valor;
        lockChoices(choices, button);
        showToast("Boa escolha — anotado ✓");
        if (!returnAfterEdit("passeio")) later(() => goTo("planejamento"), 320);
      });
      choices.append(button);
    });

    stage.append(choices);
    return stage;
  }

  function createCardChoice(option, selected) {
    return element("button", {
      className: `choice choice--card${selected ? " is-selected" : ""}`,
      type: "button",
      attrs: { "aria-pressed": selected }
    }, [
      element("span", { className: "choice-icon", text: option.icone, attrs: { "aria-hidden": true } }),
      element("span", { className: "choice-title", text: option.valor }),
      element("span", { className: "choice-note", text: option.legenda })
    ]);
  }

  function renderPlanejamento() {
    const stage = createStage();
    addEyebrow(stage, "Último detalhe");
    addHeading(stage, content.planejamento.pergunta);
    stage.append(element("p", { className: "lead lead--left", text: content.planejamento.apoio }));

    const dateGroup = element("div", { className: "calendar-card" });
    const dateLabel = element("label", {
      className: "field-label",
      text: "Escolha uma data",
      attrs: { for: "specificDate" }
    });
    const dateInput = element("input", {
      className: "date-field",
      id: "specificDate",
      name: "specificDate",
      type: "date",
      value: answers.data,
      attrs: { min: todayLocal(), required: true, "aria-describedby": "dateHint" }
    });
    const dateHint = element("p", {
      className: "field-hint",
      id: "dateHint",
      text: "Datas anteriores a hoje ficam bloqueadas."
    });
    dateGroup.append(dateLabel, dateInput, dateHint);

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

    const continueButton = createButton(state.editing === "planejamento" ? "Salvar alterações" : "Continuar");
    continueButton.disabled = !answers.data;

    dateInput.addEventListener("change", () => {
      if (!isValidFutureDate(dateInput.value)) {
        answers.data = "";
        dateInput.setCustomValidity("Escolha uma data de hoje em diante.");
        dateInput.reportValidity();
        continueButton.disabled = true;
        return;
      }
      dateInput.setCustomValidity("");
      answers.data = dateInput.value;
      continueButton.disabled = false;
    });

    continueButton.addEventListener("click", () => {
      if (!isValidFutureDate(dateInput.value)) {
        dateInput.setCustomValidity("Escolha uma data de hoje em diante.");
        dateInput.reportValidity();
        return;
      }
      answers.data = dateInput.value;
      answers.observacoes = notes.value.trim();
      state.editing = null;
      goTo("resumo");
    });

    stage.append(dateGroup, notesGroup, element("div", { className: "button-row" }, continueButton));
    return stage;
  }

  function renderResumo() {
    const stage = createStage();
    addEyebrow(stage, "Resumo");
    addHeading(stage, content.resumo.titulo);
    stage.append(element("p", { className: "lead lead--left", text: personalize(content.resumo.subtitulo) }));

    const summary = element("div", { className: "summary-card" });
    const rows = [["Resposta ao convite", answers.convite, "convite", "convite"]];

    if (answers.conviteId === "sim") {
      rows.push(["Período preferido", answers.periodo, "periodo", "periodo"]);
      rows.push(["Rolê preferido", answers.passeio, "passeio", "passeio"]);
      rows.push(["Data escolhida", formatDate(answers.data), "planejamento", "planejamento"]);
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
    const finalCopy = content.finais[answers.conviteId] || content.finais.nao;
    const stage = createStage("final");
    const icon = answers.conviteId === "sim" ? "💌" : "😊";
    stage.append(element("div", { className: "final-mark", text: icon, attrs: { "aria-hidden": true } }));
    addHeading(stage, finalCopy.titulo, 1);
    stage.append(element("p", { className: "lead", text: finalCopy.text }));
    if (answers.conviteId === "sim") later(launchConfetti, 150);
    return stage;
  }

  function validateAnswers() {
    if (!answers.convite) return "A resposta ao convite ficou faltando.";
    if (answers.conviteId === "sim" && (!answers.periodo || !answers.passeio)) {
      return "Escolha o período e o rolê antes de enviar.";
    }
    if (answers.conviteId === "sim" && !isValidFutureDate(answers.data)) {
      return "Escolha uma data de hoje em diante antes de enviar.";
    }
    return "";
  }

  function formspreeIsConfigured() {
    const endpoint = String(config.formspreeEndpoint || "").trim();
    return /^https:\/\/formspree\.io\/f\/[a-z0-9]+$/i.test(endpoint) && !/(SEU_ID|XXXX|EXEMPLO)/i.test(endpoint);
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
      showSendError(status, "O envio ainda não está configurado no arquivo config.js.");
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
      document.createTextNode("Enviando...")
    );
    status.classList.remove("is-error");
    status.textContent = useSupabase ? "Salvando as respostas..." : "Enviando as respostas por e-mail...";

    try {
      if (useSupabase && !state.delivered.supabase) {
        await sendToSupabase();
        state.delivered.supabase = true;
      }
      if (useFormspree && !state.delivered.formspree) {
        status.textContent = useSupabase ? "Salvo no banco. Enviando também por e-mail..." : "Enviando por e-mail...";
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
        ? "O que já foi enviado não será duplicado; tente novamente para concluir."
        : "Suas respostas foram mantidas; você pode tentar novamente.";
      showSendError(status, `${baseMessage} ${retryMessage}`);
      button.replaceChildren(document.createTextNode("Tentar enviar novamente 💌"));
      button.disabled = false;
    } finally {
      state.isSending = false;
    }
  }

  function buildAnswerRecord() {
    const accepted = answers.conviteId === "sim";
    return {
      nome_destinataria: "Convite geral",
      nome_remetente: config.nomeRemetente,
      disponibilidade: accepted ? answers.periodo : "Não se aplica",
      preferencia_passeio: accepted ? answers.passeio : "Não se aplica",
      estilo_encontro: "Não se aplica",
      resposta_convite: answers.convite,
      resposta_convite_id: answers.conviteId,
      disponibilidade_dia: accepted ? "Data específica" : "Não se aplica",
      data_escolhida: accepted && answers.data ? answers.data : null,
      observacoes: accepted ? answers.observacoes || "Não se aplica" : "Não se aplica"
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
    const record = buildAnswerRecord();
    const payload = new FormData();
    payload.append("_subject", "💌 Nova resposta ao convite interativo");
    payload.append("Período preferido", record.disponibilidade);
    payload.append("Preferência de passeio", record.preferencia_passeio);
    payload.append("Resposta ao convite", record.resposta_convite);
    payload.append("Data escolhida", record.data_escolhida ? formatDate(record.data_escolhida) : "Não se aplica");
    payload.append("Observações", record.observacoes);
    payload.append("_gotcha", honeypotValue);

    const response = await fetch(config.formspreeEndpoint, {
      method: "POST",
      body: payload,
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error("Não foi possível enviar o e-mail agora.");
  }

  function lockSummaryEditing() {
    app.experience.querySelectorAll(".edit-button").forEach((editButton) => {
      editButton.disabled = true;
      editButton.title = "Conclua o envio pendente antes de alterar as respostas.";
    });
  }

  function showSendError(status, message) {
    status.classList.add("is-error");
    status.textContent = message;
    status.scrollIntoView({ behavior: "auto", block: "nearest" });
  }

  function todayLocal() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
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
    toastTimer = window.setTimeout(() => app.toast.classList.remove("is-visible"), 1500);
  }

  function launchConfetti() {
    if (reduceMotion.matches) return;
    app.confetti.replaceChildren();
    const colors = ["#ef3340", "#ff6b72", "#8f1421", "#f3d3d5", "#ffffff"];
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 16; index += 1) {
      const piece = element("span", { className: "confetti-piece" });
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.setProperty("--confetti-color", colors[index % colors.length]);
      piece.style.setProperty("--fall-duration", `${1.3 + Math.random() * 0.7}s`);
      piece.style.setProperty("--fall-delay", `${Math.random() * 0.18}s`);
      piece.style.setProperty("--drift-x", `${-65 + Math.random() * 130}px`);
      piece.style.setProperty("--rotation", `${360 + Math.random() * 720}deg`);
      fragment.append(piece);
    }
    app.confetti.append(fragment);
    window.setTimeout(() => app.confetti.replaceChildren(), 2200);
  }

  function createSparkles() {
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 8; index += 1) {
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
    if (theme.vermelho) root.style.setProperty("--red", theme.vermelho);
    if (theme.vermelhoEscuro) root.style.setProperty("--red-dark", theme.vermelhoEscuro);
    if (theme.destaque) root.style.setProperty("--red-light", theme.destaque);
    if (theme.fundo) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.fundo);
    document.title = content.tituloPagina;
  }

  app.backButton.addEventListener("click", () => {
    if (state.isTransitioning || state.isSending || state.submitted) return;
    if (state.delivered.supabase || state.delivered.formspree) {
      showToast("Conclua o envio pendente antes de alterar as respostas.");
      return;
    }
    if (state.editing) {
      state.editing = null;
      goTo("resumo", { addHistory: false });
      return;
    }
    goTo(state.history.pop() || "intro", { addHistory: false });
  });

  applyTheme();
  createSparkles();
  renderCurrent();
})();
