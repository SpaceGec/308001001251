// =================================================================
// js/report_engine.js | CONTENIDO CONSOLIDADO HASTA EL PASO 14
// =================================================================


// -----------------------------------------------------------------
// 1. CONSTANTES Y CONFIGURACIÓN (RANGOS Y REGLAS DE ANÁLISIS)
// -----------------------------------------------------------------

// Rangos de Desempeño (Validado por Rangos_Pruebas.json)
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

// Catálogo de Sugerencias Metodológicas (La base de conocimiento de la "IA")
const CATALOGO_SUGERENCIAS_DCE = {
    "Matemáticas": [
        {
            "afirmacion_clave": "Interpretación y representación", 
            "sugerencias": [
                "Implementar talleres de lectura crítica de datos: usar noticias, infografías y tablas reales (no solo ejercicios matemáticos) para identificar la información principal.",
                "Realizar ejercicios de transformación de representación, pasando de tabla a gráfica y viceversa, enfatizando la justificación de cada cambio."
            ]
        },
        {
            "afirmacion_clave": "Formulación y ejecución",
            "sugerencias": [
                "Fomentar la modelación de problemas: pedir a los estudiantes que dibujen o escriban el plan de solución antes de ejecutar el cálculo.",
                "Trabajar en la identificación de la información relevante y la irrelevante dentro de un enunciado complejo."
            ]
        },
        {
            "afirmacion_clave": "Argumentación",
            "sugerencias": [
                "Implementar debates matemáticos: presentar dos soluciones diferentes a un problema y pedirles que defiendan cuál es el procedimiento más válido o eficiente.",
                "Solicitar justificaciones escritas después de cada ejercicio, centrándose en el 'por qué' la solución es correcta o incorrecta."
            ]
        }
    ],
    // NOTA: Se deberán añadir las entradas para Lectura Crítica, Sociales, Naturales e Inglés.
};


// -----------------------------------------------------------------
// 2. FUNCIONES DE UTILIDAD MATEMÁTICA Y CLASIFICACIÓN
// -----------------------------------------------------------------

/**
 * Calcula el promedio de un array de números.
 */
function calcularPromedio(arr) {
    if (arr.length === 0) return 0;
    const numArr = arr.filter(n => typeof n === 'number' && !isNaN(n));
    if (numArr.length === 0) return 0;
    return numArr.reduce((a, b) => a + b, 0) / numArr.length;
}

/**
 * Calcula la desviación estándar de un array de números.
 */
function calcularDesviacionEstandar(arr, promedio) {
    if (arr.length <= 1) return 0;
    const numArr = arr.filter(n => typeof n === 'number' && !isNaN(n));
    if (numArr.length <= 1) return 0;
    
    const squareDiffs = numArr.map(value => Math.pow(value - promedio, 2));
    const avgSquareDiff = calcularPromedio(squareDiffs);
    return Math.sqrt(avgSquareDiff);
}

/**
 * Calcula el Z-Score.
 */
function calcularZScore(promedioActual, promedioHistorico, desviacionHistorica) {
    promedioActual = parseFloat(promedioActual);
    promedioHistorico = parseFloat(promedioHistorico);
    desviacionHistorica = parseFloat(desviacionHistorica);
    
    if (isNaN(desviacionHistorica) || desviacionHistorica === 0) return 0;
    return (promedioActual - promedioHistorico) / desviacionHistorica;
}

/**
 * Clasifica un puntaje en su nivel de desempeño (ej: 320 -> Satisfactorio).
 */
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
// 3. UTILIDADES DE I/O Y PARSEO (Placeholders necesarios para la ejecución web)
// -----------------------------------------------------------------

/**
 * Lee el contenido de un archivo cargado por input.
 */
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

/**
 * Parsea el contenido de un Excel/CSV a un array de objetos.
 * NOTA: Esto es un placeholder. En producción, se usaría una librería como Papa Parse 
 * para manejar CSVs o una conversión previa para Excels.
 * Aquí simulamos el resultado de parsear el CSV del detalle.
 */
async function parseExcelToData(file) {
    const text = await readFile(file);
    
    // Asumimos que la primera línea es la cabecera
    const rows = text.split('\n').map(row => row.trim()).filter(row => row.length > 0);
    const headers = rows[0].split(',').map(h => h.trim());
    
    const data = [];
    // Iteramos sobre las filas de datos
    for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',').map(v => v.trim());
        const rowObject = {};
        headers.forEach((header, index) => {
            // Limpieza básica: remueve paréntesis y espacios en blanco y convierte a número si es posible
            let value = values[index] ? values[index].replace(/\(.*\)/g, '').trim() : '';
            rowObject[header] = isNaN(parseFloat(value)) || value === '' ? value : parseFloat(value);
        });
        
        // El resultado debe ser un array con la estructura de la hoja de cálculo
        data.push(rowObject);
    }
    
    return data;
}


// -----------------------------------------------------------------
// 4. LÓGICA DE CÁLCULO Y COMPARACIÓN GLOBAL (Simulando JSON 3 loading)
// -----------------------------------------------------------------

// Función que necesitaríamos para cargar los JSONs de simulacro (Dzeta, Gamma, Epsilon)
// Asumiremos que los JSONs de simulacro se cargan directamente.
async function cargarSimulacroJSON(nombreSimulacro, codigoDANE) {
    // En un entorno de GitHub Pages, esto sería una ruta simple:
    const ruta = `${codigoDANE}_${nombreSimulacro}.json`;
    
    // Aquí debería haber un 'fetch' a la ruta del JSON. 
    // Por el momento, y para que la lógica de iniciarProceso() funcione, 
    // devolveremos un placeholder del JSON 3 si no se puede cargar:
    
    // **NOTA:** ESTA PARTE REQUERIRÁ QUE USTED CARGUE LOS ARCHIVOS JSON DEL SIMULACRO 
    // EN LAS RUTAS ESPERADAS O QUE MODIFIQUE LA FUNCIÓN. 
    
    // Por ahora, solo devolveremos el JSON 3 (Dzeta) que ya nos proporcionó como ejemplo, 
    // si el nombre coincide.

    if (nombreSimulacro.includes("Dzeta")) {
        // Retornar la estructura que se vio en el Paso 3 (308001001251_Dzeta_10.json)
        return {
            Metadata_Simulacro: {
                Colegio_ID: "I.E.D. SANTA MAGDALENA SOFIA",
                Simulacro_ID: "2-05 DZETA 10 SABER",
                // ... (más metadatos)
            },
            Resultados_Areas: [
                // Solo para ejemplificar el dato que necesitamos:
                { Area: "Matemáticas", Puntaje_Promedio_Area: 28.3, Rendimiento_Competencias: [/*...*/], Rendimiento_Componentes_Evidencias: [/*...*/] },
                { Area: "Lectura Crítica", Puntaje_Promedio_Area: 42.0, Rendimiento_Competencias: [/*...*/], Rendimiento_Componentes_Evidencias: [/*...*/] }
                // ... otras áreas
            ]
        };
    }
    // Para Gamma y Epsilon, necesitamos una estructura similar
    return { Resultados_Areas: [] }; // Placeholder vacío
}


// -----------------------------------------------------------------
// 5. FUNCIÓN PRINCIPAL DE ORQUESTACIÓN
// -----------------------------------------------------------------

async function iniciarProceso() {
    
    document.getElementById('contenedor-informe').innerHTML = 'Calculando...';

    // 1. OBTENER ARCHIVOS Y ORDEN DE APLICACIÓN
    const fileICFES = document.getElementById('input-icfes').files[0];
    const fileExcel = document.getElementById('input-excel').files[0];
    const ordenSimulacros = [
        document.getElementById('simulacro1').value,
        document.getElementById('simulacro2').value,
        document.getElementById('simulacro3').value
    ];

    if (!fileICFES || !fileExcel) {
        alert("Por favor, cargue el Histórico ICFES y el Archivo de Resultados Detallados.");
        return;
    }

    try {
        // Carga y parseo de datos
        const historicoICFES = JSON.parse(await readFile(fileICFES));
        const detalleCSV = await parseExcelToData(fileExcel); 
        const dane = historicoICFES.Datos_Generales.Codigo_DANE;

        // ---------------------------------------------------
        // CÁLCULO GLOBAL (Fase II)
        // ---------------------------------------------------
        
        // A. Obtener datos históricos y grupo de comparación
        const datosHistEE = historicoICFES.Resultados_Consolidados.Tabla_2_1_Global.find(d => 
            d.Grupo_Comparacion === "Establecimiento educativo"
        );
        const histPromedio = parseFloat(datosHistEE.Anio_2023.Promedio); 
        const histDesviacion = parseFloat(datosHistEE.Anio_2023.Desviacion); 
        
        // B. Calcular el promedio del simulacro MÁS RECIENTE (Dzeta) a partir del Excel detallado
        // NOTA: Asumimos que el Excel DETALLE contiene datos del último simulacro (Dzeta)
        const puntajesGlobalesSimulacro = detalleCSV.map(row => row.PUNTAJE).filter(p => !isNaN(p));
        const promedioGlobalSimulacro = calcularPromedio(puntajesGlobalesSimulacro);

        // C. Obtener promedios de todos los simulacros para la TENDENCIA
        // Esto asume que el JSON 3 tiene el puntaje promedio del área/global (aunque el Excel detalle
        // del Dzeta nos dio el global, necesitamos los otros)
        
        const promediosSimulacros = [];
        
        // 1. Histórico Fijo
        promediosSimulacros.push({ 
            nombre: "Histórico EE", 
            puntaje: histPromedio, 
            tipo: 'historico', 
            desviacion: histDesviacion 
        });

        // 2. Simulacros en orden (Gamma, Epsilon, Dzeta)
        for (const simName of ordenSimulacros) {
            // Este fetch/carga debe obtener el Puntaje_Promedio_Global de cada simulacro
            // Usaremos el Promedio Global calculado del Excel para el último simulacro (Dzeta)
            let puntajeSim = null;
            if (simName === ordenSimulacros[ordenSimulacros.length - 1]) {
                puntajeSim = promedioGlobalSimulacro; // Usamos el cálculo directo del excel
            } else {
                // Aquí deberíamos cargar el JSON del simulacro, por ahora es un placeholder
                puntajeSim = (histPromedio - (ordenSimulacros.indexOf(simName) + 1) * 5); // Placeholder decreciente
            }

            promediosSimulacros.push({
                nombre: simName,
                puntaje: puntajeSim,
                tipo: 'simulacro'
            });
        }
        
        // D. Calcular Z-Score del simulacro más reciente (Dzeta)
        const zScoreGlobal = calcularZScore(promedioGlobalSimulacro, histPromedio, histDesviacion);
        
        // ---------------------------------------------------
        // ESTRUCTURA DEL REPORTE FINAL
        // ---------------------------------------------------
        
        const reporteFinal = {
            metadata: {
                colegio: historicoICFES.Datos_Generales.Nombre_Colegio,
                dane: dane,
                ordenSimulacros: ordenSimulacros
            },
            global: {
                promedioSimulacroReciente: promedioGlobalSimulacro.toFixed(2),
                promedioHistorico: histPromedio.toFixed(2),
                desviacionHistorica: histDesviacion.toFixed(2),
                zScore: zScoreGlobal.toFixed(2),
                tendencia: promediosSimulacros,
                // Falta la distribución de niveles (Paso 16)
            },
            // Falta el análisis por área (Paso 17)
            analisisPorArea: {} 
        };

        // LLAMAR AL SIGUIENTE PASO: DISTRIBUCIÓN DE NIVELES
        const reporteConNiveles = await calcularDistribucionNiveles(reporteFinal, detalleCSV);

        // LLAMAR AL SIGUIENTE PASO: ANÁLISIS DETALLADO POR ÁREA
        // const reporteCompleto = await generarAnalisisDetallado(reporteConNiveles, historicoICFES, dane);

        // ---------------------------------------------------
        // Renderización (Placeholder)
        // ---------------------------------------------------
        mostrarResultadoGlobal(reporteConNiveles);


    } catch (error) {
        document.getElementById('contenedor-informe').innerHTML = 
            `<p style="color:red;">Error en el procesamiento de datos. Revise el formato de los archivos cargados. Detalle: ${error.message}</p>`;
        console.error(error);
    }
}

// -----------------------------------------------------------------
// 6. FUNCIONES DE RENDERIZACIÓN (Placeholder)
// -----------------------------------------------------------------

function mostrarResultadoGlobal(reporte) {
    const contenedor = document.getElementById('contenedor-informe');
    let html = `<h2>Informe para: ${reporte.metadata.colegio}</h2>`;
    html += `<h3>Resultado Global</h3>`;
    html += `<p>Promedio Histórico ICFES: ${reporte.global.promedioHistorico}</p>`;
    html += `<p>Promedio Simulacro Reciente (${reporte.metadata.ordenSimulacros[reporte.metadata.ordenSimulacros.length - 1]}): ${reporte.global.promedioSimulacroReciente}</p>`;
    html += `<p>Z-Score (Desviación): ${reporte.global.zScore}</p>`;
    
    // Aquí iría el código para generar la gráfica de tendencia (usando Chart.js)
    html += `<h4>Tendencia (Histórico vs. Simulacros):</h4>`;
    reporte.global.tendencia.forEach(t => {
        html += `<li>${t.nombre}: ${t.puntaje.toFixed(2)}</li>`;
    });

    html += `<h4>Distribución de Niveles de Desempeño (Simulacro Reciente):</h4>`;
    if (reporte.global.distribucionNiveles) {
        Object.entries(reporte.global.distribucionNiveles).forEach(([nivel, count]) => {
            html += `<li>${nivel}: ${count} estudiantes</li>`;
        });
    }

    contenedor.innerHTML = html;
}
