document.getElementById('submit').addEventListener('click', function() {
    // 1. Acquisizione Input
    const age = parseFloat(document.getElementById('age').value);
    const education = parseFloat(document.getElementById('education').value);
    const sex = document.getElementById('sex').value;
    
    const card_a = parseFloat(document.getElementById('card_a_time').value);
    const card_b = parseFloat(document.getElementById('card_b_time').value);
    const card_c = parseFloat(document.getElementById('card_c_time').value);
    
    const add_err = parseFloat(document.getElementById('addition_error').value) || 0;
    const omi_err = parseFloat(document.getElementById('omission_error').value) || 0;
    const sub_err = parseFloat(document.getElementById('substitution_error').value) || 0;
    const tra_err = parseFloat(document.getElementById('transposition_error').value) || 0;

    if (isNaN(age) || isNaN(education) || isNaN(card_a) || isNaN(card_b) || isNaN(card_c)) {
        alert("Per favore, inserisci tutti i dati necessari.");
        return;
    }

    const sex_code = (sex === "Female") ? 1 : 0;

    // 2. Calcoli Base (Logica R)
    const VT = card_a + card_b;
    const AHT = card_c * (80 / (80 - omi_err + add_err));
    const Ratio = AHT / VT;
    const Errors = add_err + omi_err + sub_err + tra_err;

    // 3. Equazioni di Correzione (Analisi letterale Shiny)
    const ageTerm = Math.pow(age, 3) - 150382.9;
    const eduTerm = (1 / education) - 0.0854;

    const ES_VT = VT - 0.000012 * ageTerm - 48.074 * eduTerm;
    const ES_AHT = AHT - 0.000017 * ageTerm - 57.49 * eduTerm;
    const ES_Ratio = Ratio - 0.00000016 * ageTerm;
    const ES_Errors = Errors - 3.02 * eduTerm - 0.307 * (sex_code - 0.495);

    // 4. Funzione Equivalent Score
    const getESscore = (val, thresholds) => {
        if (val >= thresholds[0]) return 0;
        if (val >= thresholds[1]) return 1;
        if (val >= thresholds[2]) return 2;
        if (val >= thresholds[3]) return 3;
        return 4;
    };

    const ES_score_VT = getESscore(ES_VT, [40.4, 34.2, 31.9, 29.9]);
    const ES_score_AHT = getESscore(ES_AHT, [45.3, 37.7, 34.7, 32.0]);
    const ES_score_Ratio = getESscore(ES_Ratio, [1.33, 1.18, 1.12, 1.08]);
    const ES_score_Errors = getESscore(ES_Errors, [2.2, 0.9, 0.2, 0.2]);

    // 5. Lookup Percentili
    const vt_vals = [20.9,22.8,24.2,25.3,26.2,26.8,27.5,28.2,28.9,29.4,29.9,30.5,31,31.7,32.5,33.2,33.9,35.2,36.7,39.2,40,40.5,41.2,43.3];
    const aht_vals = [22.1,24.7,26.2,27.1,27.9,28.6,29.3,30.1,30.8,31.5,32,33,33.9,34.7,35.4,36.3,37.5,38.5,39.8,43.4,44.2,45.5,48,49.1];
    const rat_vals = [0.83,0.93,0.95,0.98,1,1.02,1.02,1.03,1.05,1.06,1.08,1.09,1.1,1.12,1.13,1.15,1.16,1.19,1.23,1.29,1.31,1.34,1.37,1.41];
    const err_vals = [-0.5,-0.3,-0.2,-0.1,-0.1,-0.1,-0.1,0,0,0.1,0.2,0.2,0.2,0.2,0.2,0.3,0.9,0.9,1.2,1.9,2.1,2.2,2.9,3.9];
    const percentiles = [99,95,90,85,80,75,70,65,60,55,50,45,40,35,30,25,20,15,10,5,4,3,2,1];

    const lookupPercentile = (val, table) => {
        let minDiff = Infinity;
        let bestP = percentiles[0];
        for (let i = 0; i < table.length; i++) {
            let diff = Math.abs(table[i] - val);
            if (diff <= minDiff) { 
                minDiff = diff;
                bestP = percentiles[i];
            }
        }
        return bestP;
    };

    const results = [
        { var: "VT", raw: VT, corr: ES_VT, es: ES_score_VT, p: lookupPercentile(ES_VT, vt_vals) },
        { var: "AHT", raw: AHT, corr: ES_AHT, es: ES_score_AHT, p: lookupPercentile(ES_AHT, aht_vals) },
        { var: "Ratio", raw: Ratio, corr: ES_Ratio, es: ES_score_Ratio, p: lookupPercentile(ES_Ratio, rat_vals) },
        { var: "Errors", raw: Errors, corr: ES_Errors, es: ES_score_Errors, p: lookupPercentile(ES_Errors, err_vals) }
    ];

    // 6. Rendering Tabella
    const tbody = document.querySelector("#resultsTable tbody");
    tbody.innerHTML = "";
    results.forEach(res => {
        const row = `<tr>
            <td>${res.var}</td>
            <td>${res.raw.toFixed(2)}</td>
            <td>${res.corr.toFixed(2)}</td>
            <td>${res.es}</td>
            <td>${res.p}</td>
        </tr>`;
        tbody.innerHTML += row;
    });

    document.getElementById('results-section').style.display = 'block';
});
