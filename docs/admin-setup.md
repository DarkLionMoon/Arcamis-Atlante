# Gestione nomi dell'atlante

Aprire `https://arcamis-atlante.pages.dev/admin/` e usare le credenziali del sito Arcamis. Le scritture richiedono il ruolo admin, non editor. Cercare un nome, modificarlo e premere «Salva modifiche». «Ripristina originale» ripristina il nome del catalogo al salvataggio successivo.

Le modifiche aggiornano i nomi nei punti della mappa, nella ricerca, nei titoli e nelle schede. Sul Marchesato, i nomi modificati vengono mostrati in targhette cartografiche sopra la scritta originale; il disegno resta invariato. I testi incorporati nelle altre tavole storiche non vengono ridisegnati automaticamente. Il catalogo amministrato è in `dist/catalog.mjs`, gli endpoint in `functions/api/atlas/[[path]].js` e `server/atlas-api.mjs`.

## Hosting

Cloudflare Pages pubblica `dist` e compila le funzioni dalla directory `functions` del repository. La binding `DB` punta al database dedicato `arcamis-atlante-names`; lo schema è in `migrations/0001_atlas_names.sql`. L'accesso usa l'endpoint ufficiale di Arcamis, senza duplicare password o utenti. Nessuna credenziale va nel repository.

La preview privata Sites resta statica: legge i nomi dall'API pubblica e il collegamento amministrazione apre il dominio pubblico, così il database rimane unico. Il database non deve essere ricreato a ogni pubblicazione. La mega-mappa non è stata modificata per la Foresta Infinita, secondo la successiva istruzione dell'utente.

## Verifica

`npm test`: logica, autenticazione, CSRF, database e revisioni concorrenti. `node tests/admin-ui.cjs`: interfaccia desktop/mobile. `node tests/name-overrides.cjs`: punti, ricerca, schede e targhette nella Tavola Arcamis.
