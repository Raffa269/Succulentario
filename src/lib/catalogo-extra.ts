import type { Genere, Ricovero, Varieta } from "@/lib/catalogo";

const CATALOGO_EXTRA = [
  ["adenia", "Adenia"],
  ["adenium", "Adenium"],
  ["adromischus", "Adromischus"],
  ["aeonium", "Aeonium"],
  ["agave", "Agave"],
  ["albuca", "Albuca"],
  ["ammocharis", "Ammocharis"],
  ["anacampseros", "Anacampseros"],
  ["asclepiadacea", "Asclepiadaceae stapeliadi"],
  ["astrophytum", "Astrophytum"],
  ["baobab", "Baobab"],
  ["beaucarnea", "Beaucarnea"],
  ["boophone", "Boophone"],
  ["cereus", "Cereus"],
  ["cleistocactus", "Cleistocactus"],
  ["copiapoa", "Copiapoa"],
  ["cotyledon", "Cotyledon"],
  ["cryptanthus", "Cryptanthus"],
  ["dasylirion", "Dasylirion"],
  ["delosperma", "Delosperma"],
  ["dioscorea", "Dioscorea"],
  ["echinocactus", "Echinocactus"],
  ["echinocereus", "Echinocereus"],
  ["echinofossulocactus", "Echinofossulocactus"],
  ["echinopsis", "Echinopsis"],
  ["epiphyllum", "Epiphyllum"],
  ["espostoa", "Espostoa"],
  ["eulychnia", "Eulychnia"],
  ["ferocactus", "Ferocactus"],
  ["fockea", "Fockea"],
  ["gasteria", "Gasteria"],
  ["graptopetalum", "Graptopetalum"],
  ["gymnocalycium", "Gymnocalycium"],
  ["hildewintera", "Hildewintera"],
  ["hoya", "Hoya"],
  ["ipomea", "Ipomoea"],
  ["lobivia", "Lobivia"],
  ["lophocereus", "Lophocereus"],
  ["mammillaria", "Mammillaria"],
  ["matucana", "Matucana"],
  ["melocactus", "Melocactus"],
  ["monvillea", "Monvillea"],
  ["myrtillocactus", "Myrtillocactus"],
  ["neoporteria", "Neoporteria"],
  ["notocactus", "Notocactus"],
  ["opuntia", "Opuntia"],
  ["oreocereus", "Oreocereus"],
  ["ornithogalum", "Ornithogalum"],
  ["pachycereus", "Pachycereus"],
  ["pachyphytum", "Pachyphytum"],
  ["pachypodium", "Pachypodium"],
  ["peperomia", "Peperomia"],
  ["pilea", "Pilea"],
  ["pilosocereus", "Pilosocereus"],
  ["polaskia", "Polaskia"],
  ["raphionacme", "Raphionacme"],
  ["rebutia", "Rebutia"],
  ["rhipsalis", "Rhipsalis"],
  ["sarcocaulon", "Sarcocaulon"],
  ["scilla", "Scilla"],
  ["sedeveria", "Sedeveria"],
  ["sempervivum", "Sempervivum"],
  ["stenocereus", "Stenocereus"],
  ["stetsonia", "Stetsonia"],
  ["sulcorebutia", "Sulcorebutia"],
  ["thelocactus", "Thelocactus"],
  ["tradescantia", "Tradescantia succulente"],
  ["trichocereus", "Trichocereus"],
  ["tylecodon", "Tylecodon"],
  ["yucca", "Yucca"],
  ["zamioculcas", "Zamioculcas"],
] as const;

const cactus = new Set([
  "astrophytum",
  "cereus",
  "cleistocactus",
  "copiapoa",
  "echinocactus",
  "echinocereus",
  "echinofossulocactus",
  "echinopsis",
  "espostoa",
  "eulychnia",
  "ferocactus",
  "gymnocalycium",
  "hildewintera",
  "lobivia",
  "lophocereus",
  "mammillaria",
  "matucana",
  "melocactus",
  "monvillea",
  "myrtillocactus",
  "neoporteria",
  "notocactus",
  "opuntia",
  "oreocereus",
  "pachycereus",
  "pilosocereus",
  "polaskia",
  "rebutia",
  "stenocereus",
  "stetsonia",
  "sulcorebutia",
  "thelocactus",
  "trichocereus",
]);
const tropicali = new Set([
  "albuca",
  "ammocharis",
  "asclepiadacea",
  "beaucarnea",
  "boophone",
  "cryptanthus",
  "epiphyllum",
  "hoya",
  "ornithogalum",
  "peperomia",
  "pilea",
  "raphionacme",
  "rhipsalis",
  "scilla",
  "tradescantia",
  "zamioculcas",
]);
const rustiche = new Set(["dasylirion", "delosperma", "sempervivum", "yucca"]);
const caudiciformi = new Set([
  "adenia",
  "adenium",
  "baobab",
  "dioscorea",
  "fockea",
  "ipomea",
  "pachypodium",
  "sarcocaulon",
  "tylecodon",
]);
const foglia = new Set(["adromischus", "aeonium", "agave", "anacampseros", "cotyledon", "gasteria", "pachyphytum"]);

function famiglia(id: string) {
  if (id === "graptopetalum") return "Crassulaceae · Messico";
  if (id === "sedeveria") return "Crassulaceae · ibridi Echeveria × Sedum";
  if (cactus.has(id)) return "Cactaceae · Americhe aride";
  if (id === "delosperma") return "Aizoaceae · Sudafrica montano";
  if (id === "pachyphytum") return "Crassulaceae · Messico";
  if (id === "zamioculcas") return "Araceae · Africa orientale";
  if (foglia.has(id)) return "Succulente a foglia · Africa e Americhe";
  if (caudiciformi.has(id)) return "Caudiciformi · Africa e Madagascar";
  if (tropicali.has(id)) return "Succulente tropicali · coltivazione riparata";
  if (rustiche.has(id)) return "Succulente rustiche o semirustiche";
  return "Succulente · origini variabili";
}

function ricovero(id: string): Ricovero {
  if (rustiche.has(id)) return "fuori";
  if (tropicali.has(id) || id === "melocactus") return "casa";
  if (caudiciformi.has(id) || id === "aeonium" || id === "pachyphytum") return "casa";
  return "riparo";
}

function inverno(id: string) {
  const r = ricovero(id);
  if (r === "fuori") return "Può restare fuori solo con substrato molto drenante e pioggia invernale limitata: freddo asciutto e freddo bagnato non sono la stessa cosa.";
  if (r === "riparo") return "In inverno preferisce un punto luminoso, asciutto e riparato dalla pioggia. Le gelate con vaso bagnato aumentano molto il rischio di marciume.";
  return "Da ritirare in casa o in locale luminoso prima delle notti fredde. In inverno acqua minima: con poca luce e substrato bagnato marcisce facilmente.";
}

function intro(id: string, nome: string) {
  // Fonti: RHS, Graptopetalum paraguayense; Kew POWO, × Sedeveria.
  if (id === "graptopetalum") return "Succulente della famiglia Crassulaceae con foglie carnose disposte a rosetta e piccoli fiori stellati. Graptopetalum paraguayense è una delle specie più diffuse in coltivazione.";
  if (id === "sedeveria") return "Sedeveria, indicata anche come × Sedeveria, è un genere ibrido ottenuto dall'incrocio fra Echeveria e Sedum. Aspetto ed esigenze possono variare secondo la cultivar e i genitori dell'ibrido.";
  if (id === "zamioculcas") return "Genere spesso venduto come pianta da interno resistente. Non è un cactus: accumula riserve in rizomi e piccioli carnosi, quindi tollera dimenticanze d'acqua ma non il freddo né il ristagno.";
  if (id === "delosperma") return "Mesembriantemi tappezzanti, molto fioriferi, utili anche fuori nei climi freddi se il drenaggio è eccellente. La rusticità cambia per specie e cultivar.";
  if (id === "pachyphytum") return "Crassulaceae messicane con foglie molto carnose e spesso pruinose. Belle ma delicate al tatto: la pruina si rovina facilmente e non si ricostruisce.";
  if (cactus.has(id)) return `${nome} comprende cactus da luce forte, spesso più robusti se coltivati asciutti e ventilati. In vaso il punto critico è sempre il freddo umido.`;
  if (caudiciformi.has(id)) return `${nome} è trattato nell'app come caudiciforme: fusto o radice ingrossata, crescita stagionale e riposo asciutto quando perde vigore o foglie.`;
  if (tropicali.has(id)) return `${nome} è un gruppo da luce filtrata o ambiente riparato: in Italia di solito non va lasciato al freddo invernale.`;
  return `${nome} è aggiunto al catalogo come scheda di genere, così può essere cercato, assegnato alle piante e arricchito con varietà specifiche nel tempo.`;
}

function specifiche(id: string): Genere["spec"] {
  const luce = tropicali.has(id) || id === "zamioculcas"
    ? "Luce abbondante ma filtrata; tollera ambienti luminosi senza sole diretto forte."
    : cactus.has(id) || rustiche.has(id)
      ? "Molta luce, con sole diretto graduale. In estate proteggere le piante appena acquistate dalle ore più calde."
      : "Luce molto buona; sole del mattino o mezzo sole sono una base prudente.";
  const acqua = ricovero(id) === "fuori"
    ? "In stagione irrigare quando il vaso asciuga; in inverno ridurre molto, soprattutto se piove."
    : "Bagnare solo a substrato asciutto. In inverno quasi asciutto, specie in casa o in serra fredda.";
  const terriccio = cactus.has(id) || caudiciformi.has(id) || rustiche.has(id)
    ? "Molto drenante, con alta quota minerale: pomice, lapillo, sabbia grossa o materiali equivalenti."
    : "Drenante e arioso; evitare terricci compatti che restano umidi per giorni.";
  return [
    ["Luce", luce],
    ["Acqua", acqua],
    ["Terriccio", terriccio],
    ["Inverno", inverno(id)],
    ["Nota", "Scheda sintetica: aggiungi varietà specifiche quando vuoi distinguere esigenze particolari."],
  ];
}

export const generiExtra: Genere[] = CATALOGO_EXTRA.map(([id, nome]) => ({
  id,
  nome,
  fam: famiglia(id),
  illu: id,
  rappr: `${nome} sp.`,
  totale: "Scheda sintetica da ampliare con specie e cultivar specifiche.",
  inverno: inverno(id),
  keys: [id, nome.toLowerCase(), ...(id === "zamioculcas" ? ["zemioculcas", "zamioculca", "zz plant"] : [])],
  intro: intro(id, nome),
  spec: specifiche(id),
}));

export const varietaExtra: Varieta[] = CATALOGO_EXTRA.map(([id, nome]) => {
  const r = ricovero(id);
  const nota =
    r === "fuori"
      ? "Può stare fuori nei climi adatti se asciutta e molto drenata. Sole pieno o mezzo sole, terriccio molto drenante."
      : r === "riparo"
        ? "Meglio riparo luminoso e asciutto in inverno. Sole pieno o mezzo sole, terriccio molto drenante."
        : tropicali.has(id) || id === "zamioculcas"
          ? "Da tenere in casa o in locale luminoso durante l'inverno. Mezz'ombra luminosa, terriccio drenante ma non estremo."
          : "Da tenere in casa o in locale luminoso durante l'inverno. Mezzo sole, terriccio drenante.";
  return {
    key: `${id}#${id}-sp`,
    genere: id,
    nome: `${nome} sp.`,
    sinonimo: id === "zamioculcas" ? "Zemioculcas; ZZ plant" : "",
    descrizione: "voce generica per collegare una pianta al genere quando la specie non è ancora identificata",
    ricovero: r,
    note: nota,
  };
});

