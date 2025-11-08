// =================================================================
// js/report_engine.js | CONTENIDO CONSOLIDADO HASTA EL PASO 21
// =================================================================

// -----------------------------------------------------------------
// 1. CONSTANTES Y CONFIGURACIÓN (RUTAS, RANGOS Y REGLAS DE ANÁLISIS)
// -----------------------------------------------------------------

const DANE_COLEGIO = '308001001251'; 

// --- Archivos JSON Estáticos ---
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

// --- Nombres de los CSV Detallados del ÚLTIMO Simulacro (Dzeta) ---
// Estos archivos contienen la data PUNTAJE, LECTURA CRÍTICA, etc., y deben CONSOLIDARSE.
// Asumimos que los archivos están en la subcarpeta del DANE o en la raíz, 
// y que la ruta debe ser la que usted subió:
const ARCHIVOS_DETALLE_CSV = [
    '10-A-JM-2-05 DZETA 10 SABER.csv',
    '10-C-JM-2-05 DZETA 10 SABER.csv',
    // Si hubiera más CSV/XLSX del último simulacro, deberían estar aquí.
];


// --- RANGOS DE DESEMPEÑO (Cargados de Rangos_Pruebas.json) ---
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

// Umbrales para clasificar el rendimiento de Evidencias/Afirmaciones
const UMBRALES_ANALISIS = {
    FUERTE: 0.65, // > 65% de acierto
    MEDIO: 0.45,  // 45% a 65%
    DEBIL: 0.00   // < 45% (Necesita Refuerzo)
};

// Catálogo de Sugerencias (Necesita ser completado, solo Mat. por ahora)
const CATALOGO_SUGERENCIAS_DCE = {
    "Matemáticas": [
        {
            "afirmacion_clave": "Interpretación y representación", 
            "sugerencias": [
                "Implementar talleres de lectura crítica de datos: usar noticias, infografías y tablas reales para identificar la información principal.",
                "Realizar ejercicios de transformación de representación, pasando de tabla a gráfica y viceversa."
            ]
        },
        {
            "afirmacion_clave": "Formulación y ejecución",
            "sugerencias": [
                "Fomentar la modelación de problemas: pedir a los estudiantes que dibujen o escriban el plan de solución antes de ejecutar el cálculo.",
                "Trabajar en la identificación de la información relevante y la irrelevante."
            ]
        },
        {
            "afirmacion_clave": "Argumentación",
            "sugerencias": [
                "Implementar debates matemáticos: presentar dos soluciones diferentes a un problema y pedirles que defiendan el procedimiento más válido.",
                "Solicitar justificaciones escritas después de cada ejercicio, centrándose en el 'por qué'."
            ]
        }
    ],
    // ... (Otras áreas pendientes de completar)
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
        
        // Simulación de parseo y consolidación: 
        const rows = text.split('\n').map(row => row.trim()).filter(row => row.length > 0);
        if (rows.length === 0) continue;
        
        // El CSV puede usar comas o puntos y comas. Usaremos el delimitador más frecuente.
        const delimiter = rows[0].includes(';') ? ';' : ','; 
        
        const headers = rows[0].split(delimiter).map(h => h.trim().replace(/"/g, '').replace(/\(.*\)/g, ''));
        
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i].split(delimiter).map(v => v.trim().replace(/"/g, ''));
            const rowObject = {};

            if (values.length === headers.length) {
                headers.forEach((header, index) => {
                    let value = values[index];
                    // Intenta parsear a float, si no es número, deja el string
                    rowObject[header] = isNaN(parseFloat(value)) ? value : parseFloat(value);
                });
                datosConsolidados.push(rowObject);
            }
        }
    }

    return datosConsolidados;
}


// -----------------------------------------------------------------
// 4. LÓGICA DE CÁLCULO Y COMPARACIÓN (Funciones Pendientes)
// -----------------------------------------------------------------

/**
 * Calcula la distribución de estudiantes en los niveles de desempeño Global y por Área. (Paso 21)
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
 * Genera el análisis detallado por área, comparando rendimiento y asignando sugerencias (Paso 22 - Pendiente)
 */
function generarAnalisisPorArea(reporteFinal) {
    // ESTA FUNCIÓN SE IMPLEMENTARÁ EN EL SIGUIENTE PASO
    return {};
}

/**
 * Función que renderiza el informe en el contenedor (Paso 23 - Pendiente)
 */
function mostrarInforme(reporte) {
    const contenedor = document.getElementById('contenedor-informe');
    // Implementación de Chart.js y renderizado de HTML
    // Por ahora, solo mostramos el resumen:
    
    let html = `<h2>✅ Informe Generado para: ${reporte.metadata.colegio}</h2>`;
    html += `<h3>Resumen Global (Histórico ${reporte.metadata.ultimoAnioHistorico} vs. Simulacro ${reporte.metadata.simulacroReciente})</h3>`;
    html += `<ul>
        <li>Puntaje Histórico Promedio: <strong>${reporte.global.promedioHistorico}</strong> (Desviación: ${reporte.global.desviacionHistorica})</li>
        <li>Puntaje Simulacro Reciente: <strong>${reporte.global.promedioSimulacroReciente}</strong></li>
        <li><strong>Z-Score (Desviación del Histórico): ${reporte.global.zScore}</strong> </li>
    </ul>`;

    html += '<h4>Distribución de Niveles Globales (Simulacro Reciente):</h4>';
    html += '<table border="1"><thead><tr><th>Nivel</th><th>% Estudiantes</th></tr></thead><tbody>';
    Object.entries(reporte.global.distribucionNiveles).forEach(([nivel, porcentaje]) => {
        if (nivel !== 'Total') {
             html += `<tr><td>${nivel}</td><td>${porcentaje}%</td></tr>`;
        }
    });
    html += '</tbody></table>';
    
    contenedor.innerHTML = html;
}


// -----------------------------------------------------------------
// 5. FUNCIÓN PRINCIPAL DE ORQUESTACIÓN
// -----------------------------------------------------------------

async function iniciarProceso() {
    
    document.getElementById('contenedor-informe').innerHTML = 'Cargando datos y calculando...';
    
    const ordenSimulacros = [
        document.getElementById('simulacro1').value, 
        document.getElementById('simulacro2').value, 
        document.getElementById('simulacro3').value  
    ];
    const simulacroRecienteNombre = ordenSimulacros[ordenSimulacros.length - 1];

    try {
        // A. Carga de datos estáticos y dinámicos (CSV)
        const historicoICFES = await cargarJSON(ARCHIVO_ICFES);
        const detalleCSV = await cargarConsolidadoCSV(ARCHIVOS_DETALLE_CSV); 
        
        // Carga de todos los JSON de simulacro (JSON 3) y Matrices DCE (JSON 1)
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
        // ESTRUCTURA DEL REPORTE FINAL
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
        };

        // LLAMAR AL SIGUIENTE PASO: ANÁLISIS DETALLADO POR ÁREA
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
