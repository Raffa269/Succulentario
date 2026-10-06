import { getGenere, getVarietaByKey, normalizza, type Varieta } from "@/lib/catalogo";

export type FasciaPpfd = 1 | 2 | 3 | 4 | 5;

export interface IndicazioneIndoor {
  fasce: [FasciaPpfd, FasciaPpfd];
  etichetta: string;
  ppfd: string;
  fotoperiodo: string;
  nota: string;
  fonte: "varieta" | "genere" | "generica";
}

const FASCE: Record<FasciaPpfd, { min: string; max: string; nome: string }> = {
  1: { min: "100", max: "200", nome: "ombra luminosa" },
  2: { min: "200", max: "350", nome: "mezz'ombra indoor" },
  3: { min: "350", max: "500", nome: "sole moderato indoor" },
  4: { min: "500", max: "750", nome: "pieno sole indoor" },
  5: { min: "750", max: "1000+", nome: "pieno sole estremo" },
};

function indoor(
  fasce: [FasciaPpfd, FasciaPpfd],
  nota: string,
  fonte: IndicazioneIndoor["fonte"] = "genere",
): IndicazioneIndoor {
  const [min, max] = fasce;
  const etichetta = min === max ? `Fascia ${min}` : `Fasce ${min}-${max}`;
  const nome = min === max ? FASCE[min].nome : `${FASCE[min].nome} / ${FASCE[max].nome}`;
  const ppfd = min === max
    ? `${FASCE[min].min}-${FASCE[min].max} µmol/m²/s`
    : `${FASCE[min].min}-${FASCE[max].max} µmol/m²/s`;

  return {
    fasce,
    etichetta: `${etichetta} · ${nome}`,
    ppfd,
    fotoperiodo: "12 h/giorno",
    nota,
    fonte,
  };
}

function testoVarieta(varieta: Varieta) {
  return normalizza(`${varieta.nome} ${varieta.sinonimo} ${varieta.descrizione} ${varieta.note}`);
}

function contiene(testo: string, parole: string[]) {
  return parole.some((parola) => testo.includes(normalizza(parola)));
}

function indoorEcheveria(testo: string) {
  if (contiene(testo, ["laui", "lauii", "cante", "colorata", "afterglow"])) {
    return indoor([5, 5], "Pruina spessa, colori chiari o foglie molto cerose: indoor richiede luce molto forte per restare compatta.", "varieta");
  }
  if (contiene(testo, ["perle von nurnberg", "elegans", "black prince", "black knight", "lilacina", "shaviana", "lola", "neon breakers", "blue bird", "lovely rose", "purple pearl", "bordo rosa", "lilla", "azzur", "variegat"])) {
    return indoor([4, 4], "Rosette colorate o pruinose: sotto luce debole perdono colore e si aprono rapidamente.", "varieta");
  }
  if (contiene(testo, ["agavoides", "purpusorum", "dionysos", "pulvinata", "glauca", "secunda", "setosa", "pelos", "verde scuro", "lucid"])) {
    return indoor([3, 3], "Forma compatta con luce moderata; aumentare solo se tende ad allungarsi o perdere colore.", "varieta");
  }
  return indoor([3, 5], "Le Echeveria indoor sono esigenti: parti da luce forte e regola distanza e ventilazione in base a colore e compattezza.");
}

function indoorHaworthiaGasteria(testo: string) {
  if (contiene(testo, ["gasteria", "cymbiformis", "cooperi", "retusa", "batesiana", "bicolor", "pillansii", "armstrongii", "finestr", "trasparent", "lucid"])) {
    return indoor([2, 2], "Perfette per indoor luminoso: troppa luce le ingiallisce o le arrossa prima di migliorarle.", "varieta");
  }
  if (contiene(testo, ["attenuata", "fasciata", "limifolia", "truncata", "maughanii", "verrucosa", "little warty", "gasteraloe", "tubercol", "ruvid", "foglia dura", "haworthiopsis", "tulista"])) {
    return indoor([3, 3], "Foglie dure, tubercoli o superfici geometriche tollerano più luce delle Haworthia morbide, ma non pieno sole indoor.", "varieta");
  }
  return indoor([2, 3], "Gruppo molto adatto alla casa: usa luce moderata, mai fasce 4-5 continuative.");
}

function indoorAloe(testo: string) {
  if (contiene(testo, ["polyphylla", "humilis"])) {
    return indoor([5, 5], "Specie compatte o a spirale: chiedono molta luce, ma con ventilazione perché odiano il calore fermo.", "varieta");
  }
  if (contiene(testo, ["christmas carol", "pink blush", "riliev", "rosso", "rosa", "ibrid", "protuberanze"])) {
    return indoor([4, 4], "Gli ibridi colorati mantengono bordi e rilievi accesi solo con luce forte.", "varieta");
  }
  if (contiene(testo, ["aristata"])) {
    return indoor([2, 2], "Tollera mezz'ombra indoor; oltre luce media le punte possono seccare.", "varieta");
  }
  if (contiene(testo, ["vera", "variegata"])) {
    return indoor([3, 3], "Luce moderata e stabile: abbastanza forte da tenerla rigida, senza stress marrone continuo.", "varieta");
  }
  return indoor([2, 5], "Le Aloe variano molto: miniature e foglie sottili più basse, ibridi testurizzati e specie compatte più alte.");
}

function indoorCrassula(testo: string) {
  if (contiene(testo, ["pyramidalis", "falcata"])) {
    return indoor([5, 5], "Forme molto compatte, cerose o geometriche: luce massima per non separare le foglie.", "varieta");
  }
  if (contiene(testo, ["sunset", "buddha", "marnieriana", "hottentot", "pagoda", "colonn", "impilat"])) {
    return indoor([4, 4], "Serve luce forte per conservare simmetria, variegatura e margini colorati.", "varieta");
  }
  if (contiene(testo, ["ovata", "gollum", "hobbit", "arborescens"])) {
    return indoor([3, 3], "Luce moderata-forte: sufficiente per crescita robusta e margini leggermente rossi.", "varieta");
  }
  if (contiene(testo, ["exilis", "cooperi", "tappezzante", "erbosa"])) {
    return indoor([2, 3], "Le forme piccole o tappezzanti preferiscono luce meno aggressiva.", "varieta");
  }
  return indoor([2, 5], "Nel genere conta la forma: arbustive a luce media, colonne/pagode e foglie grigie a luce alta.");
}

function indoorSedum(testo: string) {
  if (contiene(testo, ["rubrotinctum", "nussbaumerianum", "adolphii", "pachyphyllum", "fagiolo", "rosso", "arancione", "oro"])) {
    return indoor([5, 5], "Foglie cicciotte e colorazioni rosse/arancio richiedono luce estrema per non tornare verdi.", "varieta");
  }
  if (contiene(testo, ["morganianum", "burrito", "aurora", "coda d'asino", "ricadente", "patina azzurra"])) {
    return indoor([4, 4], "Portamento ricadente e pruina azzurra: luce forte, ma attenzione alle scottature sulle variegate.", "varieta");
  }
  if (contiene(testo, ["makinoi", "ogon", "piccole", "sottili", "strisciante"])) {
    return indoor([3, 3], "Eccezione più morbida: luce moderata, soprattutto sulle forme gialle o sottili.", "varieta");
  }
  return indoor([3, 5], "I Sedum indoor chiedono in genere molta luce: se gli internodi si allungano, salire di fascia.");
}

function indoorKalanchoe(testo: string) {
  if (contiene(testo, ["luciae", "thyrsiflora", "humilis", "striature", "tigrat", "foglie grandi e lisce"])) {
    return indoor([4, 4], "Foglie lisce colorate o striate: luce forte per attivare rosso e contrasto.", "varieta");
  }
  if (contiene(testo, ["tomentosa", "panda", "feltrat", "vellutat", "pelos"])) {
    return indoor([3, 3], "Foglie feltrate: luce moderata mantiene compattezza e macchie scure senza bruciare i peli.", "varieta");
  }
  return indoor([3, 4], "In casa serve luce da moderata a forte; per le brevidiurne resta separato il tema delle notti buie per fiorire.");
}

function indoorCurioSenecio(testo: string) {
  if (contiene(testo, ["serpens", "mandraliscae", "haworthii", "scaposus", "blu", "bianc", "pelos", "cocoon"])) {
    return indoor([5, 5], "Foglie blu, bianche o molto pelose riflettono luce: indoor servono fasce alte.", "varieta");
  }
  if (contiene(testo, ["stapeliiformis", "stapeliaeformis", "steli carnosi", "vertical", "geometric"])) {
    return indoor([4, 4], "Steli verticali quasi senza foglie: luce forte per non assottigliare la punta.", "varieta");
  }
  if (contiene(testo, ["peregrinus", "delfino"])) {
    return indoor([3, 3], "Luce moderata: sotto questa soglia le foglie perdono la forma caratteristica.", "varieta");
  }
  if (contiene(testo, ["rowleyanus", "herreanus", "radicans", "perle", "banane", "ricadente", "collana"])) {
    return indoor([2, 3], "Le collane vogliono luce diffusa ma non estrema: troppa intensità sgonfia e ingiallisce le foglie.", "varieta");
  }
  return indoor([2, 5], "Gruppo molto variabile: collane basse, steli verticali medi-alti, forme blu o bianche molto alte.");
}

function indoorEuphorbia(testo: string) {
  if (contiene(testo, ["obesa", "horrida", "globos", "sfera", "geometrie fitte"])) {
    return indoor([5, 5], "Forme globose o molto geometriche: luce estrema per non deformarsi.", "varieta");
  }
  if (contiene(testo, ["trigona", "lactea", "cristata", "ingens", "colonn", "coste"])) {
    return indoor([4, 4], "Colonnari a coste: luce forte per restare robuste e dritte.", "varieta");
  }
  if (contiene(testo, ["tirucalli", "rami verdi", "cilindrici sottili"])) {
    return indoor([3, 3], "Steli sottili verdi: luce moderata; più luce può arrossare o aranciare le punte.", "varieta");
  }
  if (contiene(testo, ["milii", "leuconeura", "foglie grandi", "sottobosco"])) {
    return indoor([2, 2], "Specie fogliose: meglio luce moderata che lampade troppo vicine.", "varieta");
  }
  return indoor([2, 5], "Le Euphorbia sono divise: fogliose basse, colonnari alte, globose molto alte.");
}

function indoorCaudici(testo: string) {
  if (contiene(testo, ["arabicum", "rami massicci", "tozzi"])) {
    return indoor([5, 5], "Caudice e rami tozzi richiedono luce molto alta per restare compatti.", "varieta");
  }
  if (contiene(testo, ["obesum", "adenium", "pachypodium", "caudice", "spine", "fusto ingrossato"])) {
    return indoor([4, 5], "Caudiciformi da pieno sole: luce forte per ingrossare il caudice, con riposo asciutto in inverno.", "varieta");
  }
  return indoor([4, 5], "Per Adenium e Pachypodium indoor considera luce forte o molto forte; l'acqua resta il rischio principale in riposo.");
}

function indoorSansevieria(testo: string) {
  if (contiene(testo, ["cylindrica", "bacularis", "pinguicula", "canaliculata", "ehrenbergii", "foglie molto spesse"])) {
    return indoor([3, 4], "Dato non presente nella guida PPFD allegata: per forme cilindriche o molto spesse usa luce medio-forte.", "varieta");
  }
  return indoor([2, 3], "Dato non presente nella guida PPFD allegata: in casa tollera luce moderata, ma più luce evita crescita lenta e foglie deboli.");
}

function indoorLithops(testo: string) {
  if (contiene(testo, ["delosperma", "tappezzante", "margherita"])) {
    return indoor([4, 5], "Per i mesembriantemi tappezzanti la guida indica luce alta o estrema: sotto luce debole filano.", "varieta");
  }
  return indoor([4, 5], "I Lithops non sono schedeggiati nel file PPFD, ma nel gruppo mesembriantemi conviene usare luce molto alta senza calore eccessivo.");
}

export function indicazioneIndoorPerGenere(genereId: string | null | undefined): IndicazioneIndoor {
  const id = genereId ? (getGenere(genereId)?.id ?? genereId) : "";
  switch (id) {
    case "echeveria":
      return indoor([3, 5], "Rosette molto sensibili alla filatura: indoor richiedono luce da forte a estrema secondo pruina e colore.");
    case "haworthia":
      return indoor([2, 3], "Haworthia e Gasteria sono le più adatte all'indoor: luce moderata, niente fasce 4-5 continuative.");
    case "aloe":
      return indoor([2, 5], "Il genere varia molto: Aloe verdi a luce moderata, ibridi colorati e spirali a luce alta.");
    case "crassula":
      return indoor([2, 5], "Da luce moderata a estrema: più la pianta è geometrica, impilata o cerosa, più sale il PPFD.");
    case "sedum":
      return indoor([3, 5], "Molti Sedum indoor chiedono luce alta per non perdere foglie e compattezza.");
    case "kalanchoe":
      return indoor([3, 4], "Luce moderata-forte; per Kalanchoe fiorite resta decisivo anche il buio serale stagionale.");
    case "curio":
      return indoor([2, 5], "Collane in luce diffusa, forme blu/bianche o verticali molto più esigenti.");
    case "euphorbia":
      return indoor([2, 5], "Fogliose a luce moderata, colonnari a luce forte, globose a luce estrema.");
    case "caudici":
      return indoor([4, 5], "Adenium e Pachypodium richiedono luce forte per caudice e fioriture; in inverno acqua minima.");
    case "lithops":
      return indoor([4, 5], "Mesembriantemi da luce molto alta; controlla sempre temperatura e ventilazione sotto LED.");
    case "sansevieria":
      return indoor([2, 3], "Dato non presente nella guida PPFD allegata: indicazione prudente per coltivazione indoor luminosa.");
    default:
      return indoor([3, 4], "Scegli il genere o una varietà schedata per ottenere una stima PPFD più precisa.", "generica");
  }
}

export function indicazioneIndoorPerVarieta(varieta: Varieta): IndicazioneIndoor {
  const testo = testoVarieta(varieta);
  switch (varieta.genere) {
    case "echeveria":
      return indoorEcheveria(testo);
    case "haworthia":
      return indoorHaworthiaGasteria(testo);
    case "aloe":
      return indoorAloe(testo);
    case "crassula":
      return indoorCrassula(testo);
    case "sedum":
      return indoorSedum(testo);
    case "kalanchoe":
      return indoorKalanchoe(testo);
    case "curio":
      return indoorCurioSenecio(testo);
    case "euphorbia":
      return indoorEuphorbia(testo);
    case "caudici":
      return indoorCaudici(testo);
    case "sansevieria":
      return indoorSansevieria(testo);
    case "lithops":
      return indoorLithops(testo);
    default:
      return indicazioneIndoorPerGenere(varieta.genere);
  }
}

export function indicazioneIndoorPerScheda(varKey: string | null | undefined, genusId: string | null | undefined) {
  const varieta = varKey ? getVarietaByKey(varKey) : undefined;
  return varieta ? indicazioneIndoorPerVarieta(varieta) : indicazioneIndoorPerGenere(genusId);
}
