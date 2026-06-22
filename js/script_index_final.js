const fakeCursor = document.querySelector('.fake-cursor');
let mx = innerWidth/2, my = innerHeight/2, cx = mx, cy = my;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function loop(){
  cx += (mx - cx) * 0.08;
  cy += (my - cy) * 0.08;
  fakeCursor.style.transform = `translate(${cx}px, ${cy}px)`;
  requestAnimationFrame(loop);
})();

const confettiLayer = document.getElementById('confettiLayer');
const colors = ['#8B4513', '#FF00FF', '#FFFF00', '#00FFFF', '#FF0000', '#39ff84'];
let confettiRunning = true;
function spawnConfetti() {
  if (!confettiRunning) return;
  const piece = document.createElement('div');
  piece.className = 'confetti-piece';
  piece.style.left = Math.random() * 100 + 'vw';
  piece.style.background = colors[Math.floor(Math.random() * colors.length)];
  const duration = 2.5 + Math.random() * 2;
  piece.style.animationDuration = duration + 's';
  piece.addEventListener('animationend', () => piece.remove());
  confettiLayer.appendChild(piece);
}
const confettiInterval = setInterval(() => {
  spawnConfetti();
  if (Math.random() > 0.3) spawnConfetti();
}, 180);

const toastStack = document.getElementById('toastStack');
const names = ['João', 'Maria', 'Pedro', 'Ana', 'Lucas', 'Beatriz', 'Gabriel', 'Larissa', 'Rafael', 'Camila', 'Bruno', 'Fernanda'];
let toastRunning = true;
function spawnToast() {
  if (!toastRunning) return;
  if (toastStack.children.length >= 3) return;
  const name = names[Math.floor(Math.random() * names.length)];
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = `🚨 URGENTE: ${name} TAMBÉM SE INSCREVEU! 🚨`;
  toastStack.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
const toastInterval = setInterval(spawnToast, 1200);

const countEl = document.getElementById('count');
const redirectText = document.getElementById('redirectText');
let n = 5;
let redirectRunning = true;
const redirectInterval = setInterval(() => {
  if (!redirectRunning) return;
  n -= 1;
  if (n <= 0) {
    redirectText.textContent = 'redirecionando...';
    setTimeout(() => { if (redirectRunning) location.reload(); }, 500);
  } else {
    countEl.textContent = n;
  }
}, 1000);

document.getElementById('closeBtn').addEventListener('click', () => {
  const btn = document.getElementById('closeBtn');
  btn.classList.add('shake');
  btn.textContent = 'AINDA NÃO 😅';
  spawnConfetti(); spawnConfetti(); spawnConfetti(); spawnConfetti();
  setTimeout(() => btn.classList.remove('shake'), 350);
});

history.pushState({ trap: true }, '', location.href);
function trapBack() {
  history.pushState({ trap: true }, '', location.href);
  openExitModal();
}
window.addEventListener('popstate', trapBack);

function openExitModal() {
  if (document.querySelector('.modal-overlay')) return;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <p>Tem certeza que quer sair? Sua inscrição já está confirmada, mas mesmo assim.</p>
      <div class="modal-actions">
        <button class="modal-stay">FICAR MAIS UM POUCO</button>
        <button class="modal-retry">TENTAR SAIR DE NOVO</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('.modal-stay').addEventListener('click', () => overlay.remove());
  overlay.querySelector('.modal-retry').addEventListener('click', () => overlay.remove());
}

document.getElementById('realExit').addEventListener('click', () => {
  confettiRunning = false;
  toastRunning = false;
  redirectRunning = false;
  clearInterval(confettiInterval);
  clearInterval(toastInterval);
  clearInterval(redirectInterval);
  window.removeEventListener('popstate', trapBack);
  document.querySelectorAll('.modal-overlay, .toast').forEach(el => el.remove());
  document.getElementById('chaos').style.display = 'none';
  document.getElementById('calmState').classList.add('show');
});
