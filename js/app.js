/* =====================================================================
   APP: aquí está todo el comportamiento de la página.
   Lee los datos de datos.js y los convierte en cosas que se ven.

   Cómo funciona, en simple:
   1. Al abrir la página se dibujan los 8 presidentes (dibujarInicio).
   2. Al hacer click en uno, la dirección cambia a  index.html#aylwin
   3. Cada vez que cambia esa dirección, se llama a "mostrar()",
      que decide si se ve el inicio o la ficha de un presidente.
   (Así también funciona el botón "atrás" del navegador.)
   ===================================================================== */


/* ---------- Atajos para no escribir tanto ---------- */
const $ = (selector) => document.querySelector(selector);



/* ---------- 1. INICIO: los 8 presidentes ---------- */
function dibujarInicio() {
  const lista = $("#lista-presidentes");

  PRESIDENTES.forEach((p, i) => {
    // Creamos un elemento <li> y le escribimos su HTML adentro
    const item = document.createElement("li");
    item.style.setProperty("--i", i);   // su posición: sirve para que lleguen uno tras otro
    item.innerHTML = `
      <a href="#${p.id}" class="presidente">
        <img class="foto" src="${p.foto}" alt="Foto de ${p.nombre}">
        <span class="nombre">${p.nombre}</span>
        <span class="periodo">${p.periodo}</span>
      </a>`;
    lista.appendChild(item);
  });

  ponerRespaldoAFotos();
}


/* Si una foto todavía no existe en la carpeta fotos/,
   mostramos las iniciales en vez de una imagen rota. */
function ponerRespaldoAFotos() {
  document.querySelectorAll("img.foto").forEach((img) => {
    img.onerror = () => {
      const iniciales = img.alt.replace("Foto de ", "").split(" ").map((p) => p[0]).join("");
      const caja = document.createElement("span");
      caja.className = img.className + " sin-foto";
      caja.id = img.id;
      caja.textContent = iniciales;
      img.replaceWith(caja);
    };
  });
}


/* ---------- 2. FICHA: un presidente ---------- */
function dibujarFicha(p) {
  const i = PRESIDENTES.indexOf(p);

  // Cabeza
  $("#ficha-nombre").textContent = p.nombre;
  $("#ficha-periodo").textContent = `${p.periodo} · ${p.partido}`;
  $("#contador").textContent = `${i + 1} de ${PRESIDENTES.length}`;
  // La foto se crea de nuevo cada vez (por si la anterior no existía)
  const foto = document.createElement("img");
  foto.id = "ficha-foto";
  foto.className = "foto grande";
  foto.src = p.foto;
  foto.alt = "Foto de " + p.nombre;
  $("#ficha-foto").replaceWith(foto);

  dibujarAnios(p);
  ponerRespaldoAFotos();
}


/* AÑO A AÑO: una fila por año (año + torta + economía + seguridad)
   y, antes de cada año, sus hitos (un punto y el texto). */
function dibujarAnios(p) {
  const caja = $("#ficha-anios");

  // Si todavía no cargamos los años de este presidente, avisamos
  if (!p.anios) {
    caja.innerHTML = `<p class="anios-pendiente">Estamos juntando los datos de este gobierno.</p>`;
    return;
  }

  const ultimo = p.anios[p.anios.length - 1].anio;
  const punto = (h) => `<p class="hito-punto"><span><b>${h.fecha}</b> · ${h.texto}</span></p>`;

  caja.innerHTML = p.anios.map((a) => {
    // Los hitos de este año van justo antes de su fila
    const hitos = (p.hitos || []).filter((h) => h.anio === a.anio).map(punto).join("");

    // Si ese año no hubo encuesta, en vez de la torta va un aviso
    const percepcion = a.aprueba == null
      ? `<p class="sin-encuesta">${a.nota || "No hubo encuesta CEP este año."}</p>`
      : torta(a);

    return `
      ${hitos}
      <div class="fila-anio">
        <span class="anio-numero">${a.anio}</span>
        ${percepcion}
        <div class="celda-eje celda-economia">${economia(a.anio)}</div>
        <div class="celda-eje celda-seguridad"></div>   <!-- Seguridad: lo diseñan ustedes -->
      </div>`;
  }).join("")
  // Hitos que pasaron después del último año con encuesta (van al final)
  + (p.hitos || []).filter((h) => h.anio > ultimo).map(punto).join("");

  // Que las filas aparezcan al bajar (igual que las historias del inicio)
  caja.querySelectorAll(".fila-anio, .hito-punto").forEach((el) => vigilante.observe(el));
}


/* ---------- ECONOMÍA: el carro (inflación) y la mesa (desempleo) ---------- */

// Número con coma decimal: 12.8 → "12,8"
const coma = (n, dec = 1) => n.toFixed(dec).replace(".", ",");

function economia(anio) {
  const inflacion = IPC_DIC[anio];
  const desempleo = DESEMPLEO[anio];
  if (inflacion == null && desempleo == null) return "";

  const carros = cuantosCarros(anio);
  return `
    <div class="eco-item">
      <div class="carros">${dibujarCarros(carros)}</div>
      <div>
        <p class="eco-num">${coma(inflacion)}%</p>
        <p class="eco-label">inflación del año</p>
        <p class="eco-detalle">Con $50 mil: ${coma(carros, 2)} ${coma(carros, 2) === "1,00" ? "carro" : "carros"}</p>
      </div>
    </div>
    <div class="eco-item">
      ${mesa(desempleo)}
      <div>
        <p class="eco-num">${coma(desempleo)}%</p>
        <p class="eco-label">desempleo</p>
        <p class="eco-detalle">${Math.round(desempleo)} de cada 100 no encuentran pega</p>
      </div>
    </div>`;
}

/* ¿Cuántos carros llenaban $50.000 ese año?
   Hoy (2025) un carro lleno cuesta $200.000, o sea $50.000 = 0,25 carros.
   Hacia atrás, los precios eran más bajos: deshacemos la inflación de cada
   año, desde el siguiente hasta 2025. */
function cuantosCarros(anio) {
  let veces = 1;
  for (let t = anio + 1; t <= CARRO.anioHoy; t++) veces *= 1 + IPC_DIC[t] / 100;
  return (CARRO.pesos / CARRO.carroLlenoHoy) * veces;
}

/* El canasto del carro (en la imagen fotos/carro_super.png, de 600 x 494) */
const CANASTO = [[138, 111], [580, 132], [559, 278], [247, 324]];

// Ancho del canasto a una altura "y" (para llenar por ÁREA, no solo por altura)
function anchoEn(y) {
  const xs = [];
  for (let i = 0; i < CANASTO.length; i++) {
    const [x1, y1] = CANASTO[i], [x2, y2] = CANASTO[(i + 1) % CANASTO.length];
    if ((y - y1) * (y - y2) <= 0 && y1 !== y2) xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
  }
  return xs.length >= 2 ? Math.max(...xs) - Math.min(...xs) : 0;
}

// Altura hasta donde llega la comida para llenar una fracción (0 a 1) del canasto
function nivelDeLlenado(fraccion) {
  const arriba = 111, abajo = 324;
  let total = 0;
  for (let y = abajo; y > arriba; y--) total += anchoEn(y);
  let suma = 0;
  for (let y = abajo; y > arriba; y--) {
    suma += anchoEn(y);
    if (suma >= fraccion * total) return y;
  }
  return arriba;
}

// La comida: cajitas y frutas de colores, siempre las mismas (no cambian al recargar)
let comidaSVG = null;
function comida() {
  if (comidaSVG) return comidaSVG;
  let semilla = 7;
  const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
  const colores = ["#e8a33d", "#d9534f", "#5cb85c", "#f0d264", "#8e6c4a", "#e07b39", "#4a90c2", "#c94c7c"];
  let piezas = "";
  for (let y = 330; y > 95; y -= 22) {
    for (let x = 120; x < 600; x += 26) {
      const c = colores[Math.floor(azar() * colores.length)];
      const t = 26 + azar() * 18, dx = x + azar() * 14, dy = y - azar() * 14;
      piezas += azar() < 0.5
        ? `<rect x="${dx}" y="${dy - t}" width="${t}" height="${t * (0.8 + azar() * 0.5)}" rx="4" fill="${c}"/>`
        : `<circle cx="${dx}" cy="${dy - t / 2}" r="${t / 2}" fill="${c}"/>`;
    }
  }
  return (comidaSVG = piezas);
}

// Dibuja 1 o 2 carros: el primero se llena, y lo que sobra va al segundo
let idCarro = 0;
function dibujarCarros(carros) {
  const llenos = [Math.min(carros, 1)];
  if (carros > 1) llenos.push(Math.min(carros - 1, 1));
  return llenos.map((f) => {
    const id = "c" + idCarro++;
    const nivel = nivelDeLlenado(f);
    return `
      <svg class="carro" viewBox="0 0 600 494" role="img" aria-label="Carro de súper lleno en un ${Math.round(f * 100)}%">
        <defs>
          <clipPath id="${id}a"><polygon points="${CANASTO.join(" ")}"/></clipPath>
          <clipPath id="${id}b"><rect x="0" y="${nivel}" width="600" height="494"/></clipPath>
        </defs>
        <g clip-path="url(#${id}a)"><g clip-path="url(#${id}b)">${comida()}</g></g>
        <image href="fotos/carro_super.png" width="600" height="494"/>
      </svg>`;
  }).join("");
}

/* La mesa redonda: la tajada pintada son los que no encuentran pega.
   Dibujo: fotos/empleo_mesa_redonda 2.svg (fondo transparente).
   La mesa es un círculo dentro del dibujo (centro 382,419 y radio 230, en un dibujo de 735 x 771). */
function mesa(desempleo) {
  return `
    <div class="mesa" role="img" aria-label="Mesa redonda con ${coma(desempleo)}% pintado">
      <img src="fotos/empleo_mesa_redonda 1.svg" alt="">
      <span class="mesa-tajada" style="--pct:${desempleo}%"></span>
    </div>`;
}


/* La torta de aprobación (en realidad una "dona": torta con hoyo al centro).
   Se pinta con conic-gradient: cada color ocupa su porcentaje de la vuelta.
   Adentro del hoyo van los tres números. */
function torta(a) {
  const otros = 100 - a.aprueba - a.desaprueba;
  const fin1 = a.aprueba;                 // aprueba:    de 0 a fin1
  const fin2 = a.aprueba + a.desaprueba;  // desaprueba: de fin1 a fin2, y el resto es "otros"

  return `
    <figure class="torta" title="${a.encuesta}"
            style="--fin1:${fin1}%; --fin2:${fin2}%">
      <figcaption class="torta-centro">
        <span class="t-aprueba"><b>${a.aprueba}%</b> Aprueba</span>
        <span class="t-desaprueba"><b>${a.desaprueba}%</b> Desaprueba</span>
        <span class="t-otros"><b>${otros}%</b> Otros</span>
      </figcaption>
    </figure>`;
}


/* ---------- 3. AL BAJAR (scroll) ---------- */

/* La portada: calcula cuánto has bajado dentro de .intro (de 0 a 1)
   y se lo pasa al CSS como --avance. El CSS usa ese número para
   achicar la frase, subirla y hacer aparecer la motivación. */
function animarPortada() {
  const intro = $(".intro");
  const recorrido = intro.offsetHeight - window.innerHeight;   // cuánto se puede bajar dentro de la portada
  const avance = Math.min(1, Math.max(0, window.scrollY / recorrido));
  intro.style.setProperty("--avance", avance);
}

window.addEventListener("scroll", animarPortada);
window.addEventListener("resize", animarPortada);


/* Las historias y los presidentes: cuando entran a la pantalla,
   les ponemos la clase "visible" y el CSS los hace aparecer.
   (IntersectionObserver = "avísame cuando esto se vea") */
const vigilante = new IntersectionObserver((cosas) => {
  cosas.forEach((cosa) => {
    if (cosa.isIntersecting) {
      cosa.target.classList.add("visible");
      vigilante.unobserve(cosa.target);   // ya apareció, no lo seguimos mirando
    }
  });
}, { threshold: 0.3 });   // aparece cuando se ve el 30%

document.querySelectorAll(".historia, .presidentes, .dato-explicado").forEach((el) => vigilante.observe(el));


/* "¿Qué son?": mientras bajas, cada foto se corre un poco a la derecha.
   --mover va de 0 (el bloque recién asoma por abajo) a 1 (ya se va por arriba). */
function moverFotos() {
  document.querySelectorAll(".dato-explicado").forEach((el) => {
    const r = el.getBoundingClientRect();
    const avance = 1 - (r.top + r.height) / (window.innerHeight + r.height);
    el.style.setProperty("--mover", Math.min(1, Math.max(0, avance)).toFixed(3));
  });
}
window.addEventListener("scroll", moverFotos);
window.addEventListener("resize", moverFotos);
moverFotos();


/* ---------- 4. NAVEGACIÓN ---------- */

// Decide qué pantalla mostrar según la dirección (#aylwin, #frei, ...)
function mostrar() {
  const id = location.hash.replace("#", "");
  const p = PRESIDENTES.find((x) => x.id === id);

  if (p) {
    dibujarFicha(p);
    $("#inicio").classList.remove("activa");
    $("#ficha").classList.add("activa");
  } else {
    $("#ficha").classList.remove("activa");
    $("#inicio").classList.add("activa");
  }

  // Si la dirección apunta a una sección del inicio (#presidentes, #que-son),
  // saltamos directo ahí. Si no, arriba de todo.
  const seccion = !p && id ? document.getElementById(id) : null;
  if (seccion) {
    seccion.scrollIntoView();
  } else {
    window.scrollTo(0, 0);
  }
  animarPortada();
}

// Pasar al presidente anterior (-1) o siguiente (+1)
function mover(paso) {
  const i = PRESIDENTES.findIndex((x) => "#" + x.id === location.hash);
  if (i === -1) return;
  const nuevo = (i + paso + PRESIDENTES.length) % PRESIDENTES.length;
  location.hash = PRESIDENTES[nuevo].id;
}

$("#anterior").addEventListener("click", () => mover(-1));
$("#siguiente").addEventListener("click", () => mover(+1));

// Teclado: flechas para moverse, Esc para volver al inicio
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft")  mover(-1);
  if (e.key === "ArrowRight") mover(+1);
  if (e.key === "Escape")     location.hash = "presidentes";
});

window.addEventListener("hashchange", mostrar);


/* ---------- Arrancar ---------- */
dibujarInicio();
mostrar();
