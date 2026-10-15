/* app: todo lo que dibuja y mueve la página, con los datos de datos.js
*/


/* atajo para buscar cajas del html
*/
const $ = (selector) => document.querySelector(selector);



/* inicio: los 8 presidentes
*/
function dibujarInicio() {
  const lista = $("#lista-presidentes");

  PRESIDENTES.forEach((p, i) => {
    // un <li> por presidente
    const item = document.createElement("li");
    item.style.setProperty("--i", i);   // posición, para que lleguen uno tras otro
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


/* si falta una foto, pone las iniciales
*/
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


/* ficha: un presidente
*/
function dibujarFicha(p) {
  const i = PRESIDENTES.indexOf(p);

  // cabeza
  $("#ficha-nombre").textContent = p.nombre;
  $("#ficha-periodo").textContent = `${p.periodo} · ${p.partido}`;
  $("#contador").textContent = `${i + 1} de ${PRESIDENTES.length}`;
  // la foto se crea de nuevo cada vez
  const foto = document.createElement("img");
  foto.id = "ficha-foto";
  foto.className = "foto grande";
  foto.src = p.foto;
  foto.alt = "Foto de " + p.nombre;
  $("#ficha-foto").replaceWith(foto);

  dibujarAnios(p);
  ponerRespaldoAFotos();
}


/* año a año: una fila por año y los hitos antes de su año
*/
function dibujarAnios(p) {
  const caja = $("#ficha-anios");

  // si no hay años, avisa
  if (!p.anios) {
    caja.innerHTML = `<p class="anios-pendiente">Estamos juntando los datos de este gobierno.</p>`;
    return;
  }

  const ultimo = p.anios[p.anios.length - 1].anio;
  const punto = (h) => `
    <div class="hito-punto">
      <div>
        <p><b>${h.fecha}</b> · <span class="hito-titulo">${h.texto}</span></p>
        ${h.detalle ? `<p class="hito-detalle">${h.detalle}</p>` : ""}
      </div>
    </div>`;

  // el carro parte lleno (1) y cada año pierde lo de la inflación
  let carro = 1;

  caja.innerHTML = p.anios.map((a, i) => {
    // hitos de este año, antes de su fila
    const hitos = (p.hitos || []).filter((h) => h.anio === a.anio).map(punto).join("");

    // sin encuesta: aviso en vez de torta
    const percepcion = a.aprueba == null
      ? `<p class="sin-encuesta">${a.nota || "No hubo encuesta CEP este año."}</p>`
      : torta(a);

    // carro antes y después de este año
    const antes = carro;
    if (IPC_DIC[a.anio] != null) carro = antes * alcanza(IPC_DIC[a.anio]);

    // gobiernos de 6 años: marca el 4to año
    const marca4 = (p.anios.length > 4 && i === 3)
      ? `<p class="nota-4anios">4.º año: hasta aquí llegan los gobiernos de 4 años.</p>` : "";

    return `
      ${hitos}
      <div class="fila-anio">
        <span class="anio-numero">${a.anio}</span>
        ${percepcion}
        <div class="celda-eje celda-economia">${economia(a.anio, antes, carro)}${marca4}</div>
        <div class="celda-eje celda-seguridad">${seguridad(a.anio)}</div>
      </div>`;
  }).join("")
  // hitos después del último año
  + (p.hitos || []).filter((h) => h.anio > ultimo).map(punto).join("")
  // resumen al final
  + resumenGobierno(p);

  // las filas aparecen al bajar
  caja.querySelectorAll(".fila-anio, .hito-punto").forEach((el) => vigilante.observe(el));
}


/* resumen: cómo quedó el carro al final del gobierno
*/
function resumenGobierno(p) {
  const anios = p.anios.map((a) => a.anio).filter((anio) => IPC_DIC[anio] != null);
  if (anios.length === 0) return "";

  // carro al final de una lista de años
  const carroAlFinal = (lista) => lista.reduce((f, anio) => f * alcanza(IPC_DIC[anio]), 1);

  const f = carroAlFinal(anios);
  const inflacionTotal = (1 / f - 1) * 100;                    // subida de precios en todo el gobierno
  const porAnio = Math.round((1 - f) * 100) / anios.length;    // promedio por año

  // gobiernos de 6 años: aviso
  let aviso = "";
  if (anios.length > 4) {
    const en4 = Math.round((1 - carroAlFinal(anios.slice(0, 4))) * 100);
    aviso = `<p class="resumen-aviso"><b>Ojo:</b> este gobierno duró ${anios.length} años y los demás 4.
      Con más años, los precios tienen más tiempo para subir, así que esta cifra le juega un poco en contra.
      Para comparar mejor, mira el promedio por año o sus primeros 4 años: <b>−${en4}% de carro</b>.</p>`;
  }

  return `
    <div class="fila-anio resumen-gobierno">
      <p class="resumen-titulo">Todo su gobierno<span>${anios[0]} – ${anios[anios.length - 1]}</span></p>
      <div class="celda-eje celda-economia">
        ${carroDelAnio(1, f, "En todos sus años de gobierno",
            [`Inflación de todo el gobierno: ${coma(inflacionTotal)}%`,
             `En promedio: −${coma(porAnio)}% de carro cada año`])}
        ${aviso}
      </div>
      <div class="celda-eje celda-seguridad"></div>
    </div>`;
}


/* seguridad: homicidios y robos
*/

/* celda de seguridad: pistola arriba, reloj abajo
*/
function seguridad(anio) {
  return homicidios(anio) + robos(anio);
}

/* homicidios: pistola con balas, o sin datos
*/
function homicidios(anio) {
  const tasa = HOMICIDIOS[anio];
  // años 90: solo aproximado
  const a90 = HOMICIDIOS_ANIOS90;
  if (tasa == null && anio >= a90.desde && anio <= a90.hasta) {
    return `<p class="sin-datos">Homicidios: sin dato exacto.<br>Aprox. ${a90.texto} personas asesinadas por cada 100.000 habitantes.</p>`;
  }
  if (tasa == null) return `<p class="sin-datos">Homicidios: sin datos</p>`;
  return pistolaConBalas(tasa);
}

/* robos: casos del año / 8760 horas = robos por hora
*/
function robos(anio) {
  const casos = ROBOS_VIOLENTOS[anio];
  if (casos == null) return `<p class="sin-datos">Robos violentos: sin datos</p>`;
  return reloj(casos / 8760);
}

/* reloj con una persona roja por cada robo en una hora
*/
function reloj(porHora) {
  const personas = Math.round(porHora);
  return `
    <div class="eco-item">
      <div class="reloj-personas" role="img" aria-label="${personas} robos violentos por hora">
        <img class="reloj" src="fotos/reloj.svg" alt="">
        <div class="personas">${'<img class="persona" src="fotos/persona.svg" alt="">'.repeat(personas)}</div>
      </div>
      <div>
        <p class="eco-num">${personas} por hora</p>
        <p class="eco-label">robos violentos en Chile</p>
        <p class="eco-detalle">Uno cada ${coma(60 / porHora)} minutos</p>
      </div>
    </div>`;
}

/* pistola con una bala por persona asesinada (cada 100.000). 4,5 = 4 balas y media
*/
function pistolaConBalas(tasa) {
  const balas = [];
  for (let i = 0; i < Math.ceil(tasa); i++) balas.push(dibujarBala(Math.min(1, tasa - i)));
  return `
    <div class="eco-item">
      <div class="pistola-balas" role="img" aria-label="${coma(tasa)} balas: ${coma(tasa)} personas asesinadas por cada 100.000 habitantes">
        <img class="pistola" src="fotos/pistola.png" alt="">
        <div class="balas">${balas.join("")}</div>
      </div>
      <div>
        <p class="eco-num">${coma(tasa)}</p>
        <p class="eco-label">personas asesinadas</p>
        <p class="eco-detalle">por cada 100.000 habitantes</p>
      </div>
    </div>`;
}

/* una bala, parte = cuánto se ve (1 entera, 0,5 media)
*/
function dibujarBala(parte) {
  return `<span class="bala" style="--parte:${parte}"><img src="fotos/bala.svg" alt=""></span>`;
}


/* economía: carro (inflación) y maleta (desempleo)
*/

// número con coma: 12.8 → "12,8"
const coma = (n, dec = 1) => n.toFixed(dec).replace(".", ",");

/* antes y despues = cuánto carro había antes y después del año (1 = lleno)
*/
function economia(anio, antes, despues) {
  const inflacion = IPC_DIC[anio];
  const desempleo = DESEMPLEO[anio];
  if (inflacion == null && desempleo == null) return "";

  const etiqueta = despues > antes
    ? "Este año los precios bajaron: un poco más de comida"
    : "Misma plata, menos comida";

  return `
    ${inflacion == null ? "" : carroDelAnio(antes, despues, etiqueta,
        [`Inflación del año: ${coma(inflacion)}%`,
         despues > antes ? "Este año no se perdió nada" : `En rojo, lo que se perdió en ${anio}`])}
    <div class="eco-item">
      ${maleta(desempleo)}
      <div>
        <p class="eco-num">${coma(desempleo)}%</p>
        <p class="eco-label">desempleo</p>
        <p class="eco-detalle">${Math.round(desempleo)} de cada 100 no encuentran trabajo</p>
      </div>
    </div>`;
}

/* cuánto del carro alcanza: 1 / (1 + inflación/100). 27,3% da 0,79
*/
const alcanza = (inflacion) => 1 / (1 + inflacion / 100);

/* carro con su número. el número es solo lo perdido ese año (la franja roja)
*/
function carroDelAnio(antes, despues, etiqueta, detalles) {
  const perdido = Math.round((1 - despues) * 100) - Math.round((1 - antes) * 100);
  return `
    <div class="eco-item">
      <div class="carros">${dibujarCarro(antes, despues)}</div>
      <div>
        <p class="eco-num ${perdido > 0 ? "pierde" : ""}">${perdido > 0 ? "−" + perdido : "+" + Math.abs(perdido)}% de carro</p>
        <p class="eco-label">${etiqueta}</p>
        ${detalles.map((d) => `<p class="eco-detalle">${d}</p>`).join("")}
      </div>
    </div>`;
}

/* esquinas del canasto en carro_super.png (600 x 494)
*/
const CANASTO = [[138, 111], [580, 132], [559, 278], [247, 324]];

// ancho del canasto a una altura y (para llenar por área)
function anchoEn(y) {
  const xs = [];
  for (let i = 0; i < CANASTO.length; i++) {
    const [x1, y1] = CANASTO[i], [x2, y2] = CANASTO[(i + 1) % CANASTO.length];
    if ((y - y1) * (y - y2) <= 0 && y1 !== y2) xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
  }
  return xs.length >= 2 ? Math.max(...xs) - Math.min(...xs) : 0;
}

// altura de la comida para llenar una parte (0 a 1) del canasto
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

// la comida, siempre igual
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

/* dibuja el carro: comida = lo que alcanza, rojo = lo perdido este año, vacío = lo perdido antes
*/
let idCarro = 0;
function dibujarCarro(antes, despues) {
  const id = "c" + idCarro++;
  const nivelAntes = nivelDeLlenado(Math.min(antes, 1));      // altura antes
  const nivelDespues = nivelDeLlenado(Math.min(despues, 1));  // altura después
  const rojo = nivelDespues > nivelAntes                       // en svg, más abajo = y más grande
    ? `<rect class="carro-falta" x="0" y="${nivelAntes}" width="600" height="${nivelDespues - nivelAntes}"/>`
    : "";
  return `
    <svg class="carro" viewBox="0 0 600 494" role="img" aria-label="Carro de súper: queda un ${Math.round(Math.min(despues, 1) * 100)}%">
      <defs>
        <clipPath id="${id}a"><polygon points="${CANASTO.join(" ")}"/></clipPath>
        <clipPath id="${id}b"><rect x="0" y="${nivelDespues}" width="600" height="494"/></clipPath>
      </defs>
      <g clip-path="url(#${id}a)">
        ${rojo}
        <g clip-path="url(#${id}b)">${comida()}</g>
      </g>
      <image href="fotos/carro_super.png" width="600" height="494"/>
    </svg>`;
}

/* ejemplo del carro: aylwin 1991
*/
function ponerEjemploCarro() {
  const antes = alcanza(IPC_DIC[1990]);
  const despues = antes * alcanza(IPC_DIC[1991]);
  $("#ejemplo-carro").innerHTML =
    `<p class="ejemplo-anio">Ejemplo: Aylwin, 1991 (su 2.º año)</p>` +
    carroDelAnio(antes, despues, "Misma plata, menos comida",
      [`Inflación del año: ${coma(IPC_DIC[1991])}%`, "En rojo, lo que se perdió en 1991"]);
}

/* ejemplo de las balas: 2005
*/
function ponerEjemploBalas() {
  $("#ejemplo-balas").innerHTML =
    `<p class="ejemplo-anio">Ejemplo: 2005</p>` + pistolaConBalas(HOMICIDIOS[2005]);
}

/* ejemplo del reloj: 2023
*/
function ponerEjemploReloj() {
  $("#ejemplo-reloj").innerHTML =
    `<p class="ejemplo-anio">Ejemplo: 2023</p>` + reloj(ROBOS_VIOLENTOS[2023] / 8760);
}

/* maleta: el css le corta el % de desempleo (--pct)
*/
function maleta(desempleo) {
  return `
    <div class="maleta" role="img" aria-label="Maleta a la que le falta un ${coma(desempleo)}%">
      <img src="fotos/bag_noun.svg" alt="" style="--pct:${desempleo}%">
    </div>`;
}


/* torta de aprobación, con los 3 números al centro
*/
function torta(a) {
  const otros = 100 - a.aprueba - a.desaprueba;
  const fin1 = a.aprueba;                 // aprueba: de 0 a fin1
  const fin2 = a.aprueba + a.desaprueba;  // desaprueba: de fin1 a fin2, el resto otros

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


/* al bajar (scroll)
*/

/* portada: cuánto bajaste (0 a 1), se lo pasa al css como --avance
*/
function animarPortada() {
  const intro = $(".intro");
  const recorrido = intro.offsetHeight - window.innerHeight;   // cuánto se puede bajar
  const avance = Math.min(1, Math.max(0, window.scrollY / recorrido));
  intro.style.setProperty("--avance", avance);
}

window.addEventListener("scroll", animarPortada);
window.addEventListener("resize", animarPortada);


/* vigilante: cuando algo aparece en pantalla le pone la clase visible
*/
const vigilante = new IntersectionObserver((cosas) => {
  cosas.forEach((cosa) => {
    if (cosa.isIntersecting) {
      cosa.target.classList.add("visible");
      vigilante.unobserve(cosa.target);   // ya apareció, deja de mirarlo
    }
  });
}, { threshold: 0.3 });   // cuando se ve el 30%

document.querySelectorAll(".historia, .presidentes, .dato-explicado").forEach((el) => vigilante.observe(el));


/* mueve las fotos de qué son al bajar 
*/
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


/* navegación
*/

// qué pantalla mostrar según la dirección (#aylwin...)
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

  // si es una sección del inicio, baja hasta ahí; si no, arriba
  const seccion = !p && id ? document.getElementById(id) : null;
  if (seccion) {
    seccion.scrollIntoView();
  } else {
    window.scrollTo(0, 0);
  }
  animarPortada();
}

// anterior (-1) o siguiente (+1)
function mover(paso) {
  const i = PRESIDENTES.findIndex((x) => "#" + x.id === location.hash);
  if (i === -1) return;
  const nuevo = (i + paso + PRESIDENTES.length) % PRESIDENTES.length;
  location.hash = PRESIDENTES[nuevo].id;
}

$("#anterior").addEventListener("click", () => mover(-1));
$("#siguiente").addEventListener("click", () => mover(+1));

// teclado: flechas y esc
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft")  mover(-1);
  if (e.key === "ArrowRight") mover(+1);
  if (e.key === "Escape")     location.hash = "presidentes";
});

window.addEventListener("hashchange", mostrar);


/* arrancar
*/
dibujarInicio();
ponerEjemploCarro();
ponerEjemploBalas();
ponerEjemploReloj();
mostrar();
