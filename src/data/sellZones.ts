// Zonas con página propia de captación (/vender-mi-inmueble/[municipio]).
// Fuente: Idescat, API EMEX v1 (jerarquía comarca > municipio), 2026-09-29.

export interface SellMunicipality {
  name: string;
  slug: string;
  /** Código Idescat/INE del municipio */
  ine: string;
}

export interface SellComarca {
  id: string;
  name: string;
  slug: string;
  municipalities: readonly SellMunicipality[];
}

export const SELL_COMARCAS: readonly SellComarca[] = [
  {
    id: "40",
    name: "Vallès Occidental",
    slug: "valles-occidental",
    municipalities: [
      { name: "Badia del Vallès", slug: "badia-del-valles", ine: "089045" },
      { name: "Barberà del Vallès", slug: "barbera-del-valles", ine: "082520" },
      { name: "Castellar del Vallès", slug: "castellar-del-valles", ine: "080517" },
      { name: "Castellbisbal", slug: "castellbisbal", ine: "080543" },
      { name: "Cerdanyola del Vallès", slug: "cerdanyola-del-valles", ine: "082665" },
      { name: "Gallifa", slug: "gallifa", ine: "080879" },
      { name: "Matadepera", slug: "matadepera", ine: "081206" },
      { name: "Montcada i Reixac", slug: "montcada-i-reixac", ine: "081252" },
      { name: "Palau-solità i Plegamans", slug: "palau-solita-i-plegamans", ine: "081568" },
      { name: "Polinyà", slug: "polinya", ine: "081672" },
      { name: "Rellinars", slug: "rellinars", ine: "081799" },
      { name: "Ripollet", slug: "ripollet", ine: "081803" },
      { name: "Rubí", slug: "rubi", ine: "081846" },
      { name: "Sabadell", slug: "sabadell", ine: "081878" },
      { name: "Sant Cugat del Vallès", slug: "sant-cugat-del-valles", ine: "082055" },
      { name: "Sant Llorenç Savall", slug: "sant-llorenc-savall", ine: "082233" },
      { name: "Sant Quirze del Vallès", slug: "sant-quirze-del-valles", ine: "082384" },
      { name: "Santa Perpètua de Mogoda", slug: "santa-perpetua-de-mogoda", ine: "082606" },
      { name: "Sentmenat", slug: "sentmenat", ine: "082671" },
      { name: "Terrassa", slug: "terrassa", ine: "082798" },
      { name: "Ullastrell", slug: "ullastrell", ine: "082900" },
      { name: "Vacarisses", slug: "vacarisses", ine: "082917" },
      { name: "Viladecavalls", slug: "viladecavalls", ine: "083008" },
    ],
  },
  {
    id: "41",
    name: "Vallès Oriental",
    slug: "valles-oriental",
    municipalities: [
      { name: "Bigues i Riells del Fai", slug: "bigues-i-riells-del-fai", ine: "080235" },
      { name: "Caldes de Montbui", slug: "caldes-de-montbui", ine: "080333" },
      { name: "Campins", slug: "campins", ine: "080399" },
      { name: "Canovelles", slug: "canovelles", ine: "080410" },
      { name: "Cànoves i Samalús", slug: "canoves-i-samalus", ine: "080425" },
      { name: "Cardedeu", slug: "cardedeu", ine: "080462" },
      { name: "Figaró-Montmany", slug: "figaro-montmany", ine: "081347" },
      { name: "Fogars de Montclús", slug: "fogars-de-montclus", ine: "080811" },
      { name: "Granollers", slug: "granollers", ine: "080961" },
      { name: "Gualba", slug: "gualba", ine: "080977" },
      { name: "L'Ametlla del Vallès", slug: "l-ametlla-del-valles", ine: "080057" },
      { name: "La Garriga", slug: "la-garriga", ine: "080885" },
      { name: "La Llagosta", slug: "la-llagosta", ine: "081056" },
      { name: "La Roca del Vallès", slug: "la-roca-del-valles", ine: "081810" },
      { name: "Les Franqueses del Vallès", slug: "les-franqueses-del-valles", ine: "080863" },
      { name: "Lliçà d'Amunt", slug: "llica-d-amunt", ine: "081075" },
      { name: "Lliçà de Vall", slug: "llica-de-vall", ine: "081081" },
      { name: "Llinars del Vallès", slug: "llinars-del-valles", ine: "081069" },
      { name: "Martorelles", slug: "martorelles", ine: "081154" },
      { name: "Mollet del Vallès", slug: "mollet-del-valles", ine: "081249" },
      { name: "Montmeló", slug: "montmelo", ine: "081350" },
      { name: "Montornès del Vallès", slug: "montornes-del-valles", ine: "081363" },
      { name: "Montseny", slug: "montseny", ine: "081379" },
      { name: "Parets del Vallès", slug: "parets-del-valles", ine: "081593" },
      { name: "Sant Antoni de Vilamajor", slug: "sant-antoni-de-vilamajor", ine: "081982" },
      { name: "Sant Celoni", slug: "sant-celoni", ine: "082021" },
      { name: "Sant Esteve de Palautordera", slug: "sant-esteve-de-palautordera", ine: "082074" },
      { name: "Sant Feliu de Codines", slug: "sant-feliu-de-codines", ine: "082107" },
      { name: "Sant Fost de Campsentelles", slug: "sant-fost-de-campsentelles", ine: "082093" },
      { name: "Sant Pere de Vilamajor", slug: "sant-pere-de-vilamajor", ine: "082346" },
      { name: "Santa Eulàlia de Ronçana", slug: "santa-eulalia-de-roncana", ine: "082482" },
      { name: "Santa Maria de Martorelles", slug: "santa-maria-de-martorelles", ine: "082567" },
      { name: "Santa Maria de Palautordera", slug: "santa-maria-de-palautordera", ine: "082592" },
      { name: "Tagamanent", slug: "tagamanent", ine: "082763" },
      { name: "Vallgorguina", slug: "vallgorguina", ine: "082943" },
      { name: "Vallromanes", slug: "vallromanes", ine: "082969" },
      { name: "Vilalba Sasserra", slug: "vilalba-sasserra", ine: "083067" },
      { name: "Vilanova del Vallès", slug: "vilanova-del-valles", ine: "089024" },
    ],
  },
  {
    id: "13",
    name: "Barcelonès",
    slug: "barcelones",
    municipalities: [
      { name: "Badalona", slug: "badalona", ine: "080155" },
      { name: "Barcelona", slug: "barcelona", ine: "080193" },
      { name: "L'Hospitalet de Llobregat", slug: "l-hospitalet-de-llobregat", ine: "081017" },
      { name: "Sant Adrià de Besòs", slug: "sant-adria-de-besos", ine: "081944" },
      { name: "Santa Coloma de Gramenet", slug: "santa-coloma-de-gramenet", ine: "082457" },
    ],
  },
];

export const SELL_MUNICIPALITIES = SELL_COMARCAS.flatMap((comarca) =>
  comarca.municipalities.map((m) => ({ ...m, comarca }))
);

export function getSellMunicipality(slug: string) {
  return SELL_MUNICIPALITIES.find((m) => m.slug === slug);
}
