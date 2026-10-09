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

  ponerRespaldoAFotos();
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

document.querySelectorAll(".historia, .presidentes").forEach((el) => vigilante.observe(el));


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

  // Si vuelves desde una ficha (#presidentes), saltamos directo a la lista
  // para no tener que bajar toda la historia de nuevo. Si no, arriba de todo.
  if (id === "presidentes") {
    $("#presidentes").scrollIntoView();
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
