/**
 * Normaliza una cadena para comparar topónimos: minúsculas, sin acentos, sin apóstrofos
 * y con guiones/puntos como espacios. Así "Lliçà d'Amunt" == "Lliça dAmunt" y
 * "Palau-solità" == "Palau Solita".
 */
export function normalize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’`´]/g, '')
    .replace(/l[·.]l/g, 'll') // ela geminada: "Pal·lès" / "Pal.lès" -> "palles"
    .replace(/[-·.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
