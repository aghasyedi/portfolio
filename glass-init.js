/**
 * glass-init.js — Apple Liquid Glass for portfolio
 * Uses liquid-glass-js (github.com/dashersw/liquid-glass-js) properly:
 * Creates a real WebGL Container positioned as a fixed overlay behind the navbar.
 */

// ── Global glass parameters (tuned for Apple-style subtlety) ──────────────
window.glassControls = {
  blurRadius:     9,
  edgeIntensity:  0.08,
  rimIntensity:   0.12,
  baseIntensity:  0.03,
  edgeDistance:   0.12,
  rimDistance:    0.8,
  baseDistance:   0.1,
  cornerBoost:    0.04,
  rippleEffect:   0.12,
};

// ── Mouse highlight (follows cursor inside glass surfaces) ────────────────
const hlStyle = document.createElement('style');
hlStyle.textContent = `
  .lg-hl {
    position: absolute; inset: 0; pointer-events: none; z-index: 3;
    border-radius: inherit;
    background: radial-gradient(
      450px circle at var(--mx, 50%) var(--my, 20%),
      rgba(255,255,255,0.14) 0%,
      transparent 60%
    );
    transition: opacity 0.3s ease; opacity: 0;
  }
  .glass-navbar-wrap:hover .lg-hl { opacity: 1; }
`;
document.head.appendChild(hlStyle);

// ── Helper: create a floating glass overlay matching a DOM element ────────
function createNavbarGlass(targetEl) {
  const r = targetEl.getBoundingClientRect();

  // Create the WebGL glass Container exactly as the library intends
  const glassNav = new Container({
    type:        'pill',
    tintOpacity: 0.10,
    borderRadius: Math.round(r.height / 2),
  });

  const el = glassNav.element;
  el.classList.add('glass-navbar-wrap');
  el.style.cssText = `
    position: fixed;
    top: ${r.top}px;
    left: ${r.left}px;
    width: ${r.width}px;
    height: ${r.height}px;
    z-index: 999;
    pointer-events: none;
    overflow: hidden;
    border-radius: ${Math.round(r.height / 2)}px;
  `;
  document.body.appendChild(el);

  // Add cursor-following highlight
  const hl = document.createElement('div');
  hl.className = 'lg-hl';
  el.appendChild(hl);
  targetEl.addEventListener('mousemove', e => {
    const nr = targetEl.getBoundingClientRect();
    hl.style.setProperty('--mx', (e.clientX - nr.left) + 'px');
    hl.style.setProperty('--my', (e.clientY - nr.top)  + 'px');
  });

  // Sync position on scroll & resize
  function sync() {
    const nr = targetEl.getBoundingClientRect();
    el.style.top    = nr.top    + 'px';
    el.style.left   = nr.left   + 'px';
    el.style.width  = nr.width  + 'px';
    el.style.height = nr.height + 'px';
    glassNav.updateSizeFromDOM();
    requestAnimationFrame(sync);
  }
  requestAnimationFrame(sync);
}

// ── Init after DOM is ready ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Skip mobile — html2canvas + WebGL is heavy on small screens
  if (window.innerWidth < 768) return;

  const navbar = document.querySelector('.navbar');
  if (navbar) createNavbarGlass(navbar);
});
