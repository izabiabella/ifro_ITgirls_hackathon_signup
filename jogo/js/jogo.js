// ===========================================================
// BOSS FIGHT: derrote o Smurf Ladrão e recupere o botão
// ===========================================================
// Controles:
//   seta esquerda/direita : trocar de raia / coletar bitcoin
//   seta pra cima / espaço : saltar a barreira
// Colete 5 bitcoins → poder matrix sobe até o smurf →
// explosão → botão Encerrar fica clicável.
// ===========================================================

const RAIAS                    = ["lane-esquerda", "lane-centro", "lane-direita"];
const HP_JOGADOR_MAX           = 3;
const HP_BOSS_MAX              = 100;
const BITCOINS_NECESSARIOS     = 5;
const DURACAO_INVULNERABILIDADE_MS = 900;

// ── DOM ──────────────────────────────────────────────────────
const jogador           = document.getElementById("jogador");
const smurf             = document.getElementById("smurf");
const bossInfo          = document.getElementById("boss-info");
const botaoNaMao        = document.getElementById("botao-na-mao");
const containerObs      = document.getElementById("obstaculos");
const containerBitcoins = document.getElementById("bitcoins");
const barraVidaBossEl   = document.getElementById("barra-vida-boss-interna");
const vidaJogadorEl     = document.getElementById("vida-jogador");
const placarEl          = document.getElementById("placar");
const mensagemEl        = document.getElementById("mensagem");
const poderGif          = document.getElementById("poder-gif");
const explosaoGif       = document.getElementById("explosao-gif");
const musicaEl          = document.getElementById("musica-fundo");

// ── ESTADO ───────────────────────────────────────────────────
let raiaJogador    = 1;
let raiaSmurf      = 1;
let hpJogador      = HP_JOGADOR_MAX;
let hpBoss         = HP_BOSS_MAX;
let moedasColetadas = 0;
let pulando        = false;
let invulneravel   = false;
let capturando     = false;
let ativo          = true;
let musicaIniciada = false;

let timeoutObstaculo = null;
let timeoutBitcoin   = null;
let timeoutSmurf     = null;
let raiaSmurfCongelada = 1; // raia em que o smurf ficará parado ao ser atingido

// ── AVISO JUCOSO — contador de cliques nas setas ─────────────
let cliquesSetas         = 0;
let avisoSetasEmExibicao = false;

const mensagensAvisoSetas = [
  "👀 Psiu... olha as instruções lá em cima antes de continuar!",
  "🕹️ Tente jogar de outra forma — as setas sozinhas não vão te salvar!",
  "😅 Tá perdido? As instruções estão ali no cantinho esperando você...",
  "🤔 Interessante estratégia... mas não tá funcionando, hein?",
  "💡 Dica quente: deslize pra cima ou toque rápido pra pular a barreira!",
  "🧐 Hmm, parece que alguém precisa de um mapa... olha as instruções!",
  "🔥 Vai ficar apertando botão à toa ou vai aprender a jogar?",
  "🪙 As setas movem o personagem, mas os bitcoins é que dão poder!",
];

function mostrarAvisoSetas() {
  if (avisoSetasEmExibicao) return;
  avisoSetasEmExibicao = true;
  cliquesSetas = 0; // reseta pra próxima rodada

  // injeta as keyframes se ainda não existirem
  if (!document.getElementById("aviso-setas-style")) {
    const style = document.createElement("style");
    style.id = "aviso-setas-style";
    style.textContent = `
      @keyframes aviso-entrar {
        from { opacity: 0; transform: translateX(-50%) translateY(24px) scale(0.9); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0)     scale(1);   }
      }
      @keyframes aviso-sair {
        from { opacity: 1; transform: translateX(-50%) translateY(0)     scale(1);   }
        to   { opacity: 0; transform: translateX(-50%) translateY(24px) scale(0.9); }
      }
      @keyframes aviso-pulsar {
        0%, 100% { box-shadow: 0 0 18px rgba(255,100,0,0.7); }
        50%       { box-shadow: 0 0 36px rgba(255,50,0,1);    }
      }
    `;
    document.head.appendChild(style);
  }

  const idx   = Math.floor(Math.random() * mensagensAvisoSetas.length);
  const aviso = document.createElement("div");
  aviso.id    = "aviso-setas";
  aviso.innerHTML = `<span style="font-size:1.4rem;display:block;margin-bottom:4px">🎮</span>${mensagensAvisoSetas[idx]}`;
// Dentro da sua função mostrarAvisoSetas()
Object.assign(aviso.style, {
  position:    "fixed",
  top:         "60px", // <-- Mudamos de bottom para top para fugir dos dedos
  left:        "50%",
  transform:   "translateX(-50%)",
  background:  "linear-gradient(135deg, #ff6a00, #ee0979)",
  color:       "#fff",
  fontWeight:  "bold",
  fontSize:    "0.88rem",
  lineHeight:  "1.4",
  padding:     "14px 22px",
  borderRadius:"18px",
  zIndex:      "9999", // <-- Valor altíssimo para garantir sobreposição
  textAlign:   "center",
  maxWidth:    "82%",
  boxShadow:   "0 0 18px rgba(255,100,0,0.7)",
  animation:   "aviso-entrar 0.35s ease forwards, aviso-pulsar 1s ease-in-out infinite",
  cursor:      "pointer",
});

  // toque/clique no aviso também o fecha
  aviso.addEventListener("click",      fecharAviso);
  aviso.addEventListener("touchstart", fecharAviso, { passive: true });

  document.body.appendChild(aviso);

  const timer = setTimeout(fecharAviso, 3500);

  function fecharAviso() {
    clearTimeout(timer);
    aviso.removeEventListener("click",      fecharAviso);
    aviso.removeEventListener("touchstart", fecharAviso);
    aviso.style.animation = "aviso-sair 0.35s ease forwards";
    setTimeout(() => {
      aviso.remove();
      avisoSetasEmExibicao = false;
    }, 350);
  }
}

function contarCliqueSeta() {
  cliquesSetas++;
  if (cliquesSetas > 3) mostrarAvisoSetas();
}

// ── MÚSICA — persiste entre reloads via localStorage ─────────
function iniciarMusica() {
  if (musicaIniciada) return;
  musicaIniciada = true;
  musicaEl.volume = 0.55;

  // Retoma do ponto onde parou antes do reload
  const tempoSalvo = parseFloat(localStorage.getItem("musica_tempo") || "0");
  if (tempoSalvo > 0) musicaEl.currentTime = tempoSalvo;

  musicaEl.play().catch(() => {});
}

// Salva a posição da música a cada segundo
setInterval(() => {
  if (!musicaEl.paused) {
    localStorage.setItem("musica_tempo", musicaEl.currentTime);
  }
}, 1000);

// Salva também quando a página fechar/recarregar
window.addEventListener("beforeunload", () => {
  localStorage.setItem("musica_tempo", musicaEl.currentTime);
});

// Quando o áudio chega ao fim e reinicia (loop), zera o salvo
musicaEl.addEventListener("seeked", () => {
  if (musicaEl.currentTime < 1) localStorage.removeItem("musica_tempo");
});

window.addEventListener("load", () => {
  musicaEl.play().then(() => { musicaIniciada = true; }).catch(() => {});
});

document.addEventListener("keydown", iniciarMusica, { once: true });
document.addEventListener("click",   iniciarMusica, { once: true });
document.addEventListener("touchstart", iniciarMusica, { once: true, passive: true });

// ── MOBILE: BOTÕES DE TOQUE ──────────────────────────────────
// Usamos touchstart (com preventDefault) em vez do "click" comum
// para responder instantaneamente, sem o delay de ~300ms do
// navegador e sem disparar clique fantasma/zoom no botão.
function ligarBotaoToque(elemento, acao) {
  if (!elemento) return;
  const executar = (e) => {
    e.preventDefault();
    acao();
  };
  elemento.addEventListener("touchstart", executar, { passive: false });
  // mantém o clique também, para quem estiver testando em mobile
  // via mouse (emulador) ou em telas híbridas touch+mouse
  elemento.addEventListener("click", (e) => { e.preventDefault(); acao(); });
}

ligarBotaoToque(document.getElementById("btn-esq"),  () => { contarCliqueSeta(); moverJogador(-1); });
ligarBotaoToque(document.getElementById("btn-dir"),  () => { contarCliqueSeta(); moverJogador(+1); });
ligarBotaoToque(document.getElementById("btn-pulo"), () => { contarCliqueSeta(); pular(); });

// ── MOBILE: GESTOS DE SWIPE NA TELA DE JOGO ──────────────────
// Além dos botões, dá pra jogar arrastando o dedo:
// swipe esquerda/direita troca de raia, swipe pra cima ou
// toque rápido (tap) faz pular — igual aos jogos de corrida.
(function configurarSwipe() {
  const zona = document.getElementById("zona-jogo");
  if (!zona) return;

  const DISTANCIA_MINIMA = 30; // px
  let inicioX = 0, inicioY = 0, inicioTempo = 0;
  let tocouNoBotaoContinuar = false;

  zona.addEventListener("touchstart", (e) => {
    // se o toque começou em cima do botão "Continuar" (smurf derrotado),
    // não interpretamos como swipe/pulo — deixamos o clique normal acontecer
    tocouNoBotaoContinuar = !!e.target.closest("#botao-na-mao");
    if (tocouNoBotaoContinuar) return;

    const t = e.changedTouches[0];
    inicioX = t.clientX;
    inicioY = t.clientY;
    inicioTempo = Date.now();
  }, { passive: true });

  zona.addEventListener("touchend", (e) => {
    if (tocouNoBotaoContinuar) return;

    const t = e.changedTouches[0];
    const deltaX = t.clientX - inicioX;
    const deltaY = t.clientY - inicioY;
    const deltaTempo = Date.now() - inicioTempo;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX < DISTANCIA_MINIMA && absY < DISTANCIA_MINIMA) {
      // toque rápido e curto, sem arrasto = pular
      if (deltaTempo < 250) pular();
      return;
    }

    if (absX > absY) {
      // swipe horizontal
      moverJogador(deltaX > 0 ? +1 : -1);
    } else if (deltaY < 0) {
      // swipe pra cima = pular
      pular();
    }
  }, { passive: true });
})();

// ── MOBILE: garante que o toque no botão "Continuar" navegue ─
// Em alguns navegadores mobile o clique sintético após o toque
// pode atrasar ou não disparar. Aqui garantimos a navegação
// também via touchend, direto no botão, sem depender disso.
botaoNaMao.addEventListener("touchend", (e) => {
  if (!capturando) return;
  e.preventDefault();
  ativo = false;
  mensagemEl.style.display = "none";
  alert("Parabéns! Você usou o poder dos Bitcoins, derrotou o Smurf Ladrão e conseguiu Encerrar a experiência. 🎉");
  window.location.href = "../index_final.html";
}, { passive: false });

// ── UTILITÁRIOS ──────────────────────────────────────────────
function aplicarRaia(elemento, indice) {
  RAIAS.forEach(c => elemento.classList.remove(c));
  elemento.classList.add(RAIAS[indice]);
}

function moverJogador(delta) {
  if (!ativo) return;
  const nova = raiaJogador + delta;
  if (nova < 0 || nova > 2) return;
  raiaJogador = nova;
  aplicarRaia(jogador, raiaJogador);
}

function pular() {
  if (!ativo || pulando) return;
  pulando = true;
  jogador.classList.add("pulando");
  setTimeout(() => { jogador.classList.remove("pulando"); pulando = false; }, 480);
}

function atualizarHud() {
  vidaJogadorEl.textContent = "❤️".repeat(hpJogador) + "🖤".repeat(HP_JOGADOR_MAX - hpJogador);
  placarEl.textContent = `🪙 Bitcoins: ${moedasColetadas}/${BITCOINS_NECESSARIOS}`;
  barraVidaBossEl.style.width = `${Math.max(hpBoss, 0)}%`;
}

function mostrarMensagem(html, duracaoMs) {
  mensagemEl.innerHTML = html;
  mensagemEl.style.display = "block";
  if (duracaoMs) {
    setTimeout(() => { if (mensagemEl.innerHTML === html) mensagemEl.style.display = "none"; }, duracaoMs);
  }
}

// ── DIFICULDADE ──────────────────────────────────────────────
function progresso() {
  return Math.min(moedasColetadas / BITCOINS_NECESSARIOS, 1);
}
function duracaoObstaculo() {
  return Math.max(2.6 - progresso() * 1.0, 1.4);
}

// ── DANO AO JOGADOR ──────────────────────────────────────────
function sofrerDano() {
  if (invulneravel || capturando || !ativo) return;
  hpJogador--;
  atualizarHud();
  if (hpJogador <= 0) { fimDeJogo(); return; }
  invulneravel = true;
  jogador.classList.add("invulneravel");
  mostrarMensagem("Ai! 💥", 500);
  setTimeout(() => { invulneravel = false; jogador.classList.remove("invulneravel"); }, DURACAO_INVULNERABILIDADE_MS);
}

function fimDeJogo() {
  ativo = false;
  clearTimeout(timeoutObstaculo);
  clearTimeout(timeoutBitcoin);
  containerObs.innerHTML = "";
  containerBitcoins.innerHTML = "";
  mostrarMensagem(
    "GAME OVER<br>O Smurf Ladrão venceu... 😈" +
    '<br><span class="botao-reiniciar" onclick="location.reload()">Tentar de novo</span>'
  );
}

// ── OBSTÁCULOS ───────────────────────────────────────────────
function criarObstaculo() {
  if (!ativo || capturando) return;
  const raia = Math.floor(Math.random() * 3);
  const el   = document.createElement("div");
  el.classList.add("obstaculo", RAIAS[raia]);
  el.style.animationDuration = `${duracaoObstaculo()}s`;
  const img  = document.createElement("img");
  img.src    = "assets/obstaculo.png";
  img.alt    = "Barreira";
  img.style.cssText = "width:100%;display:block;mix-blend-mode:lighten";
  el.appendChild(img);
  containerObs.appendChild(el);
  el.addEventListener("animationend", () => {
    if ((raia === raiaJogador) && !pulando) sofrerDano();
    el.remove();
  });
}

function agendarProximoObstaculo() {
  if (!ativo || capturando) return;
  criarObstaculo();
  const intervalo = Math.max(1500 - progresso() * 700, 800);
  timeoutObstaculo = setTimeout(agendarProximoObstaculo, intervalo);
}

// ── BITCOINS ─────────────────────────────────────────────────
function criarBitcoin() {
  if (!ativo || capturando) return;
  const raia = Math.floor(Math.random() * 3);
  const el   = document.createElement("div");
  el.classList.add("bitcoin", RAIAS[raia]);
  el.style.animationDuration = "1.9s";
  const img  = document.createElement("img");
  img.src    = "assets/Bitcoin.png";
  img.alt    = "Bitcoin";
  el.appendChild(img);
  containerBitcoins.appendChild(el);
  el.addEventListener("animationend", () => {
    if (raia === raiaJogador) {
      moedasColetadas = Math.min(moedasColetadas + 1, BITCOINS_NECESSARIOS);
      atualizarHud();
      mostrarMensagem(`🪙 +1 Bitcoin! (${moedasColetadas}/${BITCOINS_NECESSARIOS})`, 500);
      if (moedasColetadas >= BITCOINS_NECESSARIOS) lancarPoder();
    }
    el.remove();
  });
}

function agendarProximoBitcoin() {
  if (!ativo || capturando) return;
  criarBitcoin();
  const intervalo = 1900 + Math.random() * 600;
  timeoutBitcoin = setTimeout(agendarProximoBitcoin, intervalo);
}

// ── PODER (matrix sobe → explosão no smurf) ──────────────────
function lancarPoder() {
  capturando = true;
  clearTimeout(timeoutObstaculo);
  clearTimeout(timeoutBitcoin);
  clearTimeout(timeoutSmurf);        // para o smurf de andar AGORA
  containerObs.innerHTML = "";
  containerBitcoins.innerHTML = "";

  // Congela o smurf na raia onde ele está neste exato momento
  raiaSmurfCongelada = raiaSmurf;
  aplicarRaia(smurf, raiaSmurfCongelada);
  aplicarRaia(bossInfo, raiaSmurfCongelada);

  hpBoss = 0;
  atualizarHud();
  mostrarMensagem("⚡ PODER DOS BITCOINS! ⚡", 1000);

  // O poder sobe da raia do Koda → mas o smurf pode estar em raia diferente.
  // Para o poder "apontar" para o smurf, colocamos ele na raia do smurf congelado.
  poderGif.classList.remove("oculto", "subindo");
  aplicarRaia(poderGif, raiaSmurfCongelada);

  void poderGif.offsetWidth;
  poderGif.classList.add("subindo");

  poderGif.addEventListener("animationend", () => {
    poderGif.classList.add("oculto");
    mostrarExplosao();
  }, { once: true });
}

function mostrarExplosao() {
  explosaoGif.classList.remove("oculto", "explodindo");
  aplicarRaia(explosaoGif, raiaSmurfCongelada);

  // Posiciona a explosão exatamente sobre o smurf usando sua posição real na tela
  const smurfRect  = smurf.getBoundingClientRect();
  const zonaRect   = document.getElementById("zona-jogo").getBoundingClientRect();
  // Centro vertical do smurf relativo à zona de jogo
  const topRelativo = smurfRect.top - zonaRect.top + smurfRect.height / 2;
  explosaoGif.style.top  = `${topRelativo}px`;
  explosaoGif.style.transform = "translate(-50%, -50%)"; // centraliza no ponto

  const src = explosaoGif.src;
  explosaoGif.src = "";
  explosaoGif.src = src;

  void explosaoGif.offsetWidth;
  explosaoGif.classList.add("explodindo");

  // Smurf permanece visível — a explosão aparece em cima dele
  explosaoGif.addEventListener("animationend", () => {
    explosaoGif.classList.add("oculto");
    iniciarCaptura();
  }, { once: true });
}

// ── SMURF PROVOCA ────────────────────────────────────────────
function provocarComSmurf() {
  if (!ativo || capturando) return;
  raiaSmurf = Math.floor(Math.random() * 3);
  aplicarRaia(smurf, raiaSmurf);
  aplicarRaia(bossInfo, raiaSmurf);
  timeoutSmurf = setTimeout(provocarComSmurf, 1300 + Math.random() * 700);
}

// ── CAPTURA FINAL ────────────────────────────────────────────
function iniciarCaptura() {
  smurf.style.visibility = "visible";
  aplicarRaia(smurf, raiaJogador);
  aplicarRaia(bossInfo, raiaJogador);
  smurf.style.top = "45%";
  bossInfo.style.top = "30%";
  smurf.classList.add("alcancavel");
  mostrarMensagem("O Smurf foi derrotado! Clique em Continuar! 🎉");
}

botaoNaMao.addEventListener("click", () => {
  if (!capturando) return;
  ativo = false;
  mensagemEl.style.display = "none";
  alert("Parabéns! Você usou o poder dos Bitcoins, derrotou o Smurf Ladrão e conseguiu Encerrar a experiência. 🎉");
  window.location.href = "../index_final.html";
});

  // ── CONTROLES ────────────────────────────────────────────────
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft":  
      contarCliqueSeta(); // <-- Adicionado
      moverJogador(-1); 
      break;
    case "ArrowRight": 
      contarCliqueSeta(); // <-- Adicionado
      moverJogador(+1); 
      break;
    case "ArrowUp":
    case " ":
      e.preventDefault();
      contarCliqueSeta(); // <-- Adicionado
      pular();
      break;
  }
});

// ── INÍCIO ───────────────────────────────────────────────────
atualizarHud();
agendarProximoObstaculo();
agendarProximoBitcoin();
provocarComSmurf();
