// ---- Tabella di conversione ----
const conversionTable = {
    span_corr: [7.03,6.39,6.23,6.00,5.72,5.50,5.43,5.32,5.22,5.06,4.97,4.80,4.65,4.53,4.43,4.37,4.25,4.10,3.88,3.61,3.53,3.43,3.42,3.34],
    supraspan_corr: [29.63,27.25,25.75,24.96,23.65,22.88,22.10,21.31,20.79,20.22,19.33,18.39,17.66,16.86,15.98,14.44,12.92,11.83,11.16,9.03,8.28,6.80,6.04,4.55],
    supraspan_diff_corr: [2,1.82,1.7,1.6,1.55,1.49,1.43,1.37,1.33,1.29,1.24,1.19,1.08,0.98,0.89,0.79,0.69,0.59,0.49,0.25,0.19,0.16,0.10,-0.02],
    percentile: [99, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 4, 3, 2, 1]
};

// ---- Funzione lookup percentile ----
function percentileLookup(value, variable) {
    const vector = conversionTable[variable];
    let minDiff = Infinity;
    let idx = 0;

    for (let i = 0; i < vector.length; i++) {
        let diff = Math.abs(vector[i] - value);
        if (diff < minDiff) {
            minDiff = diff;
            idx = i;
        }
    }
    return conversionTable.percentile[idx];
}

// Funzione di utilità per leggere i numeri convertendo la virgola in punto
function getNumericValue(id) {
    let valStr = document.getElementById(id).value.trim();
    valStr = valStr.replace(',', '.'); // Converte l'eventuale virgola in punto
    const val = parseFloat(valStr);
    return isNaN(val) ? 0 : val; // Se vuoto o non valido, restituisce 0
}

// ---- Event Listener sul Bottone Calcola ----
document.getElementById('calcola').addEventListener('click', function() {
    
    // Lettura dei dati con tolleranza per la virgola
    const eta = getNumericValue('eta');
    const scolarita = getNumericValue('scolarita');
    const span = getNumericValue('span');
    const supraspan = getNumericValue('supraspan');
    const supraspan_diff = getNumericValue('supraspan_diff');

    // Controllo di sicurezza per evitare errori matematici
    if (eta <= 0 || scolarita <= 0 || span <= 0) {
        alert("Attenzione: Età, Scolarità e Span devono essere maggiori di 0 per poter applicare i logaritmi e le radici della formula.");
        return;
    }

    // ---- Calcoli di regressione (Formule Originali R) ----
    const span_corr = span + 0.7616 * (Math.log(eta) - 3.864) - 0.4229 * (Math.sqrt(scolarita) - 3.555);
    
    const supraspan_corr = supraspan + 0.841 * (Math.sqrt(eta) - 7.044) - 2.852 * (Math.sqrt(scolarita) - 3.555) - 8.855 * (Math.sqrt(span) - 2.218);
    
    const supraspan_diff_corr = supraspan_diff + 0.0747 * (Math.sqrt(eta) - 7.044) - 0.271 * (Math.log(scolarita) - 2.497) - 0.491 * (Math.log(span) - 1.582);

    // ---- Calcolo punteggi equivalenti ----
    let span_eq;
    if (span_corr <= 3.43) span_eq = "0";
    else if (span_corr < 4.22) span_eq = "1";
    else if (span_corr < 4.53) span_eq = "2";
    else if (span_corr <= 4.97) span_eq = "3";
    else span_eq = "4";

    let supraspan_eq;
    if (supraspan_corr <= 6.75) supraspan_eq = "0";
    else if (supraspan_corr < 12.68) supraspan_eq = "1";
    else if (supraspan_corr < 16.64) supraspan_eq = "2";
    else if (supraspan_corr <= 19.37) supraspan_eq = "3";
    else supraspan_eq = "4";

    let supraspan_diff_eq;
    if (supraspan_diff_corr <= 0.16) supraspan_diff_eq = "0";
    else if (supraspan_diff_corr < 0.66) supraspan_diff_eq = "1";
    else if (supraspan_diff_corr < 0.98) supraspan_diff_eq = "2";
    else if (supraspan_diff_corr <= 1.24) supraspan_diff_eq = "3";
    else supraspan_diff_eq = "4";

    // ---- Calcolo percentili ----
    const span_corr_percentile = percentileLookup(span_corr, "span_corr");
    const supraspan_corr_percentile = percentileLookup(supraspan_corr, "supraspan_corr");
    const supraspan_diff_corr_percentile = percentileLookup(supraspan_diff_corr, "supraspan_diff_corr");

    // ---- Mostra e Popola i Risultati nella Tabella ----
    
    // Riga Span
    document.getElementById('out-span-grezzo').innerText = span;
    document.getElementById('out-span-corr').innerText = span_corr.toFixed(2);
    document.getElementById('out-span-eq').innerText = span_eq;
    document.getElementById('out-span-perc').innerText = span_corr_percentile;

    // Riga Supraspan
    document.getElementById('out-sup-grezzo').innerText = supraspan;
    document.getElementById('out-sup-corr').innerText = supraspan_corr.toFixed(2);
    document.getElementById('out-sup-eq').innerText = supraspan_eq;
    document.getElementById('out-sup-perc').innerText = supraspan_corr_percentile;

    // Riga Supraspan Differito
    document.getElementById('out-supdiff-grezzo').innerText = supraspan_diff;
    document.getElementById('out-supdiff-corr').innerText = supraspan_diff_corr.toFixed(2);
    document.getElementById('out-supdiff-eq').innerText = supraspan_diff_eq;
    document.getElementById('out-supdiff-perc').innerText = supraspan_diff_corr_percentile;

    // Rende visibile la card dei risultati
    document.getElementById('risultati-card').style.display = 'block';
    
    // Scroll automatico verso i risultati
    document.getElementById('risultati-card').scrollIntoView({ behavior: 'smooth' });
});