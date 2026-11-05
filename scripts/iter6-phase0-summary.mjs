import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { basename, dirname, join, posix, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const [variant, distPath, artifactDir] = process.argv.slice(2);
const required = (ok, message) => { if (!ok) throw new Error(message); };
const percentile = (numbers, quantile) => {
  const sorted = numbers.filter(Number.isFinite).sort((a, b) => a - b);
  required(sorted.length > 0, 'No valid observations');
  return sorted[Math.max(0, Math.ceil(quantile * sorted.length) - 1)];
};
const describe = values => ({
  n: values.length,
  median: percentile(values, 0.5),
  p05: percentile(values, 0.05),
  p95: percentile(values, 0.95),
  min: Math.min(...values),
  max: Math.max(...values),
  range: Math.max(...values) - Math.min(...values),
  values
});

if (variant === 'compare') {
  const directory = distPath;
  const labels = ['main', 'iter5', 'iter6'];
  const reports = Object.fromEntries(labels.map(label =>
    [label, JSON.parse(readFileSync(join(directory, label, 'summary.json'), 'utf8'))]
  ));
  const comparable = reports.main.lighthouseVersion === reports.iter5.lighthouseVersion
    && reports.main.lighthouseVersion === reports.iter6.lighthouseVersion
    && reports.main.chromiumVersion === reports.iter5.chromiumVersion
    && reports.main.chromiumVersion === reports.iter6.chromiumVersion
    && reports.main.configKey === reports.iter5.configKey
    && reports.main.configKey === reports.iter6.configKey;
  const rows = labels.map(label => ({
    label,
    sha: reports[label].sha,
    n: reports[label].lcp.n,
    lcpMedianMs: reports[label].lcp.median,
    lcpRangeMs: [reports[label].lcp.min, reports[label].lcp.max],
    clsMedian: reports[label].cls.median,
    tbtMedianMs: reports[label].tbt.median,
    perfMedian: reports[label].performance.median,
    entryGzipBytes: reports[label].bundle.entryGzipBytes,
    initialJsGzipBytes: reports[label].bundle.initialJsGzipBytes
  }));
  const comparison = { comparable, rows, protocol: 'Single ubuntu-24.04 runner, sequential production builds, same Chrome and Lighthouse 12.8.2 mobile configuration; Lighthouse simulation, not physical device' };
  writeFileSync(join(directory, 'comparison.json'), JSON.stringify(comparison, null, 2));
  console.log('ITER6_PHASE0_COMPARISON ' + JSON.stringify(comparison));
  required(comparable, 'Chrome version, Lighthouse version, or test configuration differed among runs');
  process.exit(0);
}

required(['main', 'iter5', 'iter6'].includes(variant), 'Unknown variant');
const listFiles = (folder, prefix = '') => readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
  const rel = posix.join(prefix, entry.name);
  const full = join(folder, entry.name);
  return entry.isDirectory() ? listFiles(full, rel) : [rel];
});
const html = readFileSync(join(distPath, 'index.html'), 'utf8');
const scripts = listFiles(distPath).filter(name => name.endsWith('.js')).sort();
const assets = scripts.map(file => {
  const data = readFileSync(join(distPath, file));
  return { file, gzipBytes: gzipSync(data).byteLength, rawBytes: data.length };
});
const assetMap = new Map(assets.map(asset => [asset.file, asset]));
const entryRefs = [...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+\.js)"/g)]
  .map(match => match[1].replace(/^\/+/, '')).filter(name => assetMap.has(name));
const entry = [...html.matchAll(/<script\b[^>]*src="([^"]+\.js)"/g)]
  .map(match => match[1].replace(/^\/+/, ''))[0] ?? null;
const dependencies = {};
for (const file of scripts) {
  const source = readFileSync(join(distPath, file), 'utf8');
  const found = [...source.matchAll(/\bimport\s*(?:[^"'\n;]{0,500}?\s+from\s*)?["'](\.[^"']+\.js)["']/g)]
    .map(match => posix.normalize(posix.join(posix.dirname(file), match[1])))
    .filter(name => assetMap.has(name));
  dependencies[file] = [...new Set(found)].sort();
}
const initial = new Set();
const visit = file => {
  if (initial.has(file)) return;
  initial.add(file);
  for (const dep of dependencies[file] ?? []) visit(dep);
};
for (const ref of entryRefs) visit(ref);
const initialJsGzipBytes = [...initial].reduce((sum, file) => sum + (assetMap.get(file)?.gzipBytes ?? 0), 0);
const bundle = {
  entry,
  entryRefs,
  entryGzipBytes: assetMap.get(entry)?.gzipBytes ?? null,
  initialJsGzipBytes,
  initialFiles: [...initial].sort(),
  chunks: assets.map(asset => ({
    ...asset,
    initial: initial.has(asset.file),
    staticImports: dependencies[asset.file]
  })).sort((a, b) => b.gzipBytes - a.gzipBytes),
  definition: 'Sum of gzipSync byte lengths for entry scripts, HTML modulepreloads and transitively static-imported chunks; excludes lazy dynamic imports. Not a network HAR transfer-size measurement.'
};
const metrics = [];
for (let trial = 1; trial <= 10; trial++) {
  const j = JSON.parse(readFileSync(join(artifactDir, 'run-' + trial + '.json'), 'utf8'));
  const metric = name => j.audits[name]?.numericValue;
  const score = category => Number.isFinite(j.categories[category]?.score)
    ? 100 * j.categories[category].score : null;
  const info = {
    trial,
    lighthouseVersion: j.lighthouseVersion,
    chromiumVersion: j.environment?.hostUserAgent ?? 'unknown',
    configSettings: j.configSettings,
    lcpMs: metric('largest-contentful-paint'),
    cls: metric('cumulative-layout-shift'),
    tbtMs: metric('total-blocking-time'),
    performance: score('performance'),
    accessibility: score('accessibility'),
    bestPractices: score('best-practices'),
    seo: score('seo'),
    lcpElement: j.audits['largest-contentful-paint-element']?.details?.items?.[0]?.node?.snippet ?? null,
    requests: (j.audits['network-requests']?.details?.items ?? []).map(request => ({
      url: request.url, resourceType: request.resourceType,
      startTime: request.startTime, endTime: request.endTime,
      transferSize: request.transferSize
    }))
  };
  required([info.lcpMs, info.cls, info.tbtMs, info.performance].every(Number.isFinite),
    'Missing numeric metric in ' + variant + ' trial ' + trial);
  metrics.push(info);
}
const first = metrics[0];
const configKey = JSON.stringify({
  formFactor: first.configSettings?.formFactor,
  screenEmulation: first.configSettings?.screenEmulation,
  throttling: first.configSettings?.throttling,
  throttlingMethod: first.configSettings?.throttlingMethod,
  emulatedUserAgent: first.configSettings?.emulatedUserAgent
});
required(metrics.every(row =>
  row.lighthouseVersion === first.lighthouseVersion &&
  row.chromiumVersion === first.chromiumVersion &&
  JSON.stringify({
    formFactor: row.configSettings?.formFactor,
    screenEmulation: row.configSettings?.screenEmulation,
    throttling: row.configSettings?.throttling,
    throttlingMethod: row.configSettings?.throttlingMethod,
    emulatedUserAgent: row.configSettings?.emulatedUserAgent
  }) === configKey), 'Within-variant Lighthouse configuration changed');
required(first.lighthouseVersion.startsWith('12.'), 'Lighthouse major version is not 12');
required(first.configSettings?.screenEmulation?.width === 412
  && first.configSettings?.screenEmulation?.height === 823
  && first.configSettings?.throttling?.cpuSlowdownMultiplier === 4
  && first.configSettings?.throttling?.rttMs === 150,
  'Lighthouse mobile emulation is not 412x823, CPUx4, RTT 150ms');
const sha = variant === 'main'
  ? '0a7d167bc320b503a03dfe1247c96687526ca28b'
  : variant === 'iter5'
    ? '244c5060b37ba9d802dbad796b3ce1ed562f5339'
    : process.env.GITHUB_SHA ?? 'unknown';
const summarize = name => describe(metrics.map(row => row[name]));
const result = {
  variant, sha, n: 10,
  lighthouseVersion: first.lighthouseVersion,
  chromiumVersion: first.chromiumVersion,
  configKey,
  lcp: summarize('lcpMs'),
  cls: summarize('cls'),
  tbt: summarize('tbtMs'),
  performance: summarize('performance'),
  accessibility: summarize('accessibility'),
  bestPractices: summarize('bestPractices'),
  seo: summarize('seo'),
  lcpElements: [...new Set(metrics.map(row => row.lcpElement))],
  bundle,
  runs: metrics,
  scope: 'GitHub Actions ubuntu-24.04; Lighthouse 12.x simulated mobile (not device RUM). CPU and network simulations are Lighthouse estimates.'
};
mkdirSync(artifactDir, { recursive: true });
writeFileSync(join(artifactDir, 'summary.json'), JSON.stringify(result, null, 2));
console.log('ITER6_PHASE0_VARIANT ' + JSON.stringify({
  variant, sha, n: 10, lcpMedianMs: result.lcp.median,
  lcpRangeMs: [result.lcp.min, result.lcp.max],
  perfMedian: result.performance.median,
  entryGzipBytes: bundle.entryGzipBytes,
  initialJsGzipBytes: bundle.initialJsGzipBytes,
  lcpElements: result.lcpElements
}));
