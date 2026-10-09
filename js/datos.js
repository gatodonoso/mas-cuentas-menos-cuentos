/* =====================================================================
   DATOS DEL PROYECTO
   ---------------------------------------------------------------------
   Este archivo SOLO guarda información. No dibuja nada.
   Si quieren cambiar un número, un texto o agregar un hito, se hace aquí.

   Fuentes:
   - Inflación, desempleo, crecimiento y homicidios: Banco Mundial (WDI).
     "recibio" = último año del gobierno anterior.
     "entrego" = último año completo del propio gobierno.
     null = no hay dato.
   - Aprobación: encuesta CEP (al final del 1er año y al final del mandato).
   - Congreso: ver lámina "¿Tenía mayoría en el Congreso?" del PPT.
   ===================================================================== */


/* Los temas que se comparan.
   mejor: "bajo" → que el número baje es bueno (inflación, desempleo...)
          "alto" → que el número suba es bueno (crecimiento)            */
const INDICADORES = [
  { clave: "inflacion",   nombre: "Inflación",   pregunta: "¿Cuánto subían los precios?",       unidad: "%",          mejor: "bajo" },
  { clave: "desempleo",   nombre: "Desempleo",   pregunta: "¿Cuántos estaban sin pega?",        unidad: "%",          mejor: "bajo" },
  { clave: "crecimiento", nombre: "Crecimiento", pregunta: "¿Cuánto creció la economía?",       unidad: "%",          mejor: "alto" },
  { clave: "homicidios",  nombre: "Homicidios",  pregunta: "¿Cuántos homicidios había?",        unidad: " por 100 mil", mejor: "bajo" }
];


/* Los 8 gobiernos, en orden.
   foto: la imagen va en la carpeta fotos/ con ese nombre exacto.
   le_toco: tipo "mundial" (le pasó a todos los países) o "nacional" (solo a Chile).
   calza: AQUÍ VA SU LECTURA. Es el trasfondo del proyecto: escríbanlo ustedes. */
const PRESIDENTES = [
  {
    id: "aylwin", nombre: "Patricio Aylwin", periodo: "1990 – 1994", partido: "PDC",
    foto: "fotos/presidentes/aylwin.jpg",
    le_toco: [
      { texto: "La vuelta a la democracia", tipo: "nacional" }
    ],
    congreso: { camara: true, senado: false, nota: "senadores designados" },
    indicadores: {
      inflacion:   { recibio: 17.0, entrego: 12.7, anioR: 1989, anioE: 1993 },
      desempleo:   { recibio: 5.2,  entrego: 4.5,  anioR: 1991, anioE: 1993 },
      crecimiento: { recibio: 10.4, entrego: 6.7,  anioR: 1989, anioE: 1993 },
      homicidios:  { recibio: null, entrego: null, anioR: 1989, anioE: 1993 }
    },
    aprobacion: { primer: 60, final: 49 },
    calza: ""
  },
  {
    id: "frei", nombre: "Eduardo Frei", periodo: "1994 – 2000", partido: "PDC",
    foto: "fotos/presidentes/frei.jpg",
    le_toco: [
      { texto: "Crisis asiática (1998 – 1999)", tipo: "mundial" }
    ],
    congreso: { camara: true, senado: false, nota: "senadores designados" },
    indicadores: {
      inflacion:   { recibio: 12.7, entrego: 3.3,  anioR: 1993, anioE: 1999 },
      desempleo:   { recibio: 4.5,  entrego: 11.2, anioR: 1993, anioE: 1999 },
      crecimiento: { recibio: 6.7,  entrego: -0.3, anioR: 1993, anioE: 1999 },
      homicidios:  { recibio: null, entrego: null, anioR: 1993, anioE: 1999 }
    },
    aprobacion: { primer: 49, final: 28 },
    calza: ""
  },
  {
    id: "lagos", nombre: "Ricardo Lagos", periodo: "2000 – 2006", partido: "PPD",
    foto: "fotos/presidentes/lagos.jpg",
    le_toco: [
      { texto: "Sube fuerte el precio del cobre (desde 2004)", tipo: "mundial" }
    ],
    congreso: { camara: true, senado: false, nota: "senadores designados" },
    indicadores: {
      inflacion:   { recibio: 3.3,  entrego: 3.1, anioR: 1999, anioE: 2005 },
      desempleo:   { recibio: 11.2, entrego: 9.3, anioR: 1999, anioE: 2005 },
      crecimiento: { recibio: -0.3, entrego: 5.8, anioR: 1999, anioE: 2005 },
      homicidios:  { recibio: null, entrego: 3.5, anioR: 1999, anioE: 2005 }
    },
    aprobacion: { primer: 49, final: 59 },
    calza: ""
  },
  {
    id: "bachelet1", nombre: "Michelle Bachelet", periodo: "2006 – 2010", partido: "PS",
    foto: "fotos/presidentes/bachelet1.jpg",
    le_toco: [
      { texto: "Crisis financiera mundial (2008 – 2009)", tipo: "mundial" },
      { texto: "Terremoto del 27F (feb. 2010, a días de irse)", tipo: "nacional" }
    ],
    congreso: { camara: true, senado: true, nota: "primera vez desde 1990" },
    indicadores: {
      inflacion:   { recibio: 3.1, entrego: 0.4,  anioR: 2005, anioE: 2009 },
      desempleo:   { recibio: 9.3, entrego: 11.3, anioR: 2005, anioE: 2009 },
      crecimiento: { recibio: 5.8, entrego: -1.1, anioR: 2005, anioE: 2009 },
      homicidios:  { recibio: 3.5, entrego: 3.7,  anioR: 2005, anioE: 2009 }
    },
    aprobacion: { primer: 50, final: 78 },
    calza: ""
  },
  {
    id: "pinera1", nombre: "Sebastián Piñera", periodo: "2010 – 2014", partido: "RN",
    foto: "fotos/presidentes/pinera1.jpg",
    le_toco: [
      { texto: "Reconstruir el país tras el 27F", tipo: "nacional" }
    ],
    congreso: { camara: false, senado: false, nota: "" },
    indicadores: {
      inflacion:   { recibio: 0.4,  entrego: 1.8, anioR: 2009, anioE: 2013 },
      desempleo:   { recibio: 11.3, entrego: 6.4, anioR: 2009, anioE: 2013 },
      crecimiento: { recibio: -1.1, entrego: 3.3, anioR: 2009, anioE: 2013 },
      homicidios:  { recibio: 3.7,  entrego: 3.1, anioR: 2009, anioE: 2013 }
    },
    aprobacion: { primer: 44, final: 35 },
    calza: ""
  },
  {
    id: "bachelet2", nombre: "Michelle Bachelet", periodo: "2014 – 2018", partido: "PS",
    foto: "fotos/presidentes/bachelet2.jpg",
    le_toco: [
      { texto: "Baja el precio del cobre (desde 2014)", tipo: "mundial" },
      { texto: "Terremotos de Iquique (2014) e Illapel (2015)", tipo: "nacional" }
    ],
    congreso: { camara: true, senado: true, nota: "" },
    indicadores: {
      inflacion:   { recibio: 1.8, entrego: 2.2, anioR: 2013, anioE: 2017 },
      desempleo:   { recibio: 6.4, entrego: 7.3, anioR: 2013, anioE: 2017 },
      crecimiento: { recibio: 3.3, entrego: 1.4, anioR: 2013, anioE: 2017 },
      homicidios:  { recibio: 3.1, entrego: 4.2, anioR: 2013, anioE: 2017 }
    },
    aprobacion: { primer: 38, final: 23 },
    calza: ""
  },
  {
    id: "pinera2", nombre: "Sebastián Piñera", periodo: "2018 – 2022", partido: "RN",
    foto: "fotos/presidentes/pinera2.jpg",
    le_toco: [
      { texto: "Estallido social (oct. 2019)", tipo: "nacional" },
      { texto: "Pandemia COVID-19 (2020 – 2021)", tipo: "mundial" }
    ],
    congreso: { camara: false, senado: false, nota: "" },
    indicadores: {
      inflacion:   { recibio: 2.2, entrego: 4.5,  anioR: 2017, anioE: 2021 },
      desempleo:   { recibio: 7.3, entrego: 9.3,  anioR: 2017, anioE: 2021 },
      crecimiento: { recibio: 1.4, entrego: 11.3, anioR: 2017, anioE: 2021 },
      homicidios:  { recibio: 4.2, entrego: 4.7,  anioR: 2017, anioE: 2021 }
    },
    aprobacion: { primer: 37, final: 16 },
    calza: ""
  },
  {
    id: "boric", nombre: "Gabriel Boric", periodo: "2022 – 2026", partido: "CS",
    foto: "fotos/presidentes/boric.jpg",
    le_toco: [
      { texto: "Inflación en todo el mundo tras la pandemia (2022)", tipo: "mundial" },
      { texto: "Megaincendio de Viña del Mar (feb. 2024)", tipo: "nacional" }
    ],
    congreso: { camara: false, senado: false, nota: "" },
    indicadores: {
      inflacion:   { recibio: 4.5, entrego: 4.2, anioR: 2021, anioE: 2025 },
      desempleo:   { recibio: 9.3, entrego: 9.0, anioR: 2021, anioE: 2025 },
      crecimiento: { recibio: 11.3, entrego: 2.5, anioR: 2021, anioE: 2025 },
      homicidios:  { recibio: 4.7, entrego: 6.3, anioR: 2021, anioE: 2023 }
    },
    aprobacion: { primer: 24, final: 28 },
    calza: ""
  }
];
