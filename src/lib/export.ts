import { EnvironmentData } from '@/types';

interface ExportData {
  location: string;
  concern: string;
  explanation: string;
  data: EnvironmentData;
  timestamp: string;
}

function buildExportData(
  location: string,
  concern: string,
  explanation: string,
  data: EnvironmentData
): ExportData {
  return {
    location,
    concern,
    explanation,
    data,
    timestamp: new Date().toISOString(),
  };
}

// ── CSV Export ──
export function exportCSV(
  location: string,
  concern: string,
  explanation: string,
  data: EnvironmentData
) {
  const rows = [
    ['Field', 'Value'],
    ['Location', location],
    ['Timestamp', new Date().toLocaleString()],
    ['Top Concern', concern],
    ['Temperature (°F)', String(data.temperature)],
    ['AQI', String(data.aqi)],
    ['AQI Label', data.aqiLabel],
    ['Humidity (%)', String(data.humidity)],
    ['Wind Speed (m/s)', String(data.windSpeed)],
    ['Description', data.description],
    ['AI Explanation', `"${explanation.replace(/"/g, '""')}"`],
  ];

  const csv = rows.map((r) => r.join(',')).join('\n');
  downloadFile(csv, `environment-${sanitize(location)}.csv`, 'text/csv');
}

// ── JSON Export ──
export function exportJSON(
  location: string,
  concern: string,
  explanation: string,
  data: EnvironmentData
) {
  const payload = buildExportData(location, concern, explanation, data);
  const json = JSON.stringify(payload, null, 2);
  downloadFile(json, `environment-${sanitize(location)}.json`, 'application/json');
}

// ── PDF Export ──
export function exportPDF(
  location: string,
  concern: string,
  explanation: string,
  data: EnvironmentData
) {
  // Generate a clean HTML report and open in a new window for print/save as PDF
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Environment Report — ${escapeHtml(location)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
      padding: 40px; 
      color: #1e293b; 
      max-width: 800px; 
      margin: 0 auto;
      line-height: 1.6;
    }
    .header { 
      border-bottom: 3px solid #6366f1; 
      padding-bottom: 20px; 
      margin-bottom: 30px; 
    }
    .header h1 { 
      font-size: 28px; 
      color: #1e293b; 
      margin-bottom: 4px; 
    }
    .header .subtitle { 
      color: #64748b; 
      font-size: 14px; 
    }
    .metrics { 
      display: grid; 
      grid-template-columns: repeat(4, 1fr); 
      gap: 16px; 
      margin-bottom: 30px; 
    }
    .metric { 
      background: #f8fafc; 
      border: 1px solid #e2e8f0; 
      border-radius: 12px; 
      padding: 16px; 
      text-align: center; 
    }
    .metric .label { 
      font-size: 12px; 
      color: #64748b; 
      text-transform: uppercase; 
      letter-spacing: 0.5px; 
      margin-bottom: 4px; 
    }
    .metric .value { 
      font-size: 28px; 
      font-weight: 700; 
      color: #1e293b; 
    }
    .metric .unit { 
      font-size: 14px; 
      color: #94a3b8; 
    }
    .section { 
      margin-bottom: 24px; 
    }
    .section h2 { 
      font-size: 18px; 
      color: #334155; 
      margin-bottom: 12px; 
      padding-bottom: 8px; 
      border-bottom: 1px solid #e2e8f0; 
    }
    .section p { 
      color: #475569; 
      line-height: 1.7; 
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 4px;
    }
    .badge-good { background: #dcfce7; color: #166534; }
    .badge-moderate { background: #fef9c3; color: #854d0e; }
    .badge-unhealthy { background: #fed7aa; color: #9a3412; }
    .badge-hazardous { background: #fecaca; color: #991b1b; }
    .footer { 
      margin-top: 40px; 
      padding-top: 16px; 
      border-top: 1px solid #e2e8f0; 
      font-size: 12px; 
      color: #94a3b8; 
      text-align: center; 
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; padding: 12px; background: #eff6ff; border-radius: 8px; text-align: center; font-size: 14px; color: #3b82f6;">
    Use <strong>Ctrl/Cmd + P</strong> to save as PDF or print this report.
  </div>
  <div class="header">
    <h1>🌍 Environment Report: ${escapeHtml(location)}</h1>
    <div class="subtitle">Generated on ${new Date().toLocaleString()} · Concern: ${escapeHtml(concern)}</div>
  </div>

  <div class="metrics">
    <div class="metric">
      <div class="label">Temperature</div>
      <div class="value">${Math.round(data.temperature)}°<span class="unit">F</span></div>
    </div>
    <div class="metric">
      <div class="label">Air Quality</div>
      <div class="value">${data.aqi}</div>
      <span class="badge ${data.aqi <= 50 ? 'badge-good' : data.aqi <= 100 ? 'badge-moderate' : data.aqi <= 150 ? 'badge-unhealthy' : 'badge-hazardous'}">${data.aqiLabel}</span>
    </div>
    <div class="metric">
      <div class="label">Humidity</div>
      <div class="value">${data.humidity}<span class="unit">%</span></div>
    </div>
    <div class="metric">
      <div class="label">Wind Speed</div>
      <div class="value">${data.windSpeed}<span class="unit">m/s</span></div>
    </div>
  </div>

  <div class="section">
    <h2>Current Conditions</h2>
    <p>${escapeHtml(data.description)}</p>
  </div>

  <div class="section">
    <h2>AI Analysis: ${escapeHtml(concern)}</h2>
    <p>${escapeHtml(explanation)}</p>
  </div>

  <div class="footer">
    What's Happening Around Me? · Powered by OpenWeatherMap, WAQI, Open-Meteo, and OpenAI
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.addEventListener('load', () => {
      URL.revokeObjectURL(url);
    });
  }
}

// ── Chat Export ──
export function exportChat(messages: Array<{ role: string; content?: string; parts?: Array<{ type: string; text: string }> }>) {
  const lines = messages.map((msg) => {
    const text = msg.parts
      ? msg.parts.filter((p) => p.type === 'text').map((p) => p.text).join('')
      : msg.content || '';
    const label = msg.role === 'user' ? 'You' : 'Eco-Assistant';
    return `[${label}]\n${text}\n`;
  });

  const content = `Eco-Assistant Chat Export\nExported: ${new Date().toLocaleString()}\n${'─'.repeat(40)}\n\n${lines.join('\n')}`;
  downloadFile(content, `chat-export-${Date.now()}.txt`, 'text/plain');
}

// ── Helpers ──
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
