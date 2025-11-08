// =================================================================
// js/report_engine.js | CONSOLIDACIÓN Y REVISIÓN FINAL
// =================================================================

// -----------------------------------------------------------------
// 1. CONSTANTES Y CONFIGURACIÓN (RUTAS, RANGOS Y REGLAS DE ANÁLISIS)
// -----------------------------------------------------------------

const DANE_COLEGIO = '308001001251'; 

// --- Rutas Estáticas ---
const ARCHIVO_ICFES = `${DANE_COLEGIO}_icfes.json`;

const ARCHIVOS_SIMULACROS = {
    'Gamma_10': `${DANE_COLEGIO}_Gamma_10.json`,
    'Epsilon_10': `${DANE_COLEGIO}_Epsilon_10.json`,
    'Dzeta_10': `${DANE_COLEGIO}_Dzeta_10.json`
};

const ARCHIVOS_MATRICES = {
    'Matemáticas': 'Matriz_mat.json',
    'Lectura Crítica': 'Matriz_lectura.json',
    'Ciencias Naturales': 'Matriz_Nat.json',
    'Sociales y Ciudadanas': 'Matriz_soc.json',
    'Inglés': 'Matriz_ing.json'
};

const ARCHIVOS_DETALLE_CSV = [
    '10-A-JM-2-05 DZETA 10 SABER.csv',
    '10-C-JM-2-05 DZETA 10 SABER.csv',
    // Otros CSV del simulacro reciente si existen
];


// --- RANGOS DE DESEMPEÑO (Rangos_Pruebas.json) ---
const RANGOS_DESEMPENIO = {
    "niveles_global": [
        {"nombre": "Insuficiente", "id": 1, "color": "red", "min": 0, "max": 250},
        {"nombre": "Mínimo", "id": 2, "color": "gold", "min": 251, "max": 300},
        {"nombre": "Satisfactorio", "id": 3, "color": "deepskyblue", "min": 301, "max": 400},
        {"nombre": "Avanzado", "id": 4, "color": "olivedrab", "min": 401, "max": 500}
    ],
    "niveles_areas_estandar": [
        {"nombre": "Insuficiente", "id": 1, "color": "red", "min": 0, "max": 39},
        {"nombre": "Mínimo", "id": 2, "color": "gold", "min": 40, "max": 55},
        {"nombre": "Satisfactorio", "id": 3, "color": "deepskyblue", "min": 56, "max": 75},
        {"nombre": "Avanzado", "id": 4, "color": "olivedrab", "min": 76, "max": 100}
    ],
    "niveles_ingles": [
        {"nombre": "A-", "id": 1, "color": "red", "min": 0, "max": 45},
        {"nombre": "A1", "id": 2, "color": "gold", "min": 46, "max": 55},
        {"nombre": "A2", "id": 3, "color": "deepskyblue", "min": 56, "max": 65},
        {"nombre": "B1", "id": 4, "color": "olivedrab", "min": 66, "max": 75},
        {"nombre": "B+", "id": 5, "color": "olivedrab", "min": 76, "max": 100}
    ],
    "areas_mapeo": {
        "PUNTAJE": "niveles_global",
        "LECTURA CRÍTICA": "niveles_areas_estandar",
        "CIENCIAS NATURALES": "niveles_areas_estandar",
        "MATEMÁTICAS": "niveles_areas_estandar",
        "SOCIALES Y CIUDADANAS": "niveles_areas_estandar",
        "INGLÉS": "niveles_ingles"
    }
};

const UMBRALES_ANALISIS = {
    FUERTE: 0.65, // > 65% de acierto
    MEDIO: 0.45,  // 45% a 65%
    DEBIL: 0.00   // < 45% (Necesita Refuerzo)
};

const CATALOGO_SUGERENCIAS_DCE = {
    // [Aquí iría todo el contenido de las sugerencias detalladas del Paso 26]
    "Matemáticas": [
        {
            "afirmacion_clave": "Interpretación y representación", 
            "sugerencias": [
                "**Foco DCE: Evidencias 1.1 y 1.2.** Implementar el uso constante de diferentes formatos (tablas, gráficas de dispersión, diagramas de caja) para representar el mismo conjunto de datos, enfatizando la justificación de la transformación.",
                "Realizar ejercicios de 'traducción' de lenguaje natural (enunciado de un problema) a lenguaje matemático (ecuaciones, fórmulas) y viceversa, fortaleciendo la comprensión inicial del problema.",
                "Promover la lectura detallada de infografías complejas y reportes estadísticos para identificar datos relevantes y distinguir entre información principal y secundaria."
            ]
        },
        {
            "afirmacion_clave": "Formulación y ejecución",
            "sugerencias": [
                "**Foco DCE: Evidencias 2.1, 2.2 y 2.3.** Diseñar actividades donde el estudiante deba justificar por qué eligió un modelo o plan específico (algebraico, geométrico, estadístico) antes de resolverlo (énfasis en la formulación, no solo en la ejecución).",
                "Fomentar la descomposición de problemas complejos en subproblemas más pequeños, asegurando la trazabilidad de los pasos y el uso de procedimientos conocidos (ejecución).",
                "Incorporar escenarios de 'prueba y error' y análisis de casos fallidos, incentivando la reflexión sobre por qué una estrategia inicial no fue adecuada."
            ]
        },
        {
            "afirmacion_clave": "Argumentación",
            "sugerencias": [
                "**Foco DCE: Evidencias 3.1, 3.2 y 3.3.** Crear escenarios de debate donde se presenten dos o más soluciones válidas (o inválidas) y se exija al estudiante defender la validez de un procedimiento o refutar una conclusión usando principios matemáticos.",
                "Solicitar a los estudiantes 'demostraciones informales' de por qué ciertos teoremas o fórmulas se aplican en el contexto de un problema específico (uso de criterios y validez).",
                "Entrenar la escritura de justificaciones claras y coherentes, utilizando conectores lógicos para enlazar premisas y conclusiones."
            ]
        }
    ],
    "Lectura Crítica": [
        {
            "afirmacion_clave": "IDENTIFICAR Y ENTENDER", 
            "sugerencias": [
                "**Foco DCE: Comprensión Local.** Realizar micro-lecturas enfocadas en la identificación de conectores lógicos y de sentido. Entrenar el reconocimiento de las referencias pronominales y léxicas dentro de oraciones complejas.",
                "Utilizar ejercicios de completación de párrafos o reordenamiento de oraciones para solidificar la cohesión local.",
                "Practicar la diferenciación de voces en textos narrativos o dialógicos, preguntando explícitamente quién dice qué y en qué contexto."
            ]
        },
        {
            "afirmacion_clave": "COMPRENDER CÓMO SE ARTICULAN", 
            "sugerencias": [
                "**Foco DCE: Comprensión Global.** Diseñar tareas que obliguen al estudiante a formular la tesis central del texto y a identificar los argumentos de apoyo y contra-argumentos, estructurando el texto globalmente.",
                "Usar textos discontinuos (mapas, tablas, cómics) y pedir la articulación de la información visual y verbal en un sentido único.",
                "Entrenar la inferencia del título o de la estructura del texto si estos han sido eliminados o alterados."
            ]
        },
        {
            "afirmacion_clave": "REFLEXIONAR A PARTIR DE UN TEXTO", 
            "sugerencias": [
                "**Foco DCE: Evaluación y Reflexión.** Presentar textos con sesgos o falacias lógicas evidentes y guiar la discusión para que los estudiantes evalúen la solidez de los argumentos presentados.",
                "Asignar la tarea de investigar el contexto de producción (autor, fecha, audiencia) de textos para entender la intencionalidad ideológica o argumentativa subyacente.",
                "Fomentar la escritura de reseñas críticas donde se juzgue la pertinencia de las fuentes citadas y la validez de la conclusión del autor."
            ]
        }
    ],
    "Sociales y Ciudadanas": [
        {
            "afirmacion_clave": "Contextualiza y evalúa usos de fuentes", 
            "sugerencias": [
                "**Foco DCE: Interpretación y Pensamiento Social.** Presentar fuentes primarias y secundarias (cartas, discursos, leyes) y exigir la ubicación precisa en tiempo y espacio (localización cronológica y geográfica).",
                "Desarrollar talleres sobre el uso crítico de evidencias históricas, enseñando a distinguir hechos de opiniones y la intencionalidad del autor de la fuente.",
                "Realizar ejercicios de contraste de narrativas históricas sobre un mismo evento, evaluando la objetividad y el rigor de las fuentes."
            ]
        },
        {
            "afirmacion_clave": "Comprende dimensiones espaciales y temporales", 
            "sugerencias": [
                "**Foco DCE: Pensamiento Sistémico.** Emplear estudios de caso que ilustren cómo los problemas sociales (ej. pobreza, conflicto) tienen dimensiones históricas, geográficas, políticas y económicas interconectadas.",
                "Fomentar el análisis de la legislación colombiana (Constitución, leyes) para entender la estructura del Estado (ramas del poder, organismos de control) y los mecanismos de participación ciudadana.",
                "Crear diagramas de causalidad que muestren cómo la toma de decisiones en una dimensión (ej., política) afecta las otras dimensiones (ej., económica o ambiental)."
            ]
        },
        {
            "afirmacion_clave": "Comprende modelos conceptuales, sus características y contextos de aplicación", 
            "sugerencias": [
                "**Foco DCE: Perspectiva y Multidimensionalidad.** Implementar simulaciones de dilemas éticos y políticos, asignando diferentes roles sociales a los estudiantes para que argumenten desde perspectivas diversas (ej., empresario, activista, funcionario público).",
                "Analizar modelos económicos (capitalismo, socialismo) o políticos (democracia, autoritarismo), identificando sus características centrales y sus implicaciones prácticas en Colombia y el mundo.",
                "Promover el debate sobre temas controversiales, exigiendo el reconocimiento de las diferentes cosmovisiones e ideologías que influyen en las posturas."
            ]
        }
    ],
    "Ciencias Naturales": [
        {
            "afirmacion_clave": "USO COMPRENSIVO DEL CONOCIMIENTO", 
            "sugerencias": [
                "**Foco DCE: Procesos de Explicación.** Fomentar la aplicación de conceptos científicos (ej. leyes de Newton, termodinámica, genética) para explicar fenómenos cotidianos, trascendiendo la simple memorización.",
                "Diseñar actividades donde se deba predecir el comportamiento de un sistema (físico, químico o biológico) si se alteran ciertas variables, usando modelos conceptuales.",
                "Reforzar el entendimiento de las propiedades y la estructura de la materia, haciendo énfasis en las transformaciones químicas y los procesos biológicos que las utilizan."
            ]
        },
        {
            "afirmacion_clave": "INDAGACIÓN", 
            "sugerencias": [
                "**Foco DCE: Habilidades Científicas.** Presentar experimentos fallidos o datos incompletos y solicitar a los estudiantes que formulen preguntas de investigación válidas y propongan variables de control/medición.",
                "Desarrollar el análisis crítico de la metodología: evaluar si los datos presentados en un estudio son suficientes y pertinentes para soportar las conclusiones derivadas (válido para Física, Química y Biología).",
                "Practicar la interpretación de gráficos y tablas de resultados experimentales, enfocándose en la identificación de patrones y la relación entre las variables."
            ]
        },
        {
            "afirmacion_clave": "EXPLICACIÓN DE FENÓMENOS", 
            "sugerencias": [
                "**Foco DCE: Razonamiento Causa-Efecto.** Asignar la tarea de construir narrativas científicas que expliquen cómo ocurren ciertos fenómenos (ej. el ciclo del agua, la propagación de una onda, el equilibrio químico) utilizando modelos y leyes científicas.",
                "Enfatizar la conexión Ciencia, Tecnología y Sociedad (CTS): analizar el impacto de tecnologías específicas (ej., plásticos, antibióticos) en el entorno y la salud, y evaluar el potencial de nuevos recursos o artefactos.",
                "Promover la construcción de modelos (físicos o diagramáticos) para ilustrar la dinámica de sistemas complejos (ej., ecosistemas, circuitos eléctricos)."
            ]
        }
    ],
    "Inglés": [
        {
            "afirmacion_clave": "LINGÜÍSTICA", 
            "sugerencias": [
                "**Foco DCE: Gramática y Vocabulario en Contexto.** Realizar ejercicios de completación de textos o cloze tests (Partes 3 y 4 del ICFES) para reforzar el uso correcto de tiempos verbales, preposiciones y conectores.",
                "Utilizar flashcards contextualizadas para vocabulario. En lugar de traducir, practicar el uso de la palabra en frases y situaciones comunicativas reales (sociolingüística).",
                "Practicar la identificación de errores comunes de gramática en textos escritos y la corrección posterior."
            ]
        },
        {
            "afirmacion_clave": "PRAGMÁTICA", 
            "sugerencias": [
                "**Foco DCE: Función Comunicativa.** Emplear tareas de lectura rápida (skimming y scanning) para identificar el propósito comunicativo del texto (informar, persuadir, instruir).",
                "Trabajar con fragmentos de textos donde se deben inferir el significado de palabras desconocidas a partir del contexto general.",
                "Realizar ejercicios de deducción: identificar información implícita y hacer inferencias sobre el contenido o el estado de ánimo del autor/personaje."
            ]
        },
        {
            "afirmacion_clave": "SOCIOLINGÜÍSTICO", 
            "sugerencias": [
                "**Foco DCE: Adecuación y Contexto.** Presentar diálogos o textos que ocurren en diferentes contextos sociales (formal, informal, académico) y pedir la identificación de la adecuación del lenguaje (registro).",
                "Usar ejemplos de modismos y frases hechas para que los estudiantes comprendan que el significado no siempre es literal.",
                "Practicar la selección de respuestas adecuadas en situaciones comunicativas específicas (Partes 1 y 2 del ICFES) para evaluar la comprensión del contexto social."
            ]
        }
    ]
};


// -----------------------------------------------------------------
// 2. FUNCIONES DE UTILIDAD MATEMÁTICA
// -----------------------------------------------------------------

function calcularPromedio(arr) {
    if (arr.length === 0) return 0;
    const numArr = arr.filter(n => typeof n === 'number' && !isNaN(n));
    if (numArr.length === 0) return 0;
    return numArr.reduce((a, b) => a + b, 0) / numArr.length;
}

function calcularDesviacionEstandar(arr, promedio) {
    if (arr.length <= 1) return 0;
    const numArr = arr.filter(n => typeof n === 'number' && !isNaN(n));
    if (numArr.length <= 1) return 0;
    
    const squareDiffs = numArr.map(value => Math.pow(value - promedio, 2));
    const avgSquareDiff = calcularPromedio(squareDiffs);
    return Math.sqrt(avgSquareDiff);
}

function calcularZScore(promedioActual, promedioHistorico, desviacionHistorica) {
    promedioActual = parseFloat(promedioActual);
    promedioHistorico = parseFloat(promedioHistorico);
    desviacionHistorica = parseFloat(desviacionHistorica);
    
    if (isNaN(desviacionHistorica) || desviacionHistorica === 0) return 0;
    return (promedioActual - promedioHistorico) / desviacionHistorica;
}

function clasificarNivel(puntaje, tipo) {
    const rangos = RANGOS_DESEMPENIO[tipo];
    if (!rangos) return "N.D.";
    
    for (const rango of rangos) {
        if (puntaje >= rango.min && puntaje <= rango.max) {
            return rango.nombre;
        }
    }
    return "N.D.";
}


// -----------------------------------------------------------------
// 3. FUNCIONES DE INGESTA DE DATOS (FETCH y PARSEO)
// -----------------------------------------------------------------

async function cargarJSON(ruta) {
    const response = await fetch(ruta);
    if (!response.ok) {
        throw new Error(`Error al cargar el archivo JSON: ${ruta}`);
    }
    return response.json();
}

async function cargarConsolidadoCSV(rutas) {
    let datosConsolidados = [];
    
    for (const ruta of rutas) {
        const response = await fetch(ruta);
        if (!response.ok) {
            console.warn(`CSV no encontrado o inaccesible: ${ruta}`);
            continue; 
        }
        const text = await response.text();
        
        const rows = text.split('\n').map(row => row.trim()).filter(row => row.length > 0);
        if (rows.length === 0) continue;
        
        const delimiter = rows[0].includes(';') ? ';' : ','; 
        
        const headers = rows[0].split(delimiter).map(h => h.trim().replace(/"/g, '').replace(/\(.*\)/g, ''));
        
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i].split(delimiter).map(v => v.trim().replace(/"/g, ''));
            const rowObject = {};

            if (values.length === headers.length) {
                headers.forEach((header, index) => {
                    let value = values[index];
                    rowObject[header] = isNaN(parseFloat(value)) ? value : parseFloat(value);
                });
                datosConsolidados.push(rowObject);
            }
        }
    }

    return datosConsolidados;
}


// -----------------------------------------------------------------
// 4. LÓGICA DE CÁLCULO Y COMPARACIÓN
// -----------------------------------------------------------------

/**
 * Calcula la distribución de estudiantes en los niveles de desempeño Global y por Área.
 */
function calcularDistribucionNiveles(detalleCSV) { 
    const distribucion = { Global: { Total: 0 }, Areas: {} };
    
    // Inicialización Global
    RANGOS_DESEMPENIO.niveles_global.forEach(r => { distribucion.Global[r.nombre] = 0; });

    detalleCSV.forEach(estudiante => {
        // CLASIFICACIÓN GLOBAL
        const puntajeGlobal = estudiante.PUNTAJE;
        if (!isNaN(puntajeGlobal)) {
            const nivelGlobal = clasificarNivel(puntajeGlobal, 'niveles_global');
            if (nivelGlobal !== "N.D.") distribucion.Global[nivelGlobal]++;
            distribucion.Global.Total++;
        }

        // CLASIFICACIÓN POR ÁREA
        for (const area in RANGOS_DESEMPENIO.areas_mapeo) {
            const puntajeArea = estudiante[area];
            if (area === 'PUNTAJE' || isNaN(puntajeArea)) continue; 

            if (!distribucion.Areas[area]) {
                distribucion.Areas[area] = { Total: 0 };
                const tipoRango = RANGOS_DESEMPENIO.areas_mapeo[area];
                RANGOS_DESEMPENIO[tipoRango].forEach(r => { distribucion.Areas[area][r.nombre] = 0; });
            }
            
            const nivelArea = clasificarNivel(puntajeArea, RANGOS_DESEMPENIO.areas_mapeo[area]);
            if (nivelArea !== "N.D.") distribucion.Areas[area][nivelArea]++;
            distribucion.Areas[area].Total++;
        }
    });

    // CONVERTIR CONTEOS A PORCENTAJES
    function convertirAporcentaje(dist, total) {
        const resultado = {};
        for (const key in dist) {
            if (key !== 'Total') {
                resultado[key] = total > 0 ? ((dist[key] / total) * 100).toFixed(1) : 0;
            } else {
                resultado[key] = total;
            }
        }
        return resultado;
    }

    const distFinal = {
        Global: convertirAporcentaje(distribucion.Global, distribucion.Global.Total),
        Areas: {}
    };

    for (const area in distribucion.Areas) {
        distFinal.Areas[area] = convertirAporcentaje(distribucion.Areas[area], distribucion.Areas[area].Total);
    }
    
    return distFinal;
}

/**
 * Genera el análisis detallado por área, comparando rendimiento, brechas y asignando sugerencias (Paso 25)
 */
function generarAnalisisPorArea(reporteFinal) {
    const { resultadosSimulacros, matricesDCE, nivelesPorArea, historicoICFES } = reporteFinal;
    const analisisResultados = {};
    const simulacroRecienteData = resultadosSimulacros[reporteFinal.metadata.simulacroReciente];

    const areas = Object.keys(matricesDCE);

    areas.forEach(area => {
        const areaSimulacroData = simulacroRecienteData.Resultados_Areas.find(a => a.Area === area);
        
        const areaKeyHist = area.replace(/\s/g, '_'); 
        const areaHistoricaData = historicoICFES.Areas_Detalle[areaKeyHist];

        if (!areaSimulacroData || !areaHistoricaData) {
            console.warn(`Datos insuficientes para el área: ${area}. Saltando análisis detallado.`);
            return;
        }

        const comparativaCompetencias = [];
        const rendimientoCompetenciasSim = areaSimulacroData.Rendimiento_Competencias;
        
        const claveAfirmacionesHist = Object.keys(areaHistoricaData).find(k => k.includes('Afirmacion'));
        const rendimientoHistoricoAfirmaciones = areaHistoricaData[claveAfirmacionesHist] || [];

        rendimientoCompetenciasSim.forEach(compSim => {
            const aciertoSim = parseFloat(compSim.Porcentaje_Acierto.replace('%', '')) / 100;
            const nombreComp = compSim.Nombre_Competencia;

            // --- 1. Mapeo a la Afirmación Histórica (JSON 2) ---
            const histItem = rendimientoHistoricoAfirmaciones.find(item => 
                nombreComp.toUpperCase().includes(item.Aprendizaje_Afirmacion.substring(0, 10).toUpperCase()) ||
                item.Aprendizaje_Afirmacion.toUpperCase().includes(nombreComp.substring(0, 10).toUpperCase())
            );

            let aciertoHist = 0;
            if (histItem && histItem.Porcentaje_EE !== 'N.D.') {
                const incorrectoHist = parseFloat(histItem.Porcentaje_EE.replace('%', '')) / 100;
                aciertoHist = 1 - incorrectoHist;
            }

            // --- 2. Diagnóstico y Sugerencias (Reglas de la "IA") ---
            let diagnostico = '';
            let sugerenciasAsociadas = [];
            
            if (aciertoSim > UMBRALES_ANALISIS.FUERTE) {
                diagnostico = 'Fortaleza Consolidada';
            } else if (aciertoSim >= UMBRALES_ANALISIS.MEDIO) {
                diagnostico = 'Nivel de Consolidación';
            } else {
                diagnostico = 'Necesita Refuerzo Urgente';
                
                // 3. Asignación de Sugerencias (CATÁLOGO)
                const sugerenciaCatalog = CATALOGO_SUGERENCIAS_DCE[area.trim()];
                if (sugerenciaCatalog) {
                    const match = sugerenciaCatalog.find(s => nombreComp.toUpperCase().includes(s.afirmacion_clave.toUpperCase().substring(0, 10)));
                    if (match) {
                        sugerenciasAsociadas = match.sugerencias;
                    }
                }
            }
            
            comparativaCompetencias.push({
                competencia: nombreComp,
                aciertoSimulacro: aciertoSim.toFixed(2),
                aciertoHistorico: aciertoHist.toFixed(2),
                brecha: (aciertoSim - aciertoHist).toFixed(2),
                diagnostico: diagnostico,
                sugerencias: sugerenciasAsociadas
            });
        });

        // Almacenar resultados para el área
        analisisResultados[area] = {
            puntajePromedioSim: areaSimulacroData.Puntaje_Promedio_Area,
            nivelesSimulacro: nivelesPorArea[area], 
            comparativaCompetencias: comparativaCompetencias,
        };
    });

    return analisisResultados;
}


// -----------------------------------------------------------------
// 5. RENDERIZACIÓN Y PRESENTACIÓN
// -----------------------------------------------------------------

/**
 * Función auxiliar para dibujar la gráfica de Tendencia Global (Chart.js).
 */
function renderizarGraficaTendencia(tendencia, elementoId) {
    const labels = tendencia.map(d => d.nombre);
    const dataPoints = tendencia.map(d => d.puntaje);
    
    const histData = tendencia.find(d => d.tipo === 'historico');
    const promedioHistorico = histData ? histData.puntaje : null;

    const backgroundColors = tendencia.map(d => 
        d.tipo === 'historico' ? 'rgba(50, 50, 50, 0.8)' : 'rgba(0, 153, 255, 0.8)'
    );
    const borderColors = tendencia.map(d => 
        d.tipo === 'historico' ? 'rgba(50, 50, 50, 1)' : 'rgba(0, 153, 255, 1)'
    );

    // [El código de Chart.js aquí]
    new Chart(document.getElementById(elementoId).getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Puntaje Promedio Global',
                data: dataPoints,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 3,
                tension: 0.4, 
                pointRadius: 5,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    min: 200, 
                    max: 400, 
                    title: { display: true, text: 'Puntaje Global' }
                }
            },
            plugins: {
                title: { display: true, text: 'Tendencia de Rendimiento Global' },
                annotation: { 
                    annotations: promedioHistorico ? [{
                        type: 'line',
                        yMin: promedioHistorico,
                        yMax: promedioHistorico,
                        borderColor: 'red',
                        borderWidth: 2,
                        label: { content: 'Promedio Histórico', enabled: true, position: 'start' }
                    }] : []
                }
            }
        }
    });
}


/**
 * Función auxiliar para dibujar la gráfica de Niveles de Desempeño (Torta/Pie).
 */
function renderizarGraficaNiveles(distribucion, elementoId, titulo) {
    const labels = Object.keys(distribucion).filter(k => k !== 'Total').sort((a, b) => {
        const idA = RANGOS_DESEMPENIO.niveles_global.find(n => n.nombre === a)?.id || 0;
        const idB = RANGOS_DESEMPENIO.niveles_global.find(n => n.nombre === b)?.id || 0;
        return idA - idB;
    });

    const dataPoints = labels.map(label => parseFloat(distribucion[label]));
    
    const colors = labels.map(label => {
        const nivel = RANGOS_DESEMPENIO.niveles_global.find(n => n.nombre === label) || RANGOS_DESEMPENIO.niveles_areas_estandar.find(n => n.nombre === label);
        return nivel ? nivel.color : 'gray';
    });

    // [El código de Chart.js aquí]
    new Chart(document.getElementById(elementoId).getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Distribución %',
                data: dataPoints,
                backgroundColor: colors,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: `Niveles de Desempeño ${titulo}` },
                legend: { position: 'right' }
            }
        }
    });
}

/**
 * Función que renderiza todo el informe en el contenedor HTML.
 */
function mostrarInforme(reporte) {
    const contenedor = document.getElementById('contenedor-informe');
    const global = reporte.global;
    
    // --- 1. RESUMEN EJECUTIVO Y ESTADÍSTICAS GLOBALES ---
    let html = `
        <h2 style="color: #004d99;">✅ INFORME COMPARATIVO: ${reporte.metadata.colegio}</h2>
        
        <div class="area-section">
            <h3>I. Análisis Global y Tendencia</h3>
            
            <p><strong>Cálculo:</strong> Se compara el rendimiento de los simulacros contra el promedio histórico ${reporte.metadata.ultimoAnioHistorico} del Establecimiento Educativo (EE).</p>
            
            <div style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                    <h4>Métricas Clave</h4>
                    <ul>
                        <li>Promedio Histórico EE (${reporte.metadata.ultimoAnioHistorico}): <strong>${global.promedioHistorico}</strong> (Desviación: ${global.desviacionHistorica})</li>
                        <li>Promedio Simulacro Reciente (${reporte.metadata.simulacroReciente}): <strong>${global.promedioSimulacroReciente}</strong></li>
                        <li>Promedio del Grupo de Comparación (${global.grupoComparacion}): ${global.promedioGrupoComp}</li>
                        <li style="color: ${global.zScore < 0 ? 'red' : 'green'}; font-size: 1.1em;">
                            <strong>Z-SCORE (Desviación del Histórico): ${global.zScore}</strong>
                            <br>
                            ${global.zScore < -0.5 
                                ? 'El rendimiento está significativamente POR DEBAJO de la media histórica del colegio.' 
                                : global.zScore > 0.5 
                                ? 'El rendimiento está significativamente POR ENCIMA de la media histórica.'
                                : 'El rendimiento es consistente con la media histórica.'}
                        </li>
                    </ul>
                </div>
                
                <div style="flex: 1;">
                    <h4>Comparación de Niveles de Desempeño (Global)</h4>
                    <canvas id="chartNivelesGlobal" style="max-height: 250px;"></canvas>
                </div>
            </div>
            
            <hr>
            <h4>Tendencia Histórica vs. Simulacros</h4>
            <div style="width: 90%; margin: auto;">
                <canvas id="chartTendenciaGlobal"></canvas>
            </div>
        </div>
    `;

    // --- 2. ANÁLISIS DETALLADO POR ÁREA ---
    html += `<h3>II. Análisis de Rendimiento por Área (DCE)</h3>`;
    
    Object.entries(reporte.analisisPorArea).forEach(([area, datosArea]) => {
        html += `
            <div class="area-section">
                <h4>${area}</h4>
                <p>Puntaje promedio del simulacro: <strong>${datosArea.puntajePromedioSim}</strong></p>
                
                <h5>Comparativo de Competencias (Simulacro Reciente vs. Histórico):</h5>
                <table border="1" width="100%">
                    <thead>
                        <tr>
                            <th>Competencia / Afirmación</th>
                            <th>% Acierto Simulacro</th>
                            <th>% Acierto Histórico</th>
                            <th>Brecha</th>
                            <th>Diagnóstico</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        datosArea.comparativaCompetencias.forEach(comp => {
            const color = comp.brecha < -0.1 ? 'red' : comp.brecha > 0.1 ? 'green' : 'black';
            html += `
                        <tr>
                            <td>${comp.competencia}</td>
                            <td>${(comp.aciertoSimulacro * 100).toFixed(1)}%</td>
                            <td>${(comp.aciertoHistorico * 100).toFixed(1)}%</td>
                            <td style="color: ${color};">${comp.brecha}</td>
                            <td>${comp.diagnostico}</td>
                        </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
                
                <h5>Sugerencias Metodológicas (Basadas en DCE)</h5>
                <ul>
        `;
        
        // Consolidar todas las sugerencias de las debilidades
        const sugerenciasConsolidadas = new Set();
        datosArea.comparativaCompetencias
            .filter(c => c.diagnostico === 'Necesita Refuerzo Urgente')
            .forEach(c => c.sugerencias.forEach(s => sugerenciasConsolidadas.add(s)));
        
        if (sugerenciasConsolidadas.size > 0) {
             sugerenciasConsolidadas.forEach(s => html += `<li>${s}</li>`);
        } else {
             html += `<li>No se identificaron debilidades críticas en esta área (< 45% de acierto).</li>`;
        }
        
        html += `
                </ul>
            </div>
        `;
    });
    
    // --- 3. FINALIZAR Y EJECUTAR GRÁFICAS ---
    contenedor.innerHTML = html;
    
    // Ejecutar la gráfica de Tendencia Global
    renderizarGraficaTendencia(global.tendencia, 'chartTendenciaGlobal');
    
    // Ejecutar la gráfica de Niveles Globales
    renderizarGraficaNiveles(global.distribucionNiveles, 'chartNivelesGlobal', 'Global');
}


// -----------------------------------------------------------------
// 6. FUNCIÓN PRINCIPAL DE ORQUESTACIÓN
// -----------------------------------------------------------------

async function iniciarProceso() {
    
    document.getElementById('contenedor-informe').innerHTML = 'Cargando datos y calculando...';
    
    // 1. OBTENER ORDEN DE APLICACIÓN (Desde el HTML)
    const ordenSimulacros = [
        document.getElementById('simulacro1').value, 
        document.getElementById('simulacro2').value, 
        document.getElementById('simulacro3').value  
    ];
    const simulacroRecienteNombre = ordenSimulacros[ordenSimulacros.length - 1];

    try {
        // A. Carga de datos
        const historicoICFES = await cargarJSON(ARCHIVO_ICFES);
        const detalleCSV = await cargarConsolidadoCSV(ARCHIVOS_DETALLE_CSV); 
        
        const resultadosSimulacros = {};
        for (const simName of ordenSimulacros) {
            resultadosSimulacros[simName] = await cargarJSON(ARCHIVOS_SIMULACROS[simName]);
        }
        
        const matricesDCE = {};
        for (const [area, ruta] of Object.entries(ARCHIVOS_MATRICES)) {
            matricesDCE[area] = await cargarJSON(ruta);
        }

        // ---------------------------------------------------
        // CÁLCULO GLOBAL Y ESTADÍSTICO
        // ---------------------------------------------------
        
        // 1. Obtener datos históricos del Establecimiento Educativo (EE)
        const datosHistEE = historicoICFES.Resultados_Consolidados.Tabla_2_1_Global.find(d => 
            d.Grupo_Comparacion === "Establecimiento educativo"
        );

        // 2. DETECCIÓN DINÁMICA DEL ÚLTIMO AÑO DISPONIBLE
        let ultimoAnio = null;
        let histPromedio = 0;
        let histDesviacion = 0;

        for (let year = 2025; year >= 2021; year--) { 
            const anioKey = `Anio_${year}`;
            if (datosHistEE[anioKey] && datosHistEE[anioKey].Promedio !== "N.D.") {
                ultimoAnio = year;
                histPromedio = parseFloat(datosHistEE[anioKey].Promedio);
                histDesviacion = parseFloat(datosHistEE[anioKey].Desviacion);
                break; 
            }
        }
        if (ultimoAnio === null) {
            throw new Error("No se encontraron datos históricos de Promedio Global y Desviación Estándar (EE).");
        }

        // 3. Identificar el Grupo de Comparación (GC) y su promedio.
        const nombreGC = historicoICFES.Datos_Generales.GC && historicoICFES.Datos_Generales.GC !== "N.D." 
            ? historicoICFES.Datos_Generales.GC 
            : "Oficiales urbanos ETC";
            
        const datosGrupoComp = historicoICFES.Resultados_Consolidados.Tabla_2_1_Global.find(d => d.Grupo_Comparacion === nombreGC) 
            || { [`Anio_${ultimoAnio}`]: { Promedio: "N.D." } }; 

        const promGrupoComp = datosGrupoComp[`Anio_${ultimoAnio}`].Promedio !== "N.D."
            ? parseFloat(datosGrupoComp[`Anio_${ultimoAnio}`].Promedio)
            : 0;

        // 4. Cálculo del promedio global del simulacro más reciente (Dzeta)
        const puntajesGlobalesSimulacro = detalleCSV.map(row => row.PUNTAJE).filter(p => typeof p === 'number' && !isNaN(p));
        const promedioGlobalSimulacro = calcularPromedio(puntajesGlobalesSimulacro);

        // 5. Cálculo Estadístico Clave
        const zScoreGlobal = calcularZScore(promedioGlobalSimulacro, histPromedio, histDesviacion);
        
        // 6. Estructura de la TENDENCIA GLOBAL
        const promediosSimulacrosTendencia = [
            { nombre: `Histórico EE (${ultimoAnio})`, puntaje: histPromedio, tipo: 'historico', desviacion: histDesviacion } 
        ];
        
        ordenSimulacros.forEach(simName => {
            const simData = resultadosSimulacros[simName];
            
            let puntajeSim = null;
            if (simData.Metadata_Simulacro && simData.Metadata_Simulacro.Puntaje_Global) {
                puntajeSim = parseFloat(simData.Metadata_Simulacro.Puntaje_Global);
            } else if (simName === simulacroRecienteNombre) {
                puntajeSim = promedioGlobalSimulacro; 
            }

            if (puntajeSim !== null) {
                promediosSimulacrosTendencia.push({
                    nombre: simName,
                    puntaje: puntajeSim,
                    tipo: 'simulacro'
                });
            }
        });

        // 7. Cálculo de Distribución de Niveles
        const distribucionNiveles = calcularDistribucionNiveles(detalleCSV); 
        
        // ---------------------------------------------------
        // ESTRUCTURA DEL REPORTE FINAL (Fase III/IV)
        // ---------------------------------------------------
        
        const reporteFinal = {
            metadata: {
                colegio: historicoICFES.Datos_Generales.Nombre_Colegio,
                dane: DANE_COLEGIO,
                ultimoAnioHistorico: ultimoAnio,
                simulacroReciente: simulacroRecienteNombre
            },
            global: {
                promedioSimulacroReciente: promedioGlobalSimulacro.toFixed(2),
                promedioHistorico: histPromedio.toFixed(2),
                desviacionHistorica: histDesviacion.toFixed(2),
                zScore: zScoreGlobal.toFixed(2),
                tendencia: promediosSimulacrosTendencia,
                grupoComparacion: nombreGC,
                promedioGrupoComp: promGrupoComp.toFixed(2),
                distribucionNiveles: distribucionNiveles.Global
            },
            nivelesPorArea: distribucionNiveles.Areas,
            resultadosSimulacros: resultadosSimulacros, 
            matricesDCE: matricesDCE,
            historicoICFES: historicoICFES 
        };

        // 8. LLAMAR AL PASO FINAL: ANÁLISIS DETALLADO Y SUGERENCIAS
        reporteFinal.analisisPorArea = generarAnalisisPorArea(reporteFinal); 

        // ---------------------------------------------------
        // Renderización
        // ---------------------------------------------------
        mostrarInforme(reporteFinal);


    } catch (error) {
        document.getElementById('contenedor-informe').innerHTML = 
            `<h2 style="color:red;">Fallo al generar el informe.</h2><p>Verifique que los nombres de los archivos en el repositorio y la configuración de rutas sean correctos.</p><p>Detalle: ${error.message}</p>`;
        console.error("Error grave en la orquestación:", error);
    }
}
