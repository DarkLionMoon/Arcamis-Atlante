# Arcamis — Atlante delle terre conosciute

Atlante autonomo in italiano. Sette tavole illustrate, regioni e luoghi cliccabili, ricerca, indice, zoom, trascinamento e pinch, navigazione da tastiera, schede in stile diario di viaggio. Nessun backend o dato personale.

Avvio: `node server.mjs`, quindi http://127.0.0.1:4178.
Test logica: `node --test tests/core.test.mjs`.
Verifica browser: `node tests/browser.cjs` con Playwright disponibile.

I file pubblicati sono in `dist/`. I nomi geografici e le coordinate dei punti sono in `dist/core.mjs`. La cittadina della Contea si chiama Valgari; la mappa originale del Marchesato conserva Vigilius e Forte Vigilius. Le tavole sono separate e non costituiscono uno zoom geografico continuo. I dettagli delle nuove mappe sono bozze da confermare.
