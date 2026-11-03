# Arcamis — Atlante delle terre conosciute

Atlante autonomo in italiano. Un mondo continuo, con zoom progressivo dentro le regioni, luoghi cliccabili, ricerca, indice apribile, trascinamento e pinch, navigazione da tastiera e schede in stile diario di viaggio. Le sette tavole originali restano disponibili come approfondimento. Nessun backend o dato personale.

Avvio: `node server.mjs`, quindi http://127.0.0.1:4178.
Dettagli sul rispetto delle mappe originali e sui limiti del rilievo: [cartografia e rilievo](docs/original-cartography-and-relief.md).

Test logica: `node --test tests/*.test.mjs`.
Verifica browser: `node tests/continuous.cjs` con Playwright e Google Chrome disponibili (`npm install`, poi `npm run test:browser`).

I file pubblicati sono in `dist/`. I nomi geografici e le tavole sono in `dist/core.mjs`; coordinate globali e inquadrature regionali sono in `dist/world.mjs`. La cittadina della Contea si chiama Valgari; il Marchesato conserva Vigilius e Forte Vigilius. La vista generale usa `mondo.png`; il Marchesato carica esattamente la mappa originale `marchesato.png`, con il lago di Gromot. Il rilievo WebGL2 si può disattivare dal comando triangolare e dispone di una vista 2D di riserva. I dettagli delle nuove mappe e la posizione dei luoghi nella base unificata sono bozze da confermare. L'illustrazione raster ha una risoluzione finita: lo zoom non aggiunge dettagli oltre quelli disegnati.

## Pubblicazione

Il contenuto di `dist/` può essere servito da qualsiasi hosting statico. `.openai/hosting.json` collega questa copia al sito privato Sites. Il repository GitHub contiene sorgenti, mappe, test e documentazione. Nessuna credenziale è salvata nel progetto.
