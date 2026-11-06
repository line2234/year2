# Italian (it)

**Status: draft.** Written for Tally 1.4.3 without a native speaker; it awaits a native speaker's review (the
notes at the end list what to check first).

## Tone and address

Informal “tu” throughout (“Scegli un conto”, “Ieri hai speso…”), as everyday Italian apps do: Tally is a personal
notebook, and “Lei” would sound distant. Short, calm sentences; past events in the passato prossimo (“Non hai
annotato niente”). Apostrophes and quotes are typographic (’ “ ”). Amounts and dates come from the phone's locale, so
texts only say “il {{date}}” and never assume a format.

## Plurals

Italian has the CLDR categories one, many and other. `many` (used for large round numbers such as 1 000 000) is
written identically to `other`.

## Terms

| English | Italian | Notes |
|---|---|---|
| entry | movimento | the usual banking word for one line in a statement |
| account | conto | |
| balance | saldo | |
| balance fix | correzione del saldo | verb: correggere |
| spending / spent | spesa / speso | “Spese” for the summary and the donut |
| money in / received / income | entrata / ricevuto / entrate | |
| transfer | giroconto | between the user's own accounts |
| fee | commissione | |
| loan / borrowed | debito / ricevuto in prestito | money the user borrowed and owes |
| lending / lent | prestito / prestato | money the user lent; they owe the user |
| payment / paid back / got back | pagamento / restituito / riavuto | |
| payback day / return by | giorno di rientro / restituisci entro | |
| written off / forgiven | dato per perso / condonato | |
| cleared | saldato | |
| asset / liabilities | attività / passività | tab names; the total line says “Devi” |
| net worth | patrimonio netto | |
| category | categoria | |
| archive / archived | archiviare / archiviato | |
| backup / restore | backup / ripristinare | |
| evening nudge | promemoria serale | |

## For the reviewer

- “Debito” (money borrowed) vs “prestito” (money lent) is deliberately kept apart so the two never blur: check that
  it reads naturally.
- “Dato per perso” and “condonato” for written-off and forgiven loans.
- Whether “Home” should stay in English (it does in most Italian apps) and “Offrimi un caffè” for the Ko-fi row.
