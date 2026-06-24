document.addEventListener("DOMContentLoaded", function () {

  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  const LIMITES = {
    email:          rand(10, 15),
    estadoCivil:    rand(3, 8),
    nacionalidade:  rand(5, 12),
    profissao:      rand(5, 15),
    dataNascimento: 10,          // MM/DD/AAAA = fixo 10
    cpf:            11,
    sexo:           7,           // "Feminino" = 7 (mínimo)
    escolaridade:   3,  
  };

  // ── Pop-up Koda ──
  const popupFugitivo  = document.getElementById("popupFugitivo");
  const closeFugitivo  = document.getElementById("closeFugitivo");
  const popupContainer = document.getElementById("popupContainer");

  if (popupFugitivo) {
    const placeholder = popupFugitivo.querySelector(".popup-image-placeholder");
    if (placeholder) {
      placeholder.innerHTML = `<img src="imagens/ifrokoda.png" alt="Koda"
        style="width:100%;height:100%;object-fit:contain;background:#222;" />`;
    }
    popupFugitivo.style.left      = "50%";
    popupFugitivo.style.top       = "50%";
    popupFugitivo.style.transform = "translate(-50%, -50%)";
  }

  // ── Cursor com atraso ──
  const fakeCursor = document.getElementById("fakeCursor");
  let realMouseX = 0, realMouseY = 0, fakeCursorX = 0, fakeCursorY = 0;
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  if (!isMobile) {
    document.body.classList.add("custom-cursor-active");
    fakeCursor.style.display = "block";
    document.addEventListener("mousemove", e => { realMouseX = e.clientX; realMouseY = e.clientY; });
    (function updateCursor() {
      fakeCursorX += (realMouseX - fakeCursorX) * 0.015;
      fakeCursorY += (realMouseY - fakeCursorY) * 0.015;
      fakeCursor.style.left = `${fakeCursorX}px`;
      fakeCursor.style.top  = `${fakeCursorY}px`;
      requestAnimationFrame(updateCursor);
    })();
  }

  let podeFugir = true;
  setTimeout(() => { podeFugir = false; }, 5000);

  document.addEventListener("mousemove", e => {
    if (!podeFugir || !popupFugitivo || !document.contains(popupFugitivo)) return;
    const rect = popupFugitivo.getBoundingClientRect();
    const dist = Math.hypot(e.clientX - (rect.left + rect.width/2), e.clientY - (rect.top + rect.height/2));
    if (dist < 150) {
      popupFugitivo.style.transform = "none";
      popupFugitivo.style.left = `${Math.max(10, Math.random() * (window.innerWidth  - rect.width))}px`;
      popupFugitivo.style.top  = `${Math.max(10, Math.random() * (window.innerHeight - rect.height))}px`;
    }
  });

  if (closeFugitivo) {
    closeFugitivo.addEventListener("click", () => {
      popupFugitivo.remove();
      for (let i = 0; i < 3; i++) {
        const np = document.createElement("div");
        np.className = "popup-box box-static";
        np.style.left = `${Math.random() * (window.innerWidth  - 320)}px`;
        np.style.top  = `${Math.random() * (window.innerHeight - 220)}px`;
        np.innerHTML  = `
          <button class="popup-close" onclick="this.parentElement.remove()">X</button>
          <div class="popup-image-placeholder">
            <img src="imagens/ifrokoda.png" alt="Koda"
              style="width:100%;height:100%;object-fit:contain;background:#222;" />
          </div>`;
        popupContainer.appendChild(np);
      }
    });
  }

  // ── Campos especiais ──
  const elData      = document.getElementById("dataNascimento");
  const elSexo      = document.getElementById("sexo");
  const elAltura    = document.getElementById("escolaridade");
  const elEmail     = document.getElementById("email");
  const elCpf       = document.getElementById("cpf");

  // CPF: só números, máximo 11 dígitos
  elCpf.addEventListener("input", () => {
    elCpf.value = elCpf.value.replace(/\D/g, "").slice(0, 11);
  });

  // Altura: só números
  elAltura.addEventListener("input", () => {
    elAltura.value = elAltura.value.replace(/\D/g, "");
  });

  // Data: só números + "/" automático  (MM/DD/AAAA)
  elData.addEventListener("input", function () {
    let val = this.value.replace(/\D/g, "");
    if (val.length > 2)  val = val.slice(0,2) + "/" + val.slice(2);
    if (val.length > 5)  val = val.slice(0,5) + "/" + val.slice(5);
    if (val.length > 10) val = val.slice(0,10);
    this.value = val;
  });

  // ── Validação individual ──
  function validarEmail(val) {
    return val.includes("@") && val.length >= LIMITES.email;
  }

  function validarData(val) {
    // MM/DD/AAAA: regex simples
    return /^\d{2}\/\d{2}\/\d{4}$/.test(val);
  }

  function validarSexo(val) {
    return val === "Masculino" || val === "Feminino";
  }

  function validarGenerico(val, min) {
    return val.trim().length >= min;
  }

  function checarCampo(el, okFn) {
    const ok = okFn(el.value.trim());
    el.classList.toggle("field-ok",  ok);
    el.classList.toggle("field-err", !ok);
    return ok;
  }

  const camposStep2 = [
    { id: "email",          fn: v => validarEmail(v)                        },
    { id: "estadoCivil",    fn: v => validarGenerico(v, LIMITES.estadoCivil)   },
    { id: "nacionalidade",  fn: v => validarGenerico(v, LIMITES.nacionalidade) },
    { id: "profissao",      fn: v => validarGenerico(v, LIMITES.profissao)     },
    { id: "dataNascimento", fn: v => validarData(v)                            },
    { id: "cpf",            fn: v => /^\d{11}$/.test(v)                        },
    { id: "sexo",           fn: v => validarSexo(v)                            },
    { id: "escolaridade",   fn: v => v.replace(/\D/g,"").length >= LIMITES.escolaridade },
  ];

  // Listeners em tempo real
  camposStep2.forEach(({ id, fn }) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => checarCampo(el, fn));
  });

  // ── Botão Continuar ──
  const btnContinuar    = document.getElementById("btnContinuar");
  const errorMessageBox = document.getElementById("errorMessage");
  const overlaySexo     = document.getElementById("overlaySexo");

  if (btnContinuar) {
    btnContinuar.addEventListener("click", function () {
      errorMessageBox.textContent = "";

      // Valida todos os campos
      const resultados = camposStep2.map(({ id, fn }) => {
        const el = document.getElementById(id);
        return el ? checarCampo(el, fn) : false;
      });

      const tudo = resultados.every(Boolean);

      if (!tudo) {
        // Verifica quais campos específicos falharam para mostrar popup correto
        const sexoOk = validarSexo(elSexo.value.trim());

        if (!sexoOk && elSexo.value.trim().length > 0) {
          overlaySexo.classList.remove("hidden");
          return;
        }

        errorMessageBox.style.color   = "#37FA4F";
        errorMessageBox.textContent   = "✅ Erro, já verificou os caracteres?";
        return;
      }

      localStorage.setItem("emailFase2",    elEmail.value.trim());
      localStorage.setItem("stepConcluido", "2");

      errorMessageBox.style.color   = "#fa3737";
      errorMessageBox.textContent   = "⚠️ concluído com sucesso! Redirecionando...";
      setTimeout(() => { window.location.href = "jogo/pos-login.html"; }, 1500);
    });
  }
});
