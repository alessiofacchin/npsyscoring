function calcolaPE(val, c0, c1, c2, c3) {
    if (val >= c0) return 0;
    if (val >= c1) return 1;
    if (val >= c2) return 2;
    if (val >= c3) return 3;
    return 4;
}

function formatPE(elementId, pe) {
    let el = document.getElementById(elementId);
    el.innerText = pe;
    el.className = ""; // Reset delle classi precedenti
    if (pe === 0) el.classList.add('pe-0');
    if (pe === 4) el.classList.add('pe-4');
}

function calcola() {
    // 1. Estrazione ed elaborazione input demografici
    let eta = parseFloat(document.getElementById('eta').value);
    let scolarita = parseFloat(document.getElementById('scolarita').value);
    let sesso = parseFloat(document.getElementById('sesso').value);

    if (isNaN(eta) || isNaN(scolarita) || isNaN(sesso)) {
        alert("Per favore, compila correttamente Età, Scolarità e Sesso.");
        return;
    }

    // 2. Estrazione ed elaborazione input punteggi grezzi
    let srt = parseFloat(document.getElementById('srt_raw').value);
    let gng = parseFloat(document.getElementById('gng_raw').value);
    let ls = parseFloat(document.getElementById('ls_raw').value);
    let rs = parseFloat(document.getElementById('rs_raw').value);
    let li = parseFloat(document.getElementById('li_raw').value);
    let ri = parseFloat(document.getElementById('ri_raw').value);

    if (isNaN(srt) || isNaN(gng) || isNaN(ls) || isNaN(rs) || isNaN(li) || isNaN(ri)) {
        alert("Per favore, inserisci tutti i punteggi grezzi richiesti.");
        return;
    }

    // Componenti logaritmiche fisse (Logaritmo Naturale Math.log)
    let logAge = Math.log(97.9 - eta);
    let logEdu = Math.log(scolarita);
    
    // 3. Calcolo dei fattori di correzione da sommare al grezzo
    let adj_srt = 70.21 * (logAge - 3.8) + 33.63 * (logEdu - 2.38);
    let adj_gng = 99.58 * (logAge - 3.8) + 27.53 * sesso - 0.49;
    let adj_ls =  67.19 * (logAge - 3.8) + 21.26 * sesso - 0.49;
    let adj_rs =  63.65 * (logAge - 3.8) + 21.23 * sesso - 0.49;
    let adj_li =  70.37 * (logAge - 3.8) + 24.26 * sesso - 0.49;
    let adj_ri =  65.85 * (logAge - 3.8) + 28.19 * sesso - 0.49;

    // Punteggi Corretti (Arrotondati all'intero più vicino per il confronto con i cut-off)
    let c_srt = Math.round(srt + adj_srt);
    let c_gng = Math.round(gng + adj_gng);
    let c_ls = Math.round(ls + adj_ls);
    let c_rs = Math.round(rs + adj_rs);
    let c_li = Math.round(li + adj_li);
    let c_ri = Math.round(ri + adj_ri);

    // 4. Calcolo dell'indice Delta sui punteggi già corretti
    let delta = Math.round(((c_rs + c_ri) / 2) - ((c_ls + c_li) / 2));

    // 5. Assegnazione dei Punteggi Equivalenti (PE)
    let pe_srt = calcolaPE(c_srt, 403, 266, 219, 199);
    let pe_gng = calcolaPE(c_gng, 542, 418, 374, 344);
    let pe_ls = calcolaPE(c_ls, 446, 286, 249, 224);
    let pe_rs = calcolaPE(c_rs, 412, 294, 254, 228);
    let pe_li = calcolaPE(c_li, 436, 285, 256, 232);
    let pe_ri = calcolaPE(c_ri, 385, 290, 258, 237);

    // 6. Scrittura e aggiornamento del DOM della tabella risultati
    document.getElementById('srt_g').innerText = Math.round(srt);
    document.getElementById('gng_g').innerText = Math.round(gng);
    document.getElementById('ls_g').innerText = Math.round(ls);
    document.getElementById('rs_g').innerText = Math.round(rs);
    document.getElementById('li_g').innerText = Math.round(li);
    document.getElementById('ri_g').innerText = Math.round(ri);

    document.getElementById('srt_c').innerText = c_srt;
    document.getElementById('gng_c').innerText = c_gng;
    document.getElementById('ls_c').innerText = c_ls;
    document.getElementById('rs_c').innerText = c_rs;
    document.getElementById('li_c').innerText = c_li;
    document.getElementById('ri_c').innerText = c_ri;

    formatPE('srt_pe', pe_srt);
    formatPE('gng_pe', pe_gng);
    formatPE('ls_pe', pe_ls);
    formatPE('rs_pe', pe_rs);
    formatPE('li_pe', pe_li);
    formatPE('ri_pe', pe_ri);

    // 7. Gestione clinica e visualizzazione dell'indice Delta
    document.getElementById('delta_val').innerText = delta;
    let deltaStatus = document.getElementById('delta_status');
    
    if (delta >= 99) {
        deltaStatus.innerText = "Asimmetria destra: Cut-off Superato. TR maggiori a destra";
        deltaStatus.className = "note delta-alert";
    } else if (delta <= -84) {
        deltaStatus.innerText = "Asimmetria sinistra: Cut-off Superato. TR maggiori a sinistra";
        deltaStatus.className = "note delta-alert";
    } else {
        deltaStatus.innerText = "Performance nella Norma";
        deltaStatus.className = "note delta-ok";
    }

    // Mostra la scheda dei risultati
    document.getElementById('results').style.display = "block";
}