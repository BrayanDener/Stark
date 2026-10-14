/* STARK AI — interações do site. Sem dependências. */
(function () {
  "use strict";

  var CONFIG = window.STARK_CONFIG || {};
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------------------------------------------------------
     1. Configuração central
     --------------------------------------------------------- */
  function applyConfig() {
    $$("[data-config]").forEach(function (el) {
      var value = CONFIG[el.getAttribute("data-config")];
      if (value) el.textContent = value;
    });
    $$("[data-config-show]").forEach(function (el) {
      el.hidden = !CONFIG[el.getAttribute("data-config-show")];
    });
    $$("[data-config-missing]").forEach(function (el) {
      el.hidden = !!CONFIG[el.getAttribute("data-config-missing")];
    });

    var names = { instagram: "Instagram", linkedin: "LinkedIn", youtube: "YouTube" };
    var list = $("[data-social-list]");
    var social = CONFIG.social || {};
    if (list) {
      Object.keys(social).forEach(function (key) {
        if (!social[key]) return;
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = social[key];
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = names[key] || key;
        li.appendChild(a);
        list.appendChild(li);
      });
      list.hidden = list.children.length === 0;
    }

    $$("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

    if (!CONFIG.whatsapp && window.console) {
      console.warn("[STARK AI] WhatsApp não configurado. Defina STARK_CONFIG.whatsapp em assets/js/config.js.");
    }
  }

  /* ---------------------------------------------------------
     2. Menu mobile
     --------------------------------------------------------- */
  function initMenu() {
    var toggle = $(".menu-toggle");
    var nav = $("#menu-principal");
    if (!toggle || !nav) return;
    var label = $(".sr-only", toggle);
    var desktop = window.matchMedia("(min-width: 1024px)");

    function setOpen(open, returnFocus) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      if (label) label.textContent = open ? "Fechar menu" : "Abrir menu";
      if (open) {
        var first = $("a", nav);
        if (first) first.focus();
      } else if (returnFocus) {
        toggle.focus();
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    $$("a", nav).forEach(function (a) {
      a.addEventListener("click", function () {
        if (!desktop.matches) setOpen(false);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") setOpen(false, true);
    });
    document.addEventListener("click", function (e) {
      if (toggle.getAttribute("aria-expanded") !== "true") return;
      if (!e.target.closest(".site-header")) setOpen(false);
    });
    var onChange = function () { if (desktop.matches) setOpen(false); };
    if (desktop.addEventListener) desktop.addEventListener("change", onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* ---------------------------------------------------------
     3. Demonstração da primeira tela
     --------------------------------------------------------- */
  var FLOW_SCENARIOS = [
    {
      title: "Pedido de orçamento pelo WhatsApp",
      from: "Cliente, 14:32",
      message: "Oi! Vocês fazem orçamento de armário planejado? Queria para a semana que vem.",
      fields: [["Assunto", "Orçamento"], ["Produto", "Armário planejado"], ["Prazo desejado", "Próxima semana"]],
      who: "Encaminhado para o comercial",
      what: "Cliente recebeu a lista de medidas para enviar"
    },
    {
      title: "Agendamento pelo site",
      from: "Formulário do site, 09:10",
      message: "Quero marcar uma avaliação na quinta à tarde, se tiver horário.",
      fields: [["Assunto", "Agendamento"], ["Preferência", "Quinta, tarde"], ["Primeira vez", "Sim"]],
      who: "Horário reservado na agenda",
      what: "Confirmação e lembrete programados para o cliente"
    },
    {
      title: "Dúvida sobre um serviço em andamento",
      from: "Cliente, 17:48",
      message: "Boa tarde, meu equipamento já ficou pronto? É a ordem 1042.",
      fields: [["Assunto", "Andamento de serviço"], ["Ordem", "1042"], ["Situação atual", "Em execução"]],
      who: "Resposta com a situação da ordem",
      what: "Técnico responsável avisado da consulta"
    }
  ];

  function initFlowDemo() {
    var demo = $("#flow-demo");
    if (!demo) return;
    var lanes = $$(".flow-lane", demo);
    var pauseBtn = $("[data-flow-pause]", demo);
    var step = 0;
    var scenario = 0;
    var timer = null;
    var paused = false;
    var visible = true;

    function setActive(i) {
      lanes.forEach(function (lane, idx) { lane.classList.toggle("is-active", idx === i); });
    }

    function renderScenario(s) {
      $("[data-flow='title']", demo).textContent = s.title;
      $("[data-flow='from']", demo).textContent = s.from;
      $("[data-flow='message']", demo).textContent = s.message;
      $("[data-flow='who']", demo).textContent = s.who;
      $("[data-flow='what']", demo).textContent = s.what;
      var dl = $("[data-flow='fields']", demo);
      dl.innerHTML = "";
      s.fields.forEach(function (pair) {
        var row = document.createElement("div");
        var dt = document.createElement("dt");
        var dd = document.createElement("dd");
        dt.textContent = pair[0];
        dd.textContent = pair[1];
        row.appendChild(dt);
        row.appendChild(dd);
        dl.appendChild(row);
      });
    }

    function tick() {
      step += 1;
      if (step > 2) {
        step = 0;
        scenario = (scenario + 1) % FLOW_SCENARIOS.length;
        demo.classList.add("is-swapping");
        setTimeout(function () {
          renderScenario(FLOW_SCENARIOS[scenario]);
          demo.classList.remove("is-swapping");
        }, 260);
      }
      setActive(step);
    }

    function start() {
      if (timer || paused || !visible || document.hidden) return;
      timer = setInterval(tick, 2200);
    }
    function stop() {
      clearInterval(timer);
      timer = null;
    }

    if (pauseBtn) {
      pauseBtn.addEventListener("click", function () {
        paused = !paused;
        pauseBtn.setAttribute("aria-pressed", String(paused));
        pauseBtn.textContent = paused ? "Continuar" : "Pausar";
        if (paused) stop(); else start();
      });
    }

    // Sem movimento automático para quem prefere menos animação
    if (reduceMotion) {
      paused = true;
      if (pauseBtn) pauseBtn.hidden = true;
      lanes.forEach(function (lane) { lane.classList.add("is-active"); });
      return;
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start(); else stop();
      }).observe(demo);
    }
    start();
  }

  /* ---------------------------------------------------------
     4. Explorador de soluções (funciona localmente)
     --------------------------------------------------------- */
  var EXPLORER = {
    atender: {
      label: "Atender melhor",
      need: "Atendimento",
      situation: "As mensagens chegam o dia todo, muitas com as mesmas perguntas. Enquanto alguém responde uma, outras ficam esperando, e parte dos clientes desiste.",
      solution: "Um assistente responde as dúvidas frequentes, coleta os dados principais e encaminha a conversa para sua equipe quando o caso precisa de uma pessoa.",
      parts: ["Respostas baseadas nas informações da sua empresa", "Encaminhamento para a equipe com o histórico da conversa", "Registro de cada contato para retorno"],
      visual: function () {
        return '<div class="mini mini-chat">' +
          '<p class="mini-cap">Exemplo ilustrativo</p>' +
          '<div class="mini-msg mini-msg--in">Vocês abrem no sábado?</div>' +
          '<div class="mini-msg mini-msg--out">Sim, das 8h às 13h. Quer que eu reserve um horário?</div>' +
          '<div class="mini-msg mini-msg--in">Preciso falar sobre um orçamento grande.</div>' +
          '<div class="mini-handoff">Conversa encaminhada para a equipe comercial</div>' +
          '</div>';
      }
    },
    agenda: {
      label: "Organizar agendamentos",
      need: "Agendamentos",
      situation: "Os horários são combinados por mensagem, anotados em cadernos ou na memória. Às vezes dois clientes ficam no mesmo horário, e outros esquecem que tinham marcado.",
      solution: "Uma agenda online em que o cliente escolhe o horário disponível, recebe a confirmação e um lembrete. Sua equipe vê o dia completo em uma só tela.",
      parts: ["Horários livres atualizados automaticamente", "Confirmação e lembrete para o cliente", "Agenda por profissional ou por sala"],
      visual: function () {
        return '<div class="mini mini-cal">' +
          '<p class="mini-cap">Exemplo ilustrativo</p>' +
          '<p class="mini-cal-day">Quinta-feira <span>Agenda do dia</span></p>' +
          '<div class="mini-cal-row"><time>09:00</time><div class="mini-cal-slot">Avaliação, Marina</div></div>' +
          '<div class="mini-cal-row"><time>10:30</time><div class="mini-cal-slot is-free">Horário livre</div></div>' +
          '<div class="mini-cal-row"><time>14:00</time><div class="mini-cal-slot is-new">Novo: retorno, Paulo</div></div>' +
          '<div class="mini-cal-row"><time>15:30</time><div class="mini-cal-slot">Sessão, Joana</div></div>' +
          '<div class="mini-handoff">Lembrete programado para um dia antes</div>' +
          '</div>';
      }
    },
    tarefas: {
      label: "Automatizar tarefas",
      need: "Tarefas repetitivas",
      situation: "Toda venda precisa ser copiada para a planilha, depois para o sistema financeiro e ainda avisada no grupo da equipe. Uma etapa esquecida gera retrabalho.",
      solution: "Uma automação que leva a informação de uma ferramenta para outra assim que ela aparece, e avisa a pessoa certa quando algo precisa de atenção.",
      parts: ["Conexão entre as ferramentas que você já usa", "Avisos automáticos para o responsável", "Alerta quando um dado não confere"],
      visual: function () {
        return '<div class="mini mini-flow">' +
          '<p class="mini-cap">Exemplo ilustrativo</p>' +
          '<div class="mini-flow-step"><strong>Nova venda registrada</strong><small>Sistema de vendas</small></div>' +
          '<div class="mini-flow-link" aria-hidden="true"></div>' +
          '<div class="mini-flow-step"><strong>Linha adicionada à planilha</strong><small>Planilha financeira</small></div>' +
          '<div class="mini-flow-link" aria-hidden="true"></div>' +
          '<div class="mini-flow-step is-alert"><strong>Aviso para o estoque</strong><small>Produto abaixo do mínimo</small></div>' +
          '</div>';
      }
    },
    site: {
      label: "Criar meu site",
      need: "Site",
      situation: "O cliente procura sua empresa na internet e encontra um site antigo, difícil de usar no celular, ou nenhum site. A primeira impressão não mostra a qualidade do seu trabalho.",
      solution: "Um site claro, rápido e feito para o celular, que explica seus serviços com objetividade e leva o visitante a pedir contato.",
      parts: ["Textos que explicam o que você faz", "Contato direto pelo WhatsApp", "Estrutura pronta para aparecer nas buscas"],
      visual: function () {
        return '<div class="mini">' +
          '<p class="mini-cap">Exemplo ilustrativo</p>' +
          '<div class="mini-browser">' +
          '<div class="mini-browser-bar"><i></i><i></i><i></i><span>suaempresa.com.br</span></div>' +
          '<div class="mini-browser-body">' +
          '<strong>Reformas sem surpresa no orçamento</strong>' +
          '<p>Visita técnica, orçamento detalhado e acompanhamento de cada etapa da obra.</p>' +
          '<span class="mini-browser-btn">Pedir uma visita</span>' +
          '<div class="mini-browser-cols"><span>Banheiros</span><span>Cozinhas</span><span>Pintura</span></div>' +
          '</div></div></div>';
      }
    },
    app: {
      label: "Tirar um aplicativo do papel",
      need: "Aplicativo",
      situation: "A ideia existe há meses: um aplicativo para clientes, para a equipe de campo ou para um novo serviço. Falta saber por onde começar e quanto do projeto é necessário agora.",
      solution: "Definimos uma primeira versão enxuta, com o essencial para testar a ideia com quem vai usar, e evoluímos a partir do que for aprendido.",
      parts: ["Escopo da primeira versão definido com você", "Telas testadas antes do desenvolvimento completo", "Aplicativo web ou instalado, conforme a necessidade"],
      visual: function () {
        return '<div class="mini">' +
          '<p class="mini-cap">Exemplo ilustrativo</p>' +
          '<div class="mini-phone">' +
          '<p class="mini-phone-title">Visitas de hoje</p>' +
          '<div class="mini-phone-item"><span>Rua das Acácias, 120</span><span>08:30</span></div>' +
          '<div class="mini-phone-item"><span>Av. Brasil, 455</span><span>10:00</span></div>' +
          '<div class="mini-phone-item"><span>Rua Ipê, 31</span><span>13:30</span></div>' +
          '<p class="mini-phone-note">Toque em uma visita para registrar fotos e assinatura.</p>' +
          '</div></div>';
      }
    }
  };

  function initExplorer() {
    var tabs = $$(".explorer-tab");
    var panel = $("#explorer-panel");
    if (!tabs.length || !panel) return;

    var situation = $("[data-explorer='situation']", panel);
    var solution = $("[data-explorer='solution']", panel);
    var parts = $("[data-explorer='parts']", panel);
    var visual = $("[data-explorer='visual']", panel);
    var cta = $("[data-explorer='cta']", panel);

    function render(key) {
      var item = EXPLORER[key];
      if (!item) return;
      situation.textContent = item.situation;
      solution.textContent = item.solution;
      parts.innerHTML = "";
      item.parts.forEach(function (p) {
        var li = document.createElement("li");
        li.textContent = p;
        parts.appendChild(li);
      });
      visual.innerHTML = item.visual();
      cta.textContent = "Conversar sobre " + item.label.charAt(0).toLowerCase() + item.label.slice(1);
      cta.setAttribute("data-need", item.label);
    }

    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panel.setAttribute("aria-labelledby", tab.id);
      if (focus) tab.focus();
      var key = tab.getAttribute("data-option");
      if (reduceMotion) { render(key); return; }
      panel.classList.add("is-swapping");
      setTimeout(function () {
        render(key);
        panel.classList.remove("is-swapping");
      }, 170);
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab); });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = tabs[(i + 1) % tabs.length];
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") next = tabs[0];
        else if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  }

  /* ---------------------------------------------------------
     5. Demonstração de agendamento (barbearia)
     --------------------------------------------------------- */
  function initBooking() {
    var root = $("[data-example='barbearia']");
    if (!root) return;
    var summary = $("[data-bk-summary]", root);

    function current(group) {
      var el = $("[data-bk='" + group + "'][aria-pressed='true']", root);
      return el ? el.getAttribute("data-value") : "";
    }
    function update() {
      var service = current("service");
      var slot = current("slot");
      summary.textContent = slot ? service + ", quinta às " + slot : service + ", escolha um horário";
    }

    $$("[data-bk]", root).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var group = btn.getAttribute("data-bk");
        $$("[data-bk='" + group + "']", root).forEach(function (b) {
          b.setAttribute("aria-pressed", String(b === btn));
        });
        update();
      });
    });
  }

  /* ---------------------------------------------------------
     6. Contato: mensagem contextual para o WhatsApp
     --------------------------------------------------------- */
  var NEED_MAP = {
    "Atender melhor": "Atendimento",
    "Organizar agendamentos": "Agendamentos",
    "Automatizar tarefas": "Tarefas repetitivas",
    "Criar meu site": "Site",
    "Tirar um aplicativo do papel": "Aplicativo"
  };

  function initContact() {
    var form = $("#contact-form");
    if (!form) return;
    var nameInput = $("#cf-name", form);
    var details = $("#cf-details", form);
    var preview = $("#cf-preview", form);
    var status = $("#cf-status", form);
    var copyBtn = $("#cf-copy", form);
    var nameField = nameInput.closest(".field");
    var needField = $("#cf-need-group", form).closest(".field");
    var nameError = $("#cf-name-error", form);
    var needError = $("#cf-need-error", form);
    var origin = "";
    var attempted = false;

    function selectedNeed() {
      var r = $("input[name='need']:checked", form);
      return r ? r.value : "";
    }

    function buildMessage(forPreview) {
      var name = nameInput.value.trim();
      var need = selectedNeed();
      var extra = details.value.trim();
      var lines = [];
      lines.push((CONFIG.greeting || "Olá!") + " Meu nome é " + (name || (forPreview ? "[seu nome]" : "")) + ".");
      if (need && need !== "Ainda não sei") lines.push("Quero simplificar: " + need + ".");
      if (need === "Ainda não sei") lines.push("Ainda não sei qual solução é a mais adequada e gostaria de conversar.");
      if (extra) lines.push(extra);
      if (origin) lines.push("(Vim pelo site, a partir de: " + origin + ")");
      return lines.join("\n");
    }

    function updatePreview() { preview.textContent = buildMessage(true); }

    function setError(field, errorEl, input, hasError) {
      field.classList.toggle("has-error", hasError);
      errorEl.hidden = !hasError;
      if (input) input.setAttribute("aria-invalid", String(hasError));
    }

    function validate() {
      var nameOk = nameInput.value.trim().length >= 2;
      var needOk = !!selectedNeed() || details.value.trim().length >= 5;
      setError(nameField, nameError, nameInput, !nameOk);
      setError(needField, needError, null, !needOk);
      details.setAttribute("aria-invalid", String(!needOk));
      if (!needOk) details.setAttribute("aria-describedby", "cf-details-help cf-need-error");
      else details.setAttribute("aria-describedby", "cf-details-help");
      return { ok: nameOk && needOk, first: !nameOk ? nameInput : (!needOk ? $("input[name='need']", form) : null) };
    }

    function setStatus(text, isError) {
      status.textContent = text;
      status.classList.toggle("is-error", !!isError);
    }

    form.addEventListener("input", function () {
      updatePreview();
      if (attempted) validate();
      setStatus("");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      attempted = true;
      var result = validate();
      if (!result.ok) {
        setStatus("Revise os campos destacados.", true);
        if (result.first) result.first.focus();
        return;
      }
      if (!CONFIG.whatsapp) {
        setStatus("O contato por WhatsApp ainda não foi configurado. Use Copiar mensagem para guardar o texto.", true);
        return;
      }
      var number = String(CONFIG.whatsapp).replace(/\D/g, "");
      var url = "https://wa.me/" + number + "?text=" + encodeURIComponent(buildMessage(false));
      var link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setStatus("Abrimos o WhatsApp com a mensagem pronta. Revise e envie por lá. Se ele não abriu, use Copiar mensagem.");
    });

    copyBtn.addEventListener("click", function () {
      var text = buildMessage(true);
      function fallback() {
        var range = document.createRange();
        range.selectNodeContents(preview);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        setStatus("Não foi possível copiar automaticamente. A mensagem está selecionada para você copiar.");
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          setStatus("Mensagem copiada.");
        }, fallback);
      } else {
        fallback();
      }
    });

    // Botões com contexto em qualquer parte do site
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-need]");
      if (!trigger) return;
      var label = trigger.getAttribute("data-need");
      var need = NEED_MAP[label];
      origin = need ? label : "";
      if (need) {
        var radio = $("input[name='need'][value='" + need + "']", form);
        if (radio) radio.checked = true;
      }
      updatePreview();
      if (attempted) validate();
      if (need) setStatus("Assunto escolhido: " + need + ". Complete com seu nome.");
    });

    updatePreview();
  }

  /* --------------------------------------------------------- */
  applyConfig();
  initMenu();
  initFlowDemo();
  initExplorer();
  initBooking();
  initContact();
})();
