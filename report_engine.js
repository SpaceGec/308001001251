// =================================================================
// js/report_engine.js | CONTENIDO CONSOLIDADO HASTA EL PASO 18
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
// NOTA: Basado en la estructura de carpetas, asumimos que estos son los archivos
// que contienen la data PUNTAJE, LECTURA CRÍTICA, etc., y que deben CONSOLIDARSE.
const ARCHIVOS_DETALLE_CSV = [
    '10-A-JM-2-05 DZETA 10 SABER.csv',
    '10-C-JM-2-05 DZETA 10 SABER.csv',
    // Si hubiera más grupos, se añadirían aquí. 
    // Por ahora, solo usamos los CSV de Dzeta que se ven en la carpeta.
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
    FUERTE: 0.65, 
    MEDIO: 0.45,  
    DEBIL: 0.00   
};

// Catálogo de Sugerencias (Simplificado)
const CATALOGO_SUGERENCIAS_DCE = {
    // ... (El contenido de las sugerencias de Matemáticas y otras áreas va aquí)
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
// ... (Las funciones calcularDesviacionEstandar, calcularZScore, clasificarNivel van aquí)


// -----------------------------------------------------------------
// 3. FUNCIONES DE INGESTA DE DATOS (FETCH y PARSEO)
// -----------------------------------------------------------------

/**
 * Carga un archivo JSON desde una ruta (fetch estático).
 */
async function cargarJSON(ruta) {
    // La ruta debe ser relativa al index.html. Si los archivos están en una subcarpeta
    // (ej: DANE/308001001251_icfes.json), la ruta debe ajustarse en las constantes.
    const response = await fetch(ruta);
    if (!response.ok) {
        throw new Error(`Error al cargar el archivo de datos: ${ruta}`);
    }
    return response.json();
}

/**
 * Carga MÚLTIPLES archivos CSV y los CONSOLIDA en un único array de objetos.
 */
async function cargarConsolidadoCSV(rutas) {
    let datosConsolidados = [];
    
    // NOTA: Para parsear CSV en JS se requiere una librería (ej: Papa Parse), 
    // pero aquí usaremos una simulación simple que asume un formato CSV bien delimitado.
    
    for (const ruta of rutas) {
        const response = await fetch(ruta);
        if (!response.ok) {
            console.warn(`CSV no encontrado o inaccesible: ${ruta}`);
            continue; // Intentar con el siguiente archivo
        }
        const text = await response.text();
        
        // Simulación de parseo: 
        const rows = text.split('\n').map(row => row.trim()).filter(row => row.length > 0);
        if (rows.length === 0) continue;
        
        const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const rowObject = {};
            if (values.length === headers.length) {
                headers.forEach((header, index) => {
                    // Limpieza y conversión a número (ignora los N.D.)
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
// 4. LÓGICA DE CÁLCULO Y COMPARACIÓN (Esqueleto)
// -----------------------------------------------------------------

/**
 * Implementación de la lógica de distribución de niveles (Paso 16).
 * (El cuerpo de la función se define aparte para mantener el orden)
 */
function calcularDistribucionNiveles(detalleCSV) { 
    // Lógica del Paso 16
    // ...
    // Placeholder para evitar errores:
    return { Global: {}, Areas: {} };
}

/**
 * Implementación de la lógica de análisis DCE y Sugerencias (Paso 20).
 */
function generarAnalisisPorArea(resultadosSimulacros, historicoICFES, matricesDCE) {
    // Lógica del Paso 20
    // ...
    return { Matemáticas: { desempeño: 'bajo', sugerencias: [] } };
}


// -----------------------------------------------------------------
// 5. FUNCIÓN PRINCIPAL DE ORQUESTACIÓN
// -----------------------------------------------------------------

async function iniciarProceso() {
    document.getElementById('contenedor-informe').innerHTML = 'Cargando datos y calculando...';
    
    // NOTA: Si los archivos se encuentran en una subcarpeta (ej: 308001001251/), 
    // las rutas de las constantes deberán ajustarse para incluir ese prefijo.

    const ordenSimulacros = [
        document.getElementById('simulacro1').value, 
        document.getElementById('simulacro2').value, 
        document.getElementById('simulacro3').value  
    ];
    const simulacroRecienteNombre = ordenSimulacros[ordenSimulacros.length - 1];

    try {
        // A. Carga de datos
        const historicoICFES = await cargarJSON(ARCHIVO_ICFES);
        
        // Carga y Consolidación del detalle de estudiantes (CSV/Excel) para el ÚLTIMO SIMULACRO
        const detalleCSV = await cargarConsolidadoCSV(ARCHIVOS_DETALLE_CSV); 
        
        // Carga de todos los JSON de simulacro (JSON 3) y Matrices DCE (JSON 1)
        const [
            resultadosSimulacros, 
            matricesDCE
        ] = await Promise.all([
            Promise.all(Object.keys(ARCHIVOS_SIMULACROS).map(key => cargarJSON(ARCHIVOS_SIMULACROS[key]))),
            Promise.all(Object.keys(ARCHIVOS_MATRICES).map(key => cargarJSON(ARCHIVOS_MATRICES[key])))
        ]);

        // ---------------------------------------------------
        // CÁLCULO PENDIENTE
        // ---------------------------------------------------

        // Aquí se implementarían el cálculo global, Z-Score, Tendencia, y Distribución.

        document.getElementById('contenedor-informe').innerHTML = 
            `<h2>Carga exitosa!</h2><p>Archivos cargados: ${Object.keys(ARCHIVOS_SIMULACROS).length} simulacros, ${Object.keys(ARCHIVOS_MATRICES).length} matrices, 1 ICFES. ${detalleCSV.length} registros de estudiantes consolidados para el último simulacro.</p>
            <p><strong>El siguiente paso es añadir la lógica de cálculo y análisis.</strong></p>`;


    } catch (error) {
        document.getElementById('contenedor-informe').innerHTML = 
            `<h2 style="color:red;">Fallo catastrófico al cargar los datos.</h2><p>Verifique los nombres de los archivos en el repositorio y la configuración de rutas en report_engine.js.</p><p>Detalle: ${error.message}</p>`;
        console.error("Error grave en la orquestación:", error);
    }
}
