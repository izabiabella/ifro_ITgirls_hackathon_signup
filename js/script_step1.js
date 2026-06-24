document.addEventListener("DOMContentLoaded", function () {

  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  // ── Limites aleatórios (telefone agora é fixo) ──
  const LIMITES = {
    primeiroNome:  rand(3, 8),
    segundoNome:   rand(3, 8),
    sobrenome:     rand(4, 10),
    phoneDdi:      2,   // FIXO: 2 chars
    phoneDdd:      2,   // FIXO: 2 chars
    phonePrefix:   1,   // FIXO: 1 char
    phoneNumber:   8,   // FIXO: 8 chars
    endereco:      rand(10, 20),
    cidade:        rand(4, 12),
    estado:        rand(2, 15),
    tipoSanguineo: rand(2, 3),
  };

  // ── Referências ──
  const campos = {
    primeiroNome:  document.getElementById("primeiroNome"),
    segundoNome:   document.getElementById("segundoNome"),
    sobrenome:     document.getElementById("sobrenome"),
    phoneDdi:      document.getElementById("phoneDdi"),
    phoneDdd:      document.getElementById("phoneDdd"),
    phonePrefix:   document.getElementById("phonePrefix"),
    phoneNumber:   document.getElementById("phoneNumber"),
    endereco:      document.getElementById("endereco"),
    cidade:        document.getElementById("cidade"),
    estado:        document.getElementById("estado"),
    tipoSanguineo: document.getElementById("tipoSanguineo"),
  };

  const camposTelefone = ["phoneDdi", "phoneDdd", "phonePrefix", "phoneNumber"];

  const semSegundoNome       = document.getElementById("semSegundoNome");
  const btnContinuar         = document.getElementById("btnContinuar");
  const errorMessageBox      = document.getElementById("errorMessage");

  // overlays
  const overlaySegundoNome   = document.getElementById("overlaySegundoNome");
  const novoSegundoNomeInput = document.getElementById("novoSegundoNome");
  const btnConfirmarNome     = document.getElementById("btnConfirmarSegundoNome");

  const overlayExtras        = document.getElementById("overlayExtras");
  const corCabeloInput       = document.getElementById("corCabelo");
  const extrasErro           = document.getElementById("extrasErro");
  const btnConfirmarExtras   = document.getElementById("btnConfirmarExtras");

  const overlayEstrelas      = document.getElementById("overlayEstrelas");
  const estrelasTexto        = document.getElementById("estrelasTexto");
  const estrelasEmoji        = document.getElementById("estrelasEmoji");
  const btnDar4Estrelas      = document.getElementById("btnDar4Estrelas");
  const btnRecusar           = document.getElementById("btnRecusar");

  const stars                = document.querySelectorAll(".star");

  // ── Validação de campo ──
  function validarCampo(id) {
    const el  = campos[id];
    const min = LIMITES[id];
    let val   = el.value;

    if (camposTelefone.includes(id)) {
      val = val.replace(/\D/g, "");
      el.value = val;
    } else {
      val = val.trim();
    }

    // Para telefone: exige EXATAMENTE o tamanho fixo
    const ok = camposTelefone.includes(id)
      ? val.length === min
      : val.length >= min;

    el.classList.toggle("field-ok",  ok);
    el.classList.toggle("field-err", !ok);
    return ok;
  }

  // Listeners em tempo real
  Object.keys(campos).forEach(id => {
    campos[id].addEventListener("input", () => validarCampo(id));
  });

  // ── Segundo Nome / Checkbox ──
  semSegundoNome.addEventListener("change", function () {
    if (this.checked) {
      campos.segundoNome.value    = "";
      campos.segundoNome.disabled = true;
      campos.segundoNome.classList.remove("field-ok", "field-err");
      overlaySegundoNome.classList.remove("hidden");
      novoSegundoNomeInput.focus();
    } else {
      campos.segundoNome.disabled = false;
    }
  });

  btnConfirmarNome.addEventListener("click", function () {
    const nome = novoSegundoNomeInput.value.trim();
    if (nome.length < LIMITES.segundoNome) {
      novoSegundoNomeInput.classList.add("field-err");
      return;
    }
    campos.segundoNome.value    = nome;
    campos.segundoNome.disabled = true;
    campos.segundoNome.classList.add("field-ok");
    overlaySegundoNome.classList.add("hidden");
    novoSegundoNomeInput.value = "";
    novoSegundoNomeInput.classList.remove("field-err");
  });

  // ── Estrelas (invertidas) ──
  let avaliacaoAtual = 1;
  stars.forEach(star => {
    star.addEventListener("click", function () {
      const val = parseInt(this.getAttribute("data-value"));
      avaliacaoAtual = val;
      stars.forEach(s => {
        s.classList.toggle("active", parseInt(s.getAttribute("data-value")) <= val);
      });
    });
  });

  // ── Pop-up de estrelas ──
  const mensagensEstrelas = [
    { emoji: "😢", texto: "1 estrela?" },
  ];
  let tentativaEstrelas = 0;

  function mostrarPopupEstrelas() {
    const msg = mensagensEstrelas[tentativaEstrelas % mensagensEstrelas.length];
    estrelasEmoji.textContent = msg.emoji;
    estrelasTexto.textContent = msg.texto;
    overlayEstrelas.classList.remove("hidden");
    tentativaEstrelas++;
  }

  btnDar4Estrelas.addEventListener("click", function () {
    avaliacaoAtual = 4;
    stars.forEach(s => s.classList.add("active"));
    overlayEstrelas.classList.add("hidden");
  });

  btnRecusar.addEventListener("click", function () {
    overlayEstrelas.classList.add("hidden");
  });

  // ── Pop-up de extras (cor do cabelo + tecnologias) ──
  btnConfirmarExtras.addEventListener("click", function () {
    const cor = corCabeloInput.value.trim();
    const tecsSelecionadas = Array.from(
      overlayExtras.querySelectorAll(".tech-option input:checked")
    ).map(cb => cb.value);

    if (!cor || tecsSelecionadas.length === 0) {
      extrasErro.classList.remove("hidden");
      return;
    }
    extrasErro.classList.add("hidden");

    localStorage.setItem("corCabelo",     cor);
    localStorage.setItem("tecnologias",   tecsSelecionadas.join(", "));

    overlayExtras.classList.add("hidden");
    avancar();
  });

  // ── Avançar para step2 ──
  function avancar() {
    localStorage.setItem("primeiroNome",  campos.primeiroNome.value.trim());
    localStorage.setItem("estadoFase1",   campos.estado.value.trim());
    localStorage.setItem("avaliacao",     avaliacaoAtual);
    localStorage.setItem("stepConcluido", "1");

    errorMessageBox.style.color = "#ff3333";
    errorMessageBox.textContent = "⚠️ avançando...";
    setTimeout(() => { window.location.href = "step2.html"; }, 1200);
  }

  // ── Botão Continuar ──
  btnContinuar.addEventListener("click", function () {
    errorMessageBox.textContent = "";

    const todosCamposOk =
      validarCampo("primeiroNome") &
      (campos.segundoNome.disabled || validarCampo("segundoNome")) &
      validarCampo("sobrenome") &
      validarCampo("phoneDdi") &
      validarCampo("phoneDdd") &
      validarCampo("phonePrefix") &
      validarCampo("phoneNumber") &
      validarCampo("endereco") &
      validarCampo("cidade") &
      validarCampo("estado") &
      validarCampo("tipoSanguineo");

    if (!todosCamposOk) {
      errorMessageBox.style.color = "#37FA4F";
      errorMessageBox.textContent = "✅ Erro, parece que falta caracteres...";
      return;
    }

    if (avaliacaoAtual < 4) {
      mostrarPopupEstrelas();
      return;
    }

    // Tudo ok: abre popup de extras
    overlayExtras.classList.remove("hidden");
    corCabeloInput.focus();
  });
});
