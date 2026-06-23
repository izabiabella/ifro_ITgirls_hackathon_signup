// ===========================================================
// LÓGICA DO BOTÃO "CONTINUAR" QUE FOGE DO USUÁRIO
// ===========================================================
// Ideia: sempre que o mouse chega perto do botão, ele "pula"
// para um lugar aleatório da tela, igual aos obstáculos do
// Subway Surfers desviando do jogador.
//
// Para não ser 100% impossível (e ainda assim continuar sendo
// uma piada cruel), depois de N fugas o botão para de correr
// e deixa o usuário clicar. Ajuste TENTATIVAS_PARA_DESISTIR
// se quiser deixar mais fácil, mais difícil, ou infinito.
// ===========================================================

const botao = document.getElementById("botao-continuar");
const contadorEl = document.getElementById("contador-fugas");

const DISTANCIA_DE_FUGA = 140;      // px: se o mouse chegar mais perto que isso, o botão foge
const TENTATIVAS_PARA_DESISTIR = 12; // depois disso o botão "cansa" e deixa clicar
const VELOCIDADE_MINIMA_MS = 90;     // fuga vai ficando mais rápida a cada tentativa

let tentativas = 0;
let permitirClique = false;

function posicionarBotaoNoCentro() {
  const largura = botao.offsetWidth;
  const altura = botao.offsetHeight;
  botao.style.left = `${window.innerWidth / 2 - largura / 2}px`;
  botao.style.top = `${window.innerHeight * 0.62 - altura / 2}px`;
}

function posicaoAleatoria() {
  const largura = botao.offsetWidth;
  const altura = botao.offsetHeight;
  const margem = 20;

  const maxX = window.innerWidth - largura - margem;
  const maxY = window.innerHeight - altura - margem;

  const x = margem + Math.random() * (maxX - margem);
  const y = margem + Math.random() * (maxY - margem);

  return { x, y };
}

function fugir() {
  if (permitirClique) return;

  tentativas++;
  contadorEl.textContent = `Tentativas: ${tentativas}`;

  const { x, y } = posicaoAleatoria();
  botao.style.left = `${x}px`;
  botao.style.top = `${y}px`;

  botao.classList.remove("pulando");
  // força reflow pra animação de pulo poder repetir
  void botao.offsetWidth;
  botao.classList.add("pulando");

  if (tentativas >= TENTATIVAS_PARA_DESISTIR) {
    permitirClique = true;
    botao.textContent = "Continuar (ok, pode clicar)";
    botao.style.background = "#1bff5e";
    botao.style.boxShadow = "0 0 15px #1bff5e";
  }
}

function distancia(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

document.addEventListener("mousemove", (evento) => {
  if (permitirClique) return;

  const rect = botao.getBoundingClientRect();
  const centroBotaoX = rect.left + rect.width / 2;
  const centroBotaoY = rect.top + rect.height / 2;

  const dist = distancia(evento.clientX, evento.clientY, centroBotaoX, centroBotaoY);

  if (dist < DISTANCIA_DE_FUGA) {
    fugir();
  }
});

// também foge se o usuário tentar tocar (mobile) ou clicar muito perto
botao.addEventListener("mouseenter", fugir);

botao.addEventListener("click", () => {
  if (permitirClique) {
    alert("Parabéns! Você venceu o pior botão do evento. 🎉");
    window.location.href = "final.html";
  }
});

window.addEventListener("resize", () => {
  if (!permitirClique) posicionarBotaoNoCentro();
});

posicionarBotaoNoCentro();
