# Prova locale: terreno e raccordo Arcamis

Avvio: `node prototypes/flight/server.mjs`, quindi http://localhost:4186/.

Questa cartella è una prova locale, esterna a `dist`. Nessuna modifica alla produzione.

## Sorgenti

- `assets/world-v2.png`: proposta generata con lo strumento image_gen integrato, usando `dist/assets/world-continuous.png` come bersaglio e `dist/assets/marchesato.png` come riferimento geografico.
- Le tavole illustrate usano le immagini regionali originali, senza modifiche, in una finestra statica senza zoom o inclinazione.
- «Esplora» avvicina la stessa scena della mappa grande per Arcamis, Aurenthar, Virturia, Dolkrid e Valgari, senza cambiare texture.
- Le tavole statiche includono anche Foreste Antiche. Chiuderle ripristina il contesto della mappa sottostante; i comandi di zoom non agiscono mentre la tavola è aperta.

## Vincoli del prompt di modifica

Ricostruire il sud-est della mappa grande seguendo la tavola singola: penisola di Arcamis a nord-est, Volonx più a sud sulla costa orientale; Lago di Gromot nell'entroterra orientale a est dei rilievi di Vigilius; fiume e piccolo lago a sud-ovest di Vigilius; Galeton a sud-est, Riva di Ferro a sud-ovest, Fumofosco fra i rilievi centro-occidentali e Kaldur a sud della foresta centrale. Preservare Selva Fogliabruna, Foresta dello Smarrimento e foresta centrale nelle loro posizioni relative.

La Foresta Infinita entra dal nord-ovest del Marchesato, a nord-ovest di Forte Vigilus, prosegue nell'entroterra occidentale di Valgari, lasciando la città costiera visibile a est, e termina verso ovest/sud-ovest fra Pianure Centrali e Dolkrid. Fascia irregolare continua, mai un anello intorno a Valgari. Foreste Antiche sono un territorio distinto.

Mantenere il resto del mondo riconoscibile: rilievi nord-occidentali, ducato settentrionale, Aurenthar, baie di Dolkrid e grande mare orientale. Aspetto pittorico naturalistico della tavola regionale, vista verticale. Niente testo, cornice, bussola, mostri marini o navi. I nomi appartengono all'interfaccia.

## Dettagli 3D della prova

- Terreno a griglia, con rilievi ricostruiti per le catene principali e acqua mantenuta piatta.
- Alberi geometrici collocati secondo i colori di chioma già presenti nella texture: nessuna nuova maschera di foresta ad anello.
- Primi edifici geometrici, ancorati alle città della nuova proposta.
- Dissolvenza dei dettagli fra zoom 2.1 e 3.3; nessuna chiamata di disegno del livello dettagli sotto la soglia.
- Camera e dettagli usano la stessa proiezione prospettica.

## Limiti da valutare

La nuova illustrazione è una proposta di raccordo geografico generata, non una registrazione pixel per pixel della tavola originale. Rimane da convalidare il tracciato della Foresta Infinita e la corrispondenza di tutti i dettagli regionali prima di sostituire asset pubblici. Gli edifici sono modelli geometrici preliminari, non modelli GLTF definitivi. La risoluzione della texture resta un limite allo zoom molto ravvicinato.

Verifiche: sintassi dei moduli, caricamento nel browser, mappa completa, avvicinamento continuo ad Arcamis, riferimento originale, zoom/trascinamento e assenza di errori nella console durante queste prove.
