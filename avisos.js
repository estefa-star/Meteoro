/* avisos.js — lógica y animaciones de los avisos. Sin dependencias.
 * El aspecto (colores, tamaños, fuentes) vive en avisos.css.
 *
 *   <link rel="stylesheet" href="avisos.css">
 *   <script src="avisos.js"></script>
 *
 *   Avisos.dificultad(3);                    // banner "NIVEL 3" + confeti
 *   Avisos.dificultad(4, '¡Más rápido!');
 *   Avisos.indicacion('esquivar');           // mové la cabeza a los lados
 *   Avisos.indicacion('lanzar');             // mantené pulsado
 *   Avisos.ambas();
 *   Avisos.toast('¡Combo x3!');
 * Todas devuelven una Promise que resuelve cuando termina el aviso.
 */
const Avisos = (() => {
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLORES = 7; // cuántas variables --av-1..--av-N hay en el css

  const root = document.createElement('div');
  root.id = 'avisos-root';
  document.body.appendChild(root);

  const esperar = ms => new Promise(r => setTimeout(r, ms));

  async function mostrar(el, { entra, sale, duracion = 2200, alEntrar }) {
    root.appendChild(el);
    await el.animate(reducido ? [{ opacity: 0 }, { opacity: 1 }] : entra,
      { duration: 480, easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'both' }).finished;
    if (alEntrar && !reducido) alEntrar();
    await esperar(duracion);
    await el.animate(reducido ? [{ opacity: 1 }, { opacity: 0 }] : sale,
      { duration: 300, easing: 'ease-in', fill: 'both' }).finished;
    el.remove();
  }

  // confeti: los colores salen de --av-1..--av-7 del css
  function confeti(x, y, cantidad = 22) {
    for (let i = 0; i < cantidad; i++) {
      const c = document.createElement('div');
      c.className = 'av-confeti';
      c.style.background = `var(--av-${(i % COLORES) + 1})`;
      c.style.left = x + 'px'; c.style.top = y + 'px';
      root.appendChild(c);
      const ang = Math.random() * Math.PI * 2, d = 90 + Math.random() * 190;
      c.animate([
        { transform: 'translate(0,0) rotate(0)', opacity: 1 },
        { transform: `translate(${Math.cos(ang) * d}px,${Math.sin(ang) * d + 80}px) rotate(${Math.random() * 540}deg)`, opacity: 0 },
      ], { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' })
        .finished.then(() => c.remove());
    }
  }

  function dificultad(nivel, texto = '¡La dificultad aumenta!') {
    const el = document.createElement('div');
    el.className = 'av-banner';
    el.innerHTML = `<small>¡Ojo!</small><b>NIVEL ${nivel}</b><span>${texto}</span>`;
    return mostrar(el, {
      entra: [{ transform: 'translateX(-110%)' }, { transform: 'translateX(0)' }],
      sale:  [{ transform: 'translateX(0)' }, { transform: 'translateX(110%)' }],
      duracion: 1800,
      alEntrar: () => confeti(innerWidth / 2, innerHeight * 0.34),
    });
  }

  // los iconos solo llevan clases; colores y trazos se definen en el css
  const ICONOS = {
    esquivar: `<svg class="av-ico" viewBox="0 0 92 76">
      <path class="av-flecha-i" d="M8 38l13-10v20z"/>
      <path class="av-flecha-d" d="M84 38l-13-10v20z"/>
      <g class="av-cabeza">
        <path class="av-cuerpo" d="M22 76q0-22 24-22t24 22z"/>
        <circle class="av-cara" cx="46" cy="32" r="15"/>
        <circle class="av-ojo" cx="41" cy="30" r="2"/><circle class="av-ojo" cx="52" cy="30" r="2"/>
      </g></svg>`,
    lanzar: `<svg class="av-ico" viewBox="0 0 92 76">
      <circle class="av-pista" cx="46" cy="38" r="21"/>
      <circle class="av-anillo" cx="46" cy="38" r="21"/>
      <g class="av-pelota"><circle class="av-bola" cx="46" cy="38" r="12"/>
      <circle class="av-brillo" cx="42" cy="34" r="3"/></g></svg>`,
  };
  const TEXTOS = {
    esquivar: ['Esquivá', 'Mové la cabeza a los lados'],
    lanzar:   ['Lanzá',   'Mantené pulsado para cargar y soltá'],
  };

  function indicacion(tipo, duracion = 2600) {
    const el = document.createElement('div');
    el.className = 'av-card';
    el.innerHTML = `${ICONOS[tipo]}<div><h3>${TEXTOS[tipo][0]}</h3><p>${TEXTOS[tipo][1]}</p></div>`;
    return mostrar(el, {
      entra: [{ transform: 'translateY(90px) scale(.8)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      sale:  [{ transform: 'none', opacity: 1 }, { transform: 'translateY(50px) scale(.9)', opacity: 0 }],
      duracion,
    });
  }

  async function ambas() { await indicacion('esquivar'); await indicacion('lanzar'); }

  function toast(texto) {
    const el = document.createElement('div');
    el.className = 'av-toast';
    el.textContent = texto;
    return mostrar(el, {
      entra: [{ transform: 'translateY(-40px) scale(.7)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      sale:  [{ opacity: 1 }, { opacity: 0 }],
      duracion: 1200,
    });
  }

  return { dificultad, indicacion, ambas, toast };
})();
