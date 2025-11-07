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
