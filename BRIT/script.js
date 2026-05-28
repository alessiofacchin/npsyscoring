// Sequenza dei 30 stimoli del foglio Excel
const sequenzaExcelStimoli = [
    { simbolo: "----",            tipo: "LP" }, 
    { simbolo: ">------<------>", tipo: "ISG" },
    { simbolo: "--------",        tipo: "LG" },
    { simbolo: ">------<------>", tipo: "ISG" },
    { simbolo: "<->-<",           tipo: "IDP" },
    { simbolo: "<->-<",           tipo: "IDP" },
    { simbolo: "<------>------<", tipo: "IDG" },
    { simbolo: ">-<->",           tipo: "ISP" },
    { simbolo: ">------<------>", tipo: "ISG" },
    { simbolo: "----",            tipo: "LP" },
    { simbolo: ">------<------>", tipo: "ISG" },
    { simbolo: "<------>------<", tipo: "IDG" },
    { simbolo: ">------<------>", tipo: "ISG" },
    { simbolo: "----",            tipo: "LP" },
    { simbolo: "<------>------<", tipo: "IDG" },
    { simbolo: "<->-<",           tipo: "IDP" },
    { simbolo: "--------",        tipo: "LG" },
    { simbolo: "<------>------<", tipo: "IDG" },
    { simbolo: "<->-<",           tipo: "IDP" },
    { simbolo: "<------>------<", tipo: "IDG" },
    { simbolo: ">-<->",           tipo: "ISP" },
    { simbolo: "--------",        tipo: "LG" },
    { simbolo: "--------",        tipo: "LG" },
    { simbolo: ">-<->",           tipo: "ISP" },
    { simbolo: "----",            tipo: "LP" },
    { simbolo: ">-<->",           tipo: "ISP" },
    { simbolo: "----",            tipo: "LP" },
    { simbolo: "--------",        tipo: "LG" },
    { simbolo: "<->-<",           tipo: "IDP" },
    { simbolo: ">-<->",           tipo: "ISP" }
];

// Limiti normativi di cut-off
const limitiNormativi = {
    LB80:   { left: -3.2,  right: 3.4 },
    LB160:  { left: -4.8,  right: 4.9 },
    LE:     { left: -6.5,  right: 6.7 },
    SIE80:  { left: -6.4,  right: 7.8 },
    SIE160: { left: -10.2, right: 11.8 }
};

document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("input-table-body");
    
    // Genera l'input numerando progressivamente da 1 a 30
    sequenzaExcelStimoli.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${index + 1}</strong></td>
            <td style="font-family: monospace; font-size: 1.1rem; letter-spacing: 1px;">${item.simbolo}</td>
            <td><input type="number" step="any" class="brit-val" data-tipo="${item.tipo}" placeholder="mm" id="input-${index}"></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById("btn-calcola").addEventListener("click", eseguiScoringBRIT);
});

function eseguiScoringBRIT() {
    const inputs = document.querySelectorAll(".brit-val");
    const gruppi = { ISP: [], LP: [], IDP: [], ISG: [], LG: [], IDG: [] };

    inputs.forEach(inp => {
        const val = parseFloat(inp.value);
        if (!isNaN(val)) {
            gruppi[inp.dataset.tipo].push(val);
        }
    });

    const media = (arr) => arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;

    // 1. Calcolo Medie
    const medie = {
        ISP: media(gruppi.ISP),
        LP:  media(gruppi.LP),
        IDP: media(gruppi.IDP),
        ISG: media(gruppi.ISG),
        LG:  media(gruppi.LG),
        IDG: media(gruppi.IDG)
    };

    document.getElementById("row-medie").innerHTML = `
        <td>${medie.ISP.toFixed(2)}</td>
        <td>${medie.LP.toFixed(2)}</td>
        <td>${medie.IDP.toFixed(2)}</td>
        <td>${medie.ISG.toFixed(2)}</td>
        <td>${medie.LG.toFixed(2)}</td>
        <td>${medie.IDG.toFixed(2)}</td>
    `;

    // 2. Effetti Illusori
    const effSinPiccola = medie.ISP - medie.LP;
    const effDesPiccola = medie.IDP - medie.LP;
    const effSinGrande  = medie.ISG - medie.LG;
    const effDesGrande  = medie.IDG - medie.LG;

    document.getElementById("eff-sin-piccola").innerText = effSinPiccola.toFixed(2);
    document.getElementById("eff-des-piccola").innerText = effDesPiccola.toFixed(2);
    document.getElementById("eff-sin-grande").innerText  = effSinGrande.toFixed(2);
    document.getElementById("eff-des-grande").innerText  = effDesGrande.toFixed(2);

    // 3. Variabili Globali Osservate (Raw)
    const obs_lb80   = medie.LP;
    const obs_lb160  = medie.LG;
    const obs_le     = (100 * obs_lb160 / 80) - (100 * obs_lb80 / 40);
    const obs_sie80  = effDesPiccola + effSinPiccola;
    const obs_sie160 = effDesGrande + effSinGrande;

    document.getElementById("obs-lb80").innerText   = obs_lb80.toFixed(2);
    document.getElementById("obs-lb160").innerText  = obs_lb160.toFixed(2);
    document.getElementById("obs-le").innerText     = obs_le.toFixed(2);
    document.getElementById("obs-sie80").innerText  = obs_sie80.toFixed(2);
    document.getElementById("obs-sie160").innerText = obs_sie160.toFixed(2);

    // 4. Calcolo Punteggi Corretti per Età secondo formule Excel specifiche
    const age = parseFloat(document.getElementById("paziente-eta").value) || 63;
    
    // Calcolo del fattore logaritmico ln(100 - age) - 3.61
    const logAgeFactor = (100 - age) > 0 ? (Math.log(100 - age) - 3.61) : 0;

    const cor_lb80   = obs_lb80;
    // Formula Richiesta: LB160 corrected = raw + 1.528 * (ln(100-age) - 3.61)
    const cor_lb160  = obs_lb160 + (1.528 * logAgeFactor);
    const cor_le     = obs_le;
    const cor_sie80  = obs_sie80;
    // Formula Richiesta: SIE160 corrected = raw - 4.265 * (ln(100-age) - 3.61)
    const cor_sie160 = obs_sie160 - (4.265 * logAgeFactor);

    document.getElementById("cor-lb80").innerText   = cor_lb80.toFixed(2);
    document.getElementById("cor-lb160").innerText  = cor_lb160.toFixed(2);
    document.getElementById("cor-le").innerText     = cor_le.toFixed(2);
    document.getElementById("cor-sie80").innerText  = cor_sie80.toFixed(2);
    document.getElementById("cor-sie160").innerText = cor_sie160.toFixed(2);

    // 5. Generazione della Tabella di Valutazione Direzionale
    const punteggiCorretti = { LB80: cor_lb80, LB160: cor_lb160, LE: cor_le, SIE80: cor_sie80, SIE160: cor_sie160 };
    const tbodyValutazione = document.getElementById("valutazione-rows");
    tbodyValutazione.innerHTML = "";

    Object.keys(punteggiCorretti).forEach(chiave => {
        const val = punteggiCorretti[chiave];
        const limiti = limitiNormativi[chiave];
        
        let esito = "Normale";
        let colorCode = "#2E7D32"; // Verde

        if (val < limiti.left) {
            esito = "Bias a sinistra";
            colorCode = "#C62828"; // Rosso
        } else if (val > limiti.right) {
            esito = "Bias a destra";
            colorCode = "#0288D1"; // Blu
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${chiave}</strong></td>
            <td>${val.toFixed(2)}</td>
            <td style="font-weight: bold; color: ${colorCode};">${esito}</td>
        `;
        tbodyValutazione.appendChild(tr);
    });

    // Mostra i risultati a schermo
    document.getElementById("results-card").style.display = "block";
    document.getElementById("results-card").scrollIntoView({ behavior: 'smooth' });
}