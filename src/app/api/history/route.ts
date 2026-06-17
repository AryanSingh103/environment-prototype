import { NextResponse } from 'next/server';

// ── Real 7-day environmental history ──
// Uses the free Open-Meteo APIs (no API key required), so this works even when
// the OpenWeatherMap / WAQI keys are absent. Hourly readings are aggregated into
// daily averages for Temperature (°F), Humidity (%), Wind (m/s) and US AQI.

interface DayPoint {
  name: string;
  date: string;
  Temperature: number;
  AQI: number;
  Humidity: number;
  WindSpeed: number;
}

async function fetchJson(url: string, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Upstream responded ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

// Average a list of (possibly null) hourly values, grouped by calendar day.
function groupDailyMean(times: string[], values: (number | null)[]) {
  const buckets = new Map<string, { sum: number; count: number }>();
  times.forEach((t, i) => {
    const day = t.slice(0, 10); // YYYY-MM-DD
    const v = values[i];
    if (v === null || v === undefined || Number.isNaN(v)) return;
    const b = buckets.get(day) ?? { sum: 0, count: 0 };
    b.sum += v;
    b.count += 1;
    buckets.set(day, b);
  });
  const out = new Map<string, number>();
  buckets.forEach((b, day) => out.set(day, b.count ? b.sum / b.count : 0));
  return out;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m` +
    `&past_days=6&forecast_days=1&temperature_unit=fahrenheit&wind_speed_unit=ms&timezone=auto`;

  const aqiUrl =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
    `&hourly=us_aqi&past_days=6&forecast_days=1&timezone=auto`;

  try {
    // Air quality is best-effort — weather is the source of truth for the day axis.
    const [weather, aqi] = await Promise.all([
      fetchJson(weatherUrl),
      fetchJson(aqiUrl).catch(() => null),
    ]);

    const times: string[] = weather?.hourly?.time ?? [];
    if (times.length === 0) {
      return NextResponse.json({ error: 'No historical data available for this location' }, { status: 502 });
    }

    const tempByDay = groupDailyMean(times, weather.hourly.temperature_2m ?? []);
    const humByDay = groupDailyMean(times, weather.hourly.relative_humidity_2m ?? []);
    const windByDay = groupDailyMean(times, weather.hourly.wind_speed_10m ?? []);
    const aqiByDay = aqi?.hourly?.time
      ? groupDailyMean(aqi.hourly.time, aqi.hourly.us_aqi ?? [])
      : new Map<string, number>();

    const days = Array.from(tempByDay.keys()).sort();
    const history: DayPoint[] = days.slice(-7).map((day) => {
      const d = new Date(`${day}T00:00:00`);
      return {
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.toLocaleDateString(),
        Temperature: Math.round(tempByDay.get(day) ?? 0),
        Humidity: Math.round(humByDay.get(day) ?? 0),
        WindSpeed: Number((windByDay.get(day) ?? 0).toFixed(1)),
        AQI: Math.round(aqiByDay.get(day) ?? 0),
      };
    });

    return NextResponse.json({ history, source: 'open-meteo', hasAqi: aqiByDay.size > 0 });
  } catch (error: any) {
    console.error('History API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
}
