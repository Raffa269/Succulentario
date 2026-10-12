import { NextResponse } from "next/server";
import {
  CAPOLUOGHI_PROVINCIA,
  CLIMA_ROMA_DEFAULT,
  COOKIE_CITTA,
  COOKIE_CLIMA,
  normalizzaTesto,
  serializzaProfiloClimatico,
  type MedieMensiliClima,
  type ProfiloClimatico,
} from "@/lib/clima";

const ANNO_INIZIO = 2015;
const ANNO_FINE = 2024;
const MAX_AGE = 60 * 60 * 24 * 365;

interface GeocodingResult {
  name: string;
  country_code: string;
  latitude: number;
  longitude: number;
}

interface HistoricalWeather {
  daily?: {
    time?: string[];
    temperature_2m_mean?: Array<number | null>;
    temperature_2m_min?: Array<number | null>;
    temperature_2m_max?: Array<number | null>;
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

async function coordinatePerCitta(nome: string): Promise<GeocodingResult> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({
    name: nome,
    count: "10",
    language: "it",
    format: "json",
  }).toString();

  const res = await fetch(url, { next: { revalidate: MAX_AGE } });
  if (!res.ok) throw new Error("Geocoding non disponibile.");
  const data = (await res.json()) as { results?: GeocodingResult[] };
  const risultati = (data.results ?? []).filter((r) => r.country_code === "IT");
  const nomeNormalizzato = normalizzaTesto(nome);
  const esatto = risultati.find((r) => normalizzaTesto(r.name) === nomeNormalizzato);
  const candidato = esatto ?? risultati[0];
  if (!candidato) throw new Error("Città non trovata.");
  return candidato;
}

function aggregaPerMese(data: HistoricalWeather): MedieMensiliClima[] {
  const time = data.daily?.time ?? [];
  const medie = data.daily?.temperature_2m_mean ?? [];
  const minime = data.daily?.temperature_2m_min ?? [];
  const massime = data.daily?.temperature_2m_max ?? [];
  const bucket = Array.from({ length: 12 }, () => ({ media: 0, minima: 0, massima: 0, count: 0 }));

  for (let i = 0; i < time.length; i++) {
    const media = medie[i];
    const minima = minime[i];
    const massima = massime[i];
    if (
      typeof media !== "number" ||
      typeof minima !== "number" ||
      typeof massima !== "number" ||
      !Number.isFinite(media) ||
      !Number.isFinite(minima) ||
      !Number.isFinite(massima)
    ) {
      continue;
    }
    const mese = Number(time[i]?.slice(5, 7));
    if (mese < 1 || mese > 12) continue;
    const b = bucket[mese - 1];
    b.media += media;
    b.minima += minima;
    b.massima += massima;
    b.count++;
  }

  if (bucket.some((b) => b.count === 0)) throw new Error("Serie storica incompleta.");

  return bucket.map((b, index) => ({
    mese: index + 1,
    media: round1(b.media / b.count),
    minima: round1(b.minima / b.count),
    massima: round1(b.massima / b.count),
  }));
}

async function calcolaMedieMensili(cittaNome: string): Promise<MedieMensiliClima[]> {
  const coordinate = await coordinatePerCitta(cittaNome);
  const url = new URL("https://archive-api.open-meteo.com/v1/archive");
  url.search = new URLSearchParams({
    latitude: String(coordinate.latitude),
    longitude: String(coordinate.longitude),
    start_date: `${ANNO_INIZIO}-01-01`,
    end_date: `${ANNO_FINE}-12-31`,
    daily: "temperature_2m_mean,temperature_2m_min,temperature_2m_max",
    timezone: "auto",
  }).toString();

  const res = await fetch(url, { next: { revalidate: MAX_AGE } });
  if (!res.ok) throw new Error("Temperature storiche non disponibili.");
  return aggregaPerMese((await res.json()) as HistoricalWeather);
}

function rispostaConCookie(profilo: ProfiloClimatico) {
  const res = NextResponse.json(profilo);
  res.cookies.set(COOKIE_CITTA, profilo.cityId, {
    maxAge: MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
  res.cookies.set(COOKIE_CLIMA, serializzaProfiloClimatico(profilo), {
    maxAge: MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
  return res;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { cityId?: string } | null;
  const cityId = body?.cityId ?? CLIMA_ROMA_DEFAULT.cityId;
  const citta = CAPOLUOGHI_PROVINCIA.find((item) => item.id === cityId);
  if (!citta) {
    return NextResponse.json({ error: "Città non valida." }, { status: 400 });
  }

  try {
    const monthly = await calcolaMedieMensili(citta.nome);
    return rispostaConCookie({
      cityId: citta.id,
      nome: citta.nome,
      monthly,
      fonte: `Open-Meteo Historical Weather API, media ${ANNO_INIZIO}-${ANNO_FINE}`,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (citta.id === "roma") {
      return rispostaConCookie({
        ...CLIMA_ROMA_DEFAULT,
        updatedAt: new Date().toISOString(),
      });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Non riesco a calcolare le medie climatiche." },
      { status: 502 },
    );
  }
}
