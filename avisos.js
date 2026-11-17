/* avisos.js — avisos animados para tu juego. Sin dependencias.
 *
 * Uso:
 *   <script src="avisos.js"></script>
 *   Avisos.dificultad(3);                    // "NIVEL 3" + subtítulo
 *   Avisos.dificultad(4, '¡Más rápido!');    // con texto propio
 *   Avisos.indicacion('esquivar');           // mové la cabeza a los lados
 *   Avisos.indicacion('lanzar');             // mantené pulsado
 *   Avisos.ambas();                          // las dos indicaciones, una tras otra
 *   Avisos.toast('¡Combo x3!');              // mensaje corto
 * Todas devuelven una Promise que resuelve cuando termina el aviso.
 */
const Avisos = (() => {
  const COLORS = { esquivar: '#4cc9f0', lanzar: '#ff9f1c', nivel: '#f72585' };
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- estilos (se inyectan solos) ----------
  const css = `
  #avisos-root{position:fixed;inset:0;pointer-events:none;z-index:9999;display:grid;place-items:center;
    font-family:system-ui,-apple-system,"Segoe UI",sans-serif;overflow:hidden}
  .av-banner{position:absolute;left:0;right:0;top:32%;padding:18px 0;text-align:center;color:#fff;
    background:linear-gradient(90deg,transparent,rgba(10,10,25,.82) 18%,rgba(10,10,25,.82) 82%,transparent);
    border-top:2px solid var(--c);border-bottom:2px solid var(--c);
    box-shadow:0 0 40px var(--c);backdrop-filter:blur(4px)}
  .av-banner small{display:block;letter-spacing:.5em;font-size:.8rem;opacity:.8;text-transform:uppercase;color:var(--c)}
  .av-banner b{display:block;font-size:clamp(2.4rem,9vw,5rem);font-weight:900;letter-spacing:.08em;
    text-shadow:0 0 18px var(--c);line-height:1.1}
  .av-banner span{display:block;opacity:.85;margin-top:4px}
  .av-card{position:absolute;bottom:14%;display:flex;align-items:center;gap:18px;padding:16px 26px;
    border-radius:20px;color:#fff;background:rgba(12,12,28,.85);border:2px solid var(--c);
    box-shadow:0 0 30px color-mix(in srgb,var(--c) 55%,transparent);backdrop-filter:blur(6px)}
  .av-card h3{margin:0;font-size:1.15rem;color:var(--c);letter-spacing:.05em;text-transform:uppercase}
  .av-card p{margin:2px 0 0;font-size:.95rem;opacity:.9}
  .av-ico{width:90px;height:70px;flex:none}
  .av-toast{position:absolute;top:12%;padding:10px 22px;border-radius:999px;color:#fff;font-weight:700;
    background:rgba(12,12,28,.85);border:2px solid var(--c);box-shadow:0 0 20px var(--c)}
  /* iconos animados (CSS puro, sincronizado con 1.6s) */
  .av-head{animation:av-sway 1.6s ease-in-out infinite;transform-origin:45px 60px}
  .av-arrow-l{animation:av-blink-l 1.6s infinite} .av-arrow-r{animation:av-blink-r 1.6s infinite}
  @keyframes av-sway{0%,100%{transform:translateX(-18px) rotate(-12deg)}50%{transform:translateX(18px) rotate(12deg)}}
  @keyframes av-blink-l{0%,100%{opacity:1}50%{opacity:.2}} @keyframes av-blink-r{0%,100%{opacity:.2}50%{opacity:1}}
  .av-ring{stroke-dasharray:138;stroke-dashoffset:138;animation:av-fill 1.6s ease-in infinite;
    transform:rotate(-90deg);transform-origin:45px 35px}
  .av-ball{animation:av-pulse 1.6s ease-in infinite;transform-origin:45px 35px}
  @keyframes av-fill{0%{stroke-dashoffset:138}75%,100%{stroke-dashoffset:0}}
  @keyframes av-pulse{0%{transform:scale(.7)}75%{transform:scale(1.15)}100%{transform:scale(.7)}}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'avisos-root';
  document.body.appendChild(root);

  // ---------- helpers ----------
  const esperar = ms => new Promise(r => setTimeout(r, ms));

  // Muestra un elemento con animación de entrada/salida (Web Animations API)
  async function mostrar(el, color, { entra, sale, duracion = 2200 }) {
    el.style.setProperty('--c', color);
    root.appendChild(el);
    const t = reducido ? 1 : 0; // si el usuario pide menos movimiento, solo fundido
    const opts = { duration: 450, easing: 'cubic-bezier(.2,.9,.3,1.2)', fill: 'both' };
    await el.animate(t ? [{ opacity: 0 }, { opacity: 1 }] : entra, opts).finished;
    await esperar(duracion);
    await el.animate(t ? [{ opacity: 1 }, { opacity: 0 }] : sale,
      { duration: 350, easing: 'ease-in', fill: 'both' }).finished;
    el.remove();
  }

  // ---------- avisos ----------
  function dificultad(nivel, texto = '¡La dificultad aumenta!') {
    const el = document.createElement('div');
    el.className = 'av-banner';
    el.innerHTML = `<small>Atención</small><b>NIVEL ${nivel}</b><span>${texto}</span>`;
    return mostrar(el, COLORS.nivel, {
      entra: [{ transform: 'translateX(-100%) skewX(-20deg)', opacity: 0 },
              { transform: 'translateX(0) skewX(0)', opacity: 1 }],
      sale:  [{ transform: 'translateX(0)', opacity: 1 },
              { transform: 'translateX(100%) skewX(20deg)', opacity: 0 }],
      duracion: 1800,
    });
  }

  const ICONOS = {
    esquivar: `<svg class="av-ico" viewBox="0 0 90 70">
      <path class="av-arrow-l" d="M10 35l12-9v18z" fill="currentColor"/>
      <path class="av-arrow-r" d="M80 35l-12-9v18z" fill="currentColor"/>
      <g class="av-head"><circle cx="45" cy="28" r="14" fill="currentColor"/>
      <path d="M20 66q0-20 25-20t25 20z" fill="currentColor" opacity=".55"/></g></svg>`,
    lanzar: `<svg class="av-ico" viewBox="0 0 90 70">
      <circle cx="45" cy="35" r="22" fill="none" stroke="currentColor" opacity=".25" stroke-width="5"/>
      <circle class="av-ring" cx="45" cy="35" r="22" fill="none" stroke="currentColor"
        stroke-width="5" stroke-linecap="round"/>
      <circle class="av-ball" cx="45" cy="35" r="11" fill="currentColor"/></svg>`,
  };
  const TEXTOS = {
    esquivar: ['Esquivá', 'Mové la cabeza a los lados'],
    lanzar:   ['Lanzá',   'Mantené pulsado para cargar y soltá'],
  };

  function indicacion(tipo, duracion = 2600) {
    const el = document.createElement('div');
    el.className = 'av-card';
    el.style.color = COLORS[tipo];
    el.innerHTML = `${ICONOS[tipo]}<div><h3>${TEXTOS[tipo][0]}</h3>
      <p style="color:#fff">${TEXTOS[tipo][1]}</p></div>`;
    return mostrar(el, COLORS[tipo], {
      entra: [{ transform: 'translateY(40px) scale(.8)', opacity: 0 },
              { transform: 'translateY(0) scale(1)', opacity: 1 }],
      sale:  [{ transform: 'translateY(0)', opacity: 1 },
              { transform: 'translateY(-20px) scale(.95)', opacity: 0 }],
      duracion,
    });
  }

  async function ambas() { await indicacion('esquivar'); await indicacion('lanzar'); }

  function toast(texto, color = COLORS.nivel) {
    const el = document.createElement('div');
    el.className = 'av-toast';
    el.textContent = texto;
    return mostrar(el, color, {
      entra: [{ transform: 'translateY(-30px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      sale:  [{ opacity: 1 }, { opacity: 0 }],
      duracion: 1200,
    });
  }

  return { dificultad, indicacion, ambas, toast };
})();
