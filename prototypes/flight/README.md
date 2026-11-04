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

### Edifici senza etichetta nelle Pianure Centrali e a Dolkrid

La copertura include anche 10 gruppi di edifici senza nome già disegnati sulla carta: quattro nelle Pianure Centrali e sei nelle Baronie di Dolkrid. Le posizioni sono state controllate sulla texture originale ingrandita; i massi costieri non sono trattati come case. Gli identificatori sono solo interni, senza nuove etichette o lore inventata per i player.

La capacità delle maschere nel materiale del terreno segue il numero effettivo dei monumenti: non è più fissata ai soli dodici luoghi nominati. La nuova texture `rural-ground.png` viene usata soltanto nelle piccole aree di sostituzione, proteggendo l'acqua e conservando il resto della carta originale. La dissolvenza termina prima delle viste regionali, così gli edifici non restano semitrasparenti durante l'esplorazione di Pianure e Baronie.

Creato con image_gen integrato; prompt esatto: `assets/rural-ground-prompt.txt`. La pagina locale `building-audit.html` è servita per il controllo delle coordinate e non fa parte del sito pubblicato.

### Estensione agli insediamenti nominati

Il catalogo `landmarks.mjs` definisce 12 monumenti: Aurenthar, Valoria, Artoria, Valgari, Forte Vigilus, Arcamis, Volonx, Vigilius, Galeton, Riva di Ferro, Fumofosco e Vallespiga. Sono rappresentazioni stilizzate delle tipologie già indicate dalle mappe: castelli e fortezze, torri, borghi, edifici portuali e il mulino. Non rappresentano nuovi edifici canonici o nuove informazioni di lore.

La texture `assets/towns-ground.png`, generata con image_gen integrato, è campionata solo nelle piccole aree di sostituzione dei monumenti durante lo zoom. L'immagine principale e tutte le tavole regionali restano intatte. Il prompt esatto è in `assets/towns-ground-prompt.txt`. L'acqua originale è protetta dalla maschera e la geometria dei rilievi resta quella esistente.

Le coordinate sono condivise fra monumenti, nomi e schede. La ricerca trova anche Valoria, Artoria e Vallespiga. `tests/landmarks.test.mjs` verifica copertura degli insediamenti, limiti delle aree di sostituzione, triangoli finiti, assenza di alberi 3D, gerarchia e collisioni delle etichette. Verificate nel browser le schede di tutti e 12 i luoghi.

### Aggiornamento locale: monumento e schede

Il monumento di Aurenthar ha torri, merli, finestre, coperture a padiglione, materiali procedurali e ombra di contatto. A zoom ravvicinato una piccola zona della texture sotto Aurenthar sfuma verso un terreno senza città dipinta, evitando due castelli sovrapposti. La texture originale resta visibile da lontano; la texture alternativa viene campionata solo nell'intorno di Aurenthar. Il resto della geografia mantiene la texture originale.

Il terreno alternativo `assets/aurenthar-ground.png` è stato creato con image_gen integrato. Il prompt esatto è in `assets/aurenthar-ground-prompt.txt`.

Le etichette distinguono regioni, città e luoghi minori. Un controllo delle sovrapposizioni le tiene lontane dalle altre etichette e dai pannelli. I nomi sotto Aurenthar restano fuori dal volume del monumento.

Le schede usano descrizioni e percorsi dal file Arcamis `content/mappins.json` e dal registro pagine, solo per luoghi marcati esplorati. I contenuti non disponibili hanno un testo cartografico neutro e nessun collegamento inventato. «Torna alla regione» ripristina la vista regionale; le tavole restano statiche.

Verificati nel browser: scheda di Aurenthar, apertura e chiusura della sua tavola, ritorno alla regione, ricerca Gromot e collegamento ufficiale, vista mobile. Verificati anche gerarchia e collisioni delle etichette, origine dei collegamenti, esclusione di descrizioni per luoghi non esplorati, geometria finita e assenza di alberi 3D. Le modifiche di questa sezione restano nella cartella locale `prototypes/flight`; nessun push o deploy.

La nuova illustrazione è una proposta di raccordo geografico generata, non una registrazione pixel per pixel della tavola originale. Rimane da convalidare il tracciato della Foresta Infinita e la corrispondenza di tutti i dettagli regionali prima di sostituire asset pubblici. Gli edifici sono modelli geometrici preliminari, non modelli GLTF definitivi. La risoluzione della texture resta un limite allo zoom molto ravvicinato.

Verifiche: sintassi dei moduli, caricamento nel browser, mappa completa, avvicinamento continuo ad Arcamis, riferimento originale, zoom/trascinamento e assenza di errori nella console durante queste prove.
