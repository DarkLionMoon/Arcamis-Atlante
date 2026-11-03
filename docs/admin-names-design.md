# Admin dell'Atlante: nomi modificabili

Richiesta: pannello simile all'admin Arcamis, con gli stessi account, per correggere i nomi senza rigenerare il disegno. L'utente ha scelto esplicitamente gli account Arcamis esistenti.

## Implementazione

Pannello `/admin/`, stile chiaro/scuro e oro ripreso dal pannello Arcamis esistente. Elenco ricercabile per regione, nomi modificabili, ripristino del nome originale, indicazione delle modifiche in sospeso e salvataggio esplicito. Le modifiche sono persistenti e valgono per tutti i visitatori. I conflitti tra amministratori non sovrascrivono in silenzio le modifiche.

Autenticazione tramite l'endpoint server Arcamis esistente; nessuna copia di password o degli utenti. Sessione dell'atlante in cookie separato, HttpOnly/Secure/SameSite Strict. Scritture solo per ruolo admin con token CSRF e verifica Origin. Dati dei nomi in database D1 dedicato, revisioni per evitare salvataggi concorrenti.

Il sito pubblico Cloudflare gestisce login e API. L'anteprima privata carica i nomi dall'API pubblica in sola lettura e apre il pannello admin sul dominio pubblico, così gli stessi dati restano coerenti.

## Cartografia

La Tavola Arcamis mantiene l'immagine scelta dall'utente, con le tre correzioni esatte «Forte Vigilus», «Volonx» e «Lago di Gromot». «Rovine di Kaldur» resta corretto e la cittadina «Vigilius» è distinta dalla fortezza. I nomi salvati dall'admin aggiornano punti, ricerca e schede; per i nomi del Marchesato una targhetta SVG sostituisce visivamente la scritta originale solo quando è stata modificata. Senza modifiche admin, l'immagine scelta resta visivamente identica. Le altre tavole storiche rimangono illustrazioni originali e i loro titoli/schede seguono i nomi dell'atlante.

L'utente ha successivamente annullato il lavoro sulla Foresta Infinita nella mega-mappa: il fondo della mappa generale resta invariato e le reinterpretazioni generate non vengono pubblicate.

## Verifica

Test reali SQLite per autorizzazioni, CSRF, Origin, persistenza e revisioni concorrenti; test browser del login e delle modifiche admin; controlli del nome nelle scritte del Marchesato, ricerca e finestre dei luoghi. Nessuna password salvata nel browser o nel repository.
