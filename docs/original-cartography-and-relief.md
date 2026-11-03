# Cartografia originale e rilievo

Vincolo dell'utente: la geografia di Arcamis deve rimanere quella della mappa originale, compreso il lago di Gromot. La reinterpretazione grafica realistica generata durante l'esplorazione è stata scartata e non è inclusa nella versione pubblicata.

L'atlante usa `assets/world-continuous.png` per la vista generale dettagliata approvata. Quando si entra nel Marchesato, carica `assets/marchesato.png`: il file PNG originale 1920×1080 fornito dall'utente, verificato con SHA-256. Non viene ricostruito ritagliando la precedente base generata. Le differenze tra la vista generale e il disegno regionale non vengono presentate come un mosaico geograficamente registrato.

Il rilievo è una prima interpretazione delle altezze delle montagne indicate nei disegni. Una mesh WebGL2 riceve le immagini originali come texture; la geometria aggiunge altezza e illuminazione, senza ridisegnare laghi, coste, nomi o insediamenti. Il comando triangolare permette di tornare alla vista piatta; se WebGL2 non è disponibile si usa direttamente la mappa 2D. Le altezze non sono dati geografici autorevoli. I dettagli procedurali sono leggeri e non sostituiscono un'illustrazione ad alta risoluzione: lo zoom conserva i limiti dei PNG forniti.

Correzione delle tavole: la scelta della tavola segue anche la regione del luogo aperto, invece di conservare l'ultima regione scelta nell'indice. Il pulsante mostra esplicitamente il nome della tavola. Verificati tutti e sei i collegamenti, la selezione di un luogo in un'altra regione e il lago di Gromot.

Riferimenti tecnici: https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext. Contesto del riferimento Riot: https://www.vivianetteocasio.com/explore-runeterra, che descrive un sistema a tasselli, altezze e shader; non una semplice immagine ingrandita.
