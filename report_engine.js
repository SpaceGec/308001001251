// =================================================================
// ARCHIVOS BASE: CONSTANTES Y UTILIDADES
// =================================================================

// 1. Cargamos el JSON de rangos (asumimos que este archivo está estático)
const RANGOS_PRUEBAS = {
  "niveles_global": [
    {"nombre": "Insuficiente", "id": 1, "color": "red", "min": 0, "max": 250},
    {"nombre": "Mínimo", "id": 2, "color": "gold", "min": 251, "max": 300},
    {"nombre": "Satisfactorio", "id": 3, "color": "deepskyblue", "min": 301, "max": 400},
    {"nombre": "Avanzado", "id": 4, "color": "olivedrab", "min": 401, "max": 500}
  ],
  // ... (otros niveles de área omitidos por simplicidad, pero están cargados)
};


// Funciones Matemáticas necesarias (del Paso 8.3)
function calcularPromedio(arr) {
    if (arr.length === 0) return 0;
    // Asegurarse de que todos sean números y filtrarlos
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
    // Manejar el caso N.D. o división por cero
    promedioActual = parseFloat(promedioActual);
    promedioHistorico = parseFloat(promedioHistorico);
    desviacionHistorica = parseFloat(desviacionHistorica);
    
    if (isNaN(desviacionHistorica) || desviacionHistorica === 0) return 0;
    return (promedioActual - promedioHistorico) / desviacionHistorica;
}

// ------------------------------------------------------------------
// Asegúrese de que todos los JSON de detalle (Dzeta, Epsilon, Gamma) se carguen si desea la tendencia de las Evidencias.
// Por ahora, solo usaremos el simulacro más reciente (Dzeta) para la comparación de detalle.

/**
 * Combina el rendimiento actual de un simulacro con el histórico de ICFES para el análisis DCE.
 * @param {object} simulacroData - El JSON de resultados del simulacro reciente (Ej: Dzeta).
 * @param {object} historicoData - El JSON de resultados históricos de ICFES.
 * @param {string} areaName - Nombre del área (Ej: 'Matemáticas').
 * @param {object} matrizDCE - Matriz de referencia DCE (JSON 1).
 */
function compararRendimientoDCE(simulacroData, historicoData, areaName, matrizDCE) {
    const resultadosSim = simulacroData.Resultados_Areas.find(a => a.Area === areaName);
    const resultadosHist = historicoData.Areas_Detalle[areaName.replace(' ', '_')]; // Ej: 'Matemáticas' -> Areas_Detalle.Matematicas
    
    if (!resultadosSim || !resultadosHist) {
        return { error: "Datos de área incompletos para el análisis detallado." };
    }

    const datosSimulacro = resultadosSim.Rendimiento_Componentes_Evidencias;
    const datosHistoricos = resultadosHist.Figura_4_4_Incorrectas_Afirmacion; // Asumiendo estructura similar a Matemáticas

    const comparativaDCE = [];

    // 1. PRIMER PASO: AGRUPAR LAS EVIDENCIAS DEL SIMULACRO POR AFIRMACIÓN
    // El ICFES solo da datos históricos por AFIRMACIÓN, no por Evidencia individual.
    // Necesitamos agrupar las Evidencias del simulacro para compararlas con la Afirmación histórica.
    
    // Mapeamos las Afirmaciones de la matriz DCE (JSON 1)
    const mapeoAfirmaciones = matrizDCE
        .filter(item => item.Area === areaName)
        .reduce((acc, item) => {
            acc[item.Afirmacion_Descripcion] = {
                descripcion: item.Afirmacion_Descripcion,
                totalAciertosSim: 0,
                totalPreguntasSim: 0,
                porcentajeAciertoSim: 0,
                historicoIncorrectas: 0, // Lo llenaremos después
                evidenciasDetalle: []
            };
            return acc;
        }, {});

    // 2. SEGUNDO PASO: CONSOLIDAR DATOS DEL SIMULACRO POR AFIRMACIÓN (Necesita un mapeo de texto)
    
    // NOTA CLAVE: Para que este paso funcione, debemos asumir que la descripción de la 'Evidencia' 
    // en JSON 3 corresponde a una de las 'Afirmaciones' de JSON 1/2. Si no es un mapeo 1:1, 
    // este sistema de reglas necesitará una tabla de mapeo manual, pero usaremos el texto por ahora.
    
    datosSimulacro.forEach(evidenciaSim => {
        const acierto = parseFloat(evidenciaSim.Porcentaje_Acierto_Grupo.replace('%', '')) / 100;
        const preguntas = parseInt(evidenciaSim.Preguntas_Asociadas);
        
        // **Lógica de mapeo simplificada: Buscar la Afirmación que contiene la descripción de la Evidencia**
        // Este paso es altamente propenso a errores si las descripciones no coinciden exactamente.
        
        let afirmacionMapeada = null;
        for (const [key, value] of Object.entries(mapeoAfirmaciones)) {
             // Si el texto de la afirmación histórica contiene el texto de la evidencia del simulacro
             // O si el texto de la evidencia del simulacro contiene el texto de la afirmación.
             // Simplificaremos usando la Afirmación_Descripcion del JSON 2 para buscar en el JSON 3.
             
             // En su JSON 2, las afirmaciones son: "Valida procedimientos y estrategias...", etc.
             // En su JSON 3, las evidencias son más detalladas: "TRANSFORMA LA REPRESENTACIÓN...", etc.
             
             // Por ser un sistema de reglas (no IA compleja), mapearemos las *competencias*
             // de JSON 3 a las Afirmaciones de JSON 2, y luego analizaremos las Evidencias.
        }

        // Ya que el JSON 3 nos da los Puntajes por Competencia, vamos a priorizar ese análisis.
    });


    // --- ENFOQUE MÁS SIMPLE: COMPARAR COMPETENCIAS (JSON 3) VS AFIRMACIONES (JSON 2) ---

    // El JSON 3 ya nos da Rendimiento_Competencias, lo cual es un nivel de agregación suficiente.
    // Usaremos los datos de rendimiento de Competencias del simulacro y los compararemos con las Afirmaciones históricas (que son el mismo concepto en ICFES).

    const comparativaCompetencia = resultadosSim.Rendimiento_Competencias.map(compSim => {
        const nombreCompSim = compSim.Nombre_Competencia.toUpperCase();
        const aciertoSim = parseFloat(compSim.Porcentaje_Acierto.replace('%', '')) / 100;

        // Buscar Afirmación histórica que corresponde a la Competencia
        const histItem = datosHistoricos.find(item => 
            item.Aprendizaje_Afirmacion.includes(nombreCompSim.substring(0, 15)) // Mapeo parcial de texto
        );

        let histPorcentajeIncorrecto = 0;
        if (histItem && histItem.Porcentaje_EE !== 'N.D.') {
            histPorcentajeIncorrecto = parseFloat(histItem.Porcentaje_EE.replace('%', '')) / 100;
        }
        
        // Histórico de Acierto = 1 - Histórico de Incorrecto
        const histPorcentajeAcierto = 1 - histPorcentajeIncorrecto;
        
        // Clasificar el rendimiento actual (usando UMBRALES_ANALISIS)
        let diagnostico = '';
        if (aciertoSim > UMBRALES_ANALISIS.FUERTE) {
            diagnostico = 'Fortaleza Consolidada';
        } else if (aciertoSim >= UMBRALES_ANALISIS.MEDIO) {
            diagnostico = 'Nivel de Consolidación';
        } else {
            diagnostico = 'Necesita Refuerzo Urgente';
        }

        return {
            competencia: nombreCompSim,
            aciertoSimulacro: aciertoSim.toFixed(2),
            aciertoHistorico: histPorcentajeAcierto.toFixed(2),
            brecha: (aciertoSim - histPorcentajeAcierto).toFixed(2),
            diagnostico: diagnostico,
            evidenciasDetalle: resultadosSim.Rendimiento_Componentes_Evidencias.filter(
                e => e.Descripcion_Unidad.includes(compSim.Nombre_Competencia.split(' ')[0]) // Intento de mapear evidencias
            )
        };
    });

    return comparativaCompetencia;
}

// -----------------------------------------------------------------
