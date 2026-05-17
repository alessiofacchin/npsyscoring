// --- DATI DI RIFERIMENTO (EQUIVALENTI E PERCENTILI) ---
const equivTable = {
    SA:  { scores: [0, 1, 2, 3, 4], limits: [[97.4, Infinity], [74.8, 97.3], [67.1, 74.7], [61.5, 67.0], [-Infinity, 61.5]] },
    OA:  { scores: [0, 1, 2, 3, 4], limits: [[98.9, Infinity], [67.9, 98.8], [55.6, 67.8], [46.3, 55.5], [-Infinity, 46.3]] },
    FA:  { scores: [0, 1, 2, 3, 4], limits: [[49.2, Infinity], [24.8, 49.1], [15.5, 24.7], [8.4, 15.4], [-Infinity, 8.4]] },
    Err: { scores: [0, 1, 2, 3, 4], limits: [[35.2, Infinity], [23.1, 35.1], [18.1, 23.0], [14.7, 18.0], [-Infinity, 14.7]] }
};

const percentileTable = [
    {p: 99, SA: 38.4, OA: 4.5,   FA: -29.3, Err: 1},
    {p: 95, SA: 42.2, OA: 12.9,  FA: -13.7, Err: 4.3},
    {p: 90, SA: 45.5, OA: 22.2,  FA: -8.8,  Err: 6.1},
    {p: 85, SA: 47.6, OA: 27.2,  FA: -4.9,  Err: 7.4},
    {p: 80, SA: 50.7, OA: 30.2,  FA: -2.7,  Err: 8.3},
    {p: 75, SA: 52.5, OA: 34.1,  FA: -0.5,  Err: 9.9},
    {p: 70, SA: 54.0, OA: 36.4,  FA: 1.4,   Err: 10.9},
    {p: 65, SA: 55.8, OA: 38.2,  FA: 2.9,   Err: 11.9},
    {p: 60, SA: 57.4, OA: 41.3,  FA: 4.9,   Err: 12.9},
    {p: 55, SA: 59.9, OA: 44.0,  FA: 6.4,   Err: 13.7},
    {p: 50, SA: 61.5, OA: 46.2,  FA: 8.4,   Err: 14.7},
    {p: 45, SA: 63.1, OA: 48.6,  FA: 10.7,  Err: 15.9},
    {p: 40, SA: 65.0, OA: 51.5,  FA: 13.5,  Err: 16.7},
    {p: 35, SA: 67.1, OA: 55.1,  FA: 15.4,  Err: 18.0},
    {p: 30, SA: 69.7, OA: 58.4,  FA: 17.3,  Err: 19.2},
    {p: 25, SA: 71.6, OA: 61.0,  FA: 19.6,  Err: 20.3},
    {p: 20, SA: 74.0, OA: 66.7,  FA: 23.6,  Err: 22.6},
    {p: 15, SA: 77.8, OA: 72.9,  FA: 27.4,  Err: 24.3},
    {p: 10, SA: 83.7, OA: 78.9,  FA: 32.8,  Err: 27.5},
    {p: 5,  SA: 92.5, OA: 88.5,  FA: 44.1,  Err: 31.3},
    {p: 4,  SA: 96.9, OA: 95.1,  FA: 45.6,  Err: 33.5},
    {p: 3,  SA: 98.0, OA: 100.8, FA: 50.9,  Err: 35.5},
    {p: 2,  SA: 102.1,OA: 107.7, FA: 56.5,  Err: 38.1},
    {p: 1,  SA: 114.1,OA: 120.3, FA: 60.5,  Err: 45.0}
];

// --- FUNZIONI LOGICHE ---
function calcEquivalentScore(value, varname) {
    const config = equivTable[varname];
    for (let i = 0; i < config.limits.length; i++) {
        const lim = config.limits[i];
        if (value >= lim[0] && value <= lim[1]) {
            return config.scores[i];
        }
    }
    return null;
}

function findClosestPercentile(value, varname) {
    let minDiff = Infinity;
    let closestP = null;
    for (let row of percentileTable) {
        let diff = Math.abs(row[varname] - value);
        if (diff < minDiff) {
            minDiff = diff;
            closestP = row.p;
        }
    }
    return closestP;
}

function getNum(id) {
    const val = parseFloat(document.getElementById(id).value);
    return isNaN(val) ? 0 : val;
}

// --- LOGICA DI CALCOLO ---
document.getElementById('calculate-btn').addEventListener('click', function() {
    // Input anagrafici
    const age = getNum('age');
    const education = getNum('education');
    const sex = parseFloat(document.getElementById('sex').value);

    // Recupero matrici input (sostituisce rhandsontable con fallback a 0)
    const time = [getNum('t_1'), getNum('t_2'), getNum('t_3'), getNum('t_4')];
    const omissions = [getNum('o_1'), getNum('o_2'), getNum('o_3'), getNum('o_4')];
    const selfcorr = [getNum('c_1'), getNum('c_2'), getNum('c_3'), getNum('c_4')];
    const substit = [getNum('s_1'), getNum('s_2'), getNum('s_3'), getNum('s_4')];

    // Performance Time per card
    const perfTime = [];
    let totalErrors = 0;

    for (let i = 0; i < 4; i++) {
        perfTime[i] = (25 * time[i]) / (25 - omissions[i]);
        totalErrors += omissions[i] + selfcorr[i] + substit[i];
    }

    // Calcolo Indici Base
    const SA = perfTime[0];
    const OA = ((perfTime[2] + perfTime[3]) / 2) - ((perfTime[0] + perfTime[1]) / 2);
    const FA = ((perfTime[1] + perfTime[3]) / 2) - ((perfTime[0] + perfTime[2]) / 2);
    const Err = totalErrors;

    // Calcolo punteggi corretti (Formule R duplicate in JS)
    const SA_corr = SA + 13.796 * (Math.log(86.9 - age) - 3.628) - 129.5 * ((1 / education) - 0.081);
    const OA_corr = OA - 0.00004 * (Math.pow(age, 3) - 129295);
    const FA_corr = FA - 0.000019 * (Math.pow(age, 3) - 129295);
    const Err_corr = Err + 195.11 * ((1 / age) - 0.0251) - 38.13 * ((1 / education) - 0.0812) + 2.6 * (sex - 0.47);

    // Equivalenti e Percentili
    const eq_SA = calcEquivalentScore(SA_corr, "SA");
    const eq_OA = calcEquivalentScore(OA_corr, "OA");
    const eq_FA = calcEquivalentScore(FA_corr, "FA");
    const eq_Err = calcEquivalentScore(Err_corr, "Err");

    const p_SA = findClosestPercentile(SA_corr, "SA");
    const p_OA = findClosestPercentile(OA_corr, "OA");
    const p_FA = findClosestPercentile(FA_corr, "FA");
    const p_Err = findClosestPercentile(Err_corr, "Err");

    // --- AGGIORNAMENTO UI TABELLE ---
    
    // Tabella 1: Performance Time
    const perfBody = document.getElementById('perf-time-tbody');
    perfBody.innerHTML = '';
    for(let i=0; i<4; i++) {
        perfBody.innerHTML += `<tr><td>Card ${i+1}</td><td>${perfTime[i].toFixed(2)}</td></tr>`;
    }

    // Tabella 2: Calcoli Variabili e Indici
    const indicesBody = document.getElementById('indices-tbody');
    const outputData = [
        { name: "SA", val: SA, corr: SA_corr, eq: eq_SA, p: p_SA },
        { name: "OA", val: OA, corr: OA_corr, eq: eq_OA, p: p_OA },
        { name: "FA", val: FA, corr: FA_corr, eq: eq_FA, p: p_FA },
        { name: "Total Errors", val: Err, corr: Err_corr, eq: eq_Err, p: p_Err }
    ];

    indicesBody.innerHTML = '';
    outputData.forEach(item => {
        indicesBody.innerHTML += `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.val.toFixed(2)}</td>
                <td>${item.corr.toFixed(2)}</td>
                <td>${item.eq !== null ? item.eq : 'N/A'}</td>
                <td>${item.p !== null ? item.p : 'N/A'}</td>
            </tr>
        `;
    });

    // Mostra la card dei risultati
    document.getElementById('results-card').style.display = 'block';
});