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


/* =====================================================================
   ECONOMÍA AÑO A AÑO (lo usan los carros y la mesa de cada ficha)
   ===================================================================== */

/* INFLACIÓN: variación del IPC de diciembre a diciembre (%).
   Fuente: Banco Central de Chile (BDE) e INE.
   - 2011–2025: BCCh, cuadro "IPC variación mensual y anual".
   - 1989–2010: índices del INE (oficios INE, Memorias del BCCh, MOP).
   Con esto también se calcula el CARRO: cuánto alcanzaban $50.000 cada año,
   tomando como referencia que hoy (2025) un carro lleno cuesta $200.000. */
const IPC_DIC = {
  1989: 21.4, 1990: 27.3, 1991: 18.7, 1992: 12.7, 1993: 12.2, 1994: 8.9,
  1995: 8.2,  1996: 6.6,  1997: 6.0,  1998: 4.7,  1999: 2.3,  2000: 4.5,
  2001: 2.6,  2002: 2.8,  2003: 1.1,  2004: 2.4,  2005: 3.7,  2006: 2.6,
  2007: 7.8,  2008: 7.1,  2009: -1.4, 2010: 3.0,  2011: 4.4,  2012: 1.5,
  2013: 3.0,  2014: 4.6,  2015: 4.4,  2016: 2.7,  2017: 2.3,  2018: 2.6,
  2019: 3.0,  2020: 3.0,  2021: 7.2,  2022: 12.8, 2023: 3.9,  2024: 4.5,
  2025: 3.5
};
const CARRO = { pesos: 50000, carroLlenoHoy: 200000, anioHoy: 2025 };

/* DESEMPLEO: tasa de desocupación, promedio del año (%).
   Fuente: Banco Central de Chile (BDE), con datos del INE.
   ⚠️ En 2010 el INE cambió su forma de medir: compara con cuidado
   los años antes de 2010 con los de después. */
const DESEMPLEO = {
  1990: 7.8,  1991: 8.2,  1992: 6.7,  1993: 6.5,  1994: 7.8,  1995: 7.4,
  1996: 6.5,  1997: 6.1,  1998: 6.2,  1999: 10.0, 2000: 9.7,  2001: 9.9,
  2002: 9.8,  2003: 9.5,  2004: 10.0, 2005: 9.3,  2006: 8.0,  2007: 7.0,
  2008: 7.8,  2009: 9.6,  2010: 8.4,  2011: 7.4,  2012: 6.6,  2013: 6.1,
  2014: 6.4,  2015: 6.4,  2016: 6.6,  2017: 6.9,  2018: 7.3,  2019: 7.2,
  2020: 10.6, 2021: 9.1,  2022: 7.8,  2023: 8.6,  2024: 8.5,  2025: 8.5
};


/* Los 8 gobiernos, en orden.
   foto: la imagen va en la carpeta fotos/ con ese nombre exacto.
   le_toco: tipo "mundial" (le pasó a todos los países) o "nacional" (solo a Chile).
   calza: AQUÍ VA SU LECTURA. Es el trasfondo del proyecto: escríbanlo ustedes.

   anios: una fila por año en la ficha. Aprobación = última encuesta CEP de ese año
          (si la encuesta empezó en diciembre y terminó en enero, cuenta para el año en que la CEP la fecha).
          "otros" no se escribe: se calcula solo (100 − aprueba − desaprueba).
          Si un año no hubo encuesta: { anio: 2020, nota: "..." } (sin aprueba ni desaprueba).
   hitos: aparecen como un punto ANTES de la fila de su "anio". */
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
    anios: [
      { anio: 1990, aprueba: 60, desaprueba: 15, encuesta: "CEP dic. 1990" },
      { anio: 1991, aprueba: 53, desaprueba: 17, encuesta: "CEP dic. 1991 – ene. 1992" },
      { anio: 1992, aprueba: 56, desaprueba: 17, encuesta: "CEP dic. 1992" },
      { anio: 1993, aprueba: 51, desaprueba: 19, encuesta: "CEP nov. 1993" }
    ],
    hitos: [
      { anio: 1990, fecha: "Mar. 1990", texto: "La vuelta a la democracia" }
    ],
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
    anios: [
      { anio: 1994, aprueba: 50, desaprueba: 24, encuesta: "CEP nov.–dic. 1994" },
      { anio: 1995, aprueba: 46, desaprueba: 27, encuesta: "CEP nov. 1995" },
      { anio: 1996, aprueba: 36, desaprueba: 34, encuesta: "CEP nov.–dic. 1996" },
      { anio: 1997, aprueba: 33, desaprueba: 37, encuesta: "CEP dic. 1997 – ene. 1998" },
      { anio: 1998, aprueba: 37, desaprueba: 36, encuesta: "CEP jun. 1998 (única del año)" },
      { anio: 1999, aprueba: 32, desaprueba: 40, encuesta: "CEP abr.–may. 1999 (de la de sep.–oct. solo se conoce el 28% de aprobación)" }
    ],
    hitos: [
      { anio: 1998, fecha: "1998 – 1999", texto: "Crisis asiática" }
    ],
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
    anios: [
      { anio: 2000, aprueba: 49, desaprueba: 26, encuesta: "CEP nov.–dic. 2000" },
      { anio: 2001, aprueba: 44, desaprueba: 31, encuesta: "CEP dic. 2001 – ene. 2002" },
      { anio: 2002, aprueba: 41, desaprueba: 30, encuesta: "CEP dic. 2002" },
      { anio: 2003, aprueba: 47, desaprueba: 24, encuesta: "CEP dic. 2003" },
      { anio: 2004, aprueba: 61, desaprueba: 18, encuesta: "CEP dic. 2004" },
      { anio: 2005, aprueba: 59, desaprueba: 23, encuesta: "CEP oct.–nov. 2005" }
    ],
    hitos: [
      { anio: 2004, fecha: "Desde 2004", texto: "Sube fuerte el precio del cobre" }
    ],
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
    anios: [
      { anio: 2006, aprueba: 52, desaprueba: 31, encuesta: "CEP dic. 2006" },
      { anio: 2007, aprueba: 39, desaprueba: 42, encuesta: "CEP nov.–dic. 2007" },
      { anio: 2008, aprueba: 43, desaprueba: 38, encuesta: "CEP nov.–dic. 2008" },
      { anio: 2009, aprueba: 78, desaprueba: 11, encuesta: "CEP oct. 2009" }
    ],
    hitos: [
      { anio: 2008, fecha: "2008", texto: "Boom crisis financiera mundial (07-09)" },
      { anio: 2010, fecha: "Feb. 2010",   texto: "Terremoto del 27F, a días de irse" }
    ],
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
    anios: [
      { anio: 2010, aprueba: 44, desaprueba: 34, encuesta: "CEP nov.–dic. 2010" },
      { anio: 2011, aprueba: 23, desaprueba: 62, encuesta: "CEP nov.–dic. 2011" },
      { anio: 2012, aprueba: 31, desaprueba: 51, encuesta: "CEP nov.–dic. 2012" },
      { anio: 2013, aprueba: 34, desaprueba: 46, encuesta: "CEP sep.–oct. 2013" }
    ],
    hitos: [
      { anio: 2010, fecha: "2010", texto: "Reconstruir el país tras el 27F" }
    ],
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
    anios: [
      { anio: 2014, aprueba: 38, desaprueba: 43, encuesta: "CEP oct.–nov. 2014" },
      { anio: 2015, aprueba: 24, desaprueba: 58, encuesta: "CEP nov.–dic. 2015" },
      { anio: 2016, aprueba: 20, desaprueba: 60, encuesta: "CEP nov.–dic. 2016" },
      { anio: 2017, aprueba: 23, desaprueba: 53, encuesta: "CEP sep.–oct. 2017" }
    ],
    hitos: [
      { anio: 2014, fecha: "Desde 2014", texto: "Baja el precio del cobre" },
      { anio: 2014, fecha: "Abr. 2014",  texto: "Terremoto de Iquique" },
      { anio: 2015, fecha: "Sep. 2015",  texto: "Terremoto de Illapel" }
    ],
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
    anios: [
      { anio: 2018, aprueba: 37, desaprueba: 39, encuesta: "CEP oct.–nov. 2018" },
      { anio: 2019, aprueba: 6,  desaprueba: 82, encuesta: "CEP dic. 2019 (terreno hasta ene. 2020)" },
      { anio: 2020, nota: "No hubo encuesta CEP en 2020." },
      { anio: 2021, aprueba: 16, desaprueba: 68, encuesta: "CEP jul.–sep. 2021" }
    ],
    hitos: [
      { anio: 2019, fecha: "Oct. 2019",   texto: "Estallido social" },
      { anio: 2020, fecha: "2020 – 2021", texto: "Pandemia COVID-19" }
    ],
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
    anios: [
      { anio: 2022, aprueba: 24, desaprueba: 61, encuesta: "CEP nov–dic 2022" },
      { anio: 2023, aprueba: 26, desaprueba: 61, encuesta: "CEP sep–oct 2023" },
      { anio: 2024, aprueba: 30, desaprueba: 54, encuesta: "CEP sep–oct 2024" },
      { anio: 2025, aprueba: 28, desaprueba: 62, encuesta: "CEP sep–oct 2025" }
    ],
    hitos: [
      { anio: 2022, fecha: "2022",      texto: "Inflación en todo el mundo tras la pandemia" },
      { anio: 2024, fecha: "Feb. 2024", texto: "Megaincendio de Viña del Mar" }
    ],
    calza: ""
  }
];
