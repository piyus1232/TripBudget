import axios from 'axios';

const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const WIKI_REST = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const UA = { 'User-Agent': 'TripBudget/1.0 (https://example.com; place images)' };

function tokens(s) {
  if (!s) return [];
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function titleScore(title, snippet, nameTokens, cityTokens) {
  if (!title) return -100;
  const t = `${title} ${snippet || ''}`.toLowerCase();
  let score = 0;
  if (/^list of\b/i.test(title)) score -= 8;
  if (/\bdisambiguation\b/i.test(snippet || '')) score -= 6;
  if (/\bmay refer to\b/i.test(snippet || '')) score -= 6;
  for (const w of nameTokens) {
    if (title.toLowerCase().includes(w)) score += 4;
    else if (t.includes(w)) score += 2;
  }
  for (const w of cityTokens) {
    if (title.toLowerCase().includes(w)) score += 1;
    else if (t.includes(w)) score += 0.5;
  }
  return score;
}

async function getThumbnailForTitle(title) {
  if (!title) return null;
  const pathTitle = encodeURIComponent(title.replace(/ /g, '_'));
  try {
    const summaryRes = await axios.get(`${WIKI_REST}/${pathTitle}`, {
      headers: UA,
      timeout: 10000,
      validateStatus: (s) => s < 500,
    });
    const data = summaryRes.data;
    if (!data || data.type === 'disambiguation') return null;
    let src = data.thumbnail?.source;
    if (!src || !/^https?:\/\//i.test(src)) {
      // Larger image via pageimages
      const imgRes = await axios.get(WIKI_API, {
        params: {
          action: 'query',
          titles: title,
          prop: 'pageimages',
          piprop: 'thumbnail',
          pithumbsize: 800,
          format: 'json',
        },
        headers: UA,
        timeout: 10000,
      });
      const pages = imgRes.data?.query?.pages || {};
      const page = Object.values(pages)[0];
      src = page?.thumbnail?.source;
    } else {
      // Upgrade thumb size when possible
      const imgRes = await axios.get(WIKI_API, {
        params: {
          action: 'query',
          titles: title,
          prop: 'pageimages',
          piprop: 'thumbnail',
          pithumbsize: 800,
          format: 'json',
        },
        headers: UA,
        timeout: 10000,
      });
      const pages = imgRes.data?.query?.pages || {};
      const page = Object.values(pages)[0];
      if (page?.thumbnail?.source) src = page.thumbnail.source;
    }
    return src && /^https?:\/\//i.test(src) ? src : null;
  } catch {
    return null;
  }
}

async function geosearchCandidates(lat, lng, radiusM = 1200, limit = 20) {
  const { data } = await axios.get(WIKI_API, {
    params: {
      action: 'query',
      list: 'geosearch',
      gscoord: `${lat}|${lng}`,
      gsradius: radiusM,
      gslimit: limit,
      format: 'json',
    },
    headers: UA,
    timeout: 10000,
  });
  return data?.query?.geosearch || [];
}

/**
 * More accurate place photo: geosearch near POI, ranked search, exact title, larger thumbs.
 */
export async function fetchWikipediaPlaceImage(name, city, options = {}) {
  const lat = options.lat != null ? Number(options.lat) : null;
  const lng = options.lng != null ? Number(options.lng) : null;

  if (!name || typeof name !== 'string') return null;
  const clean = name.trim();
  if (!clean) return null;

  const nameTokens = tokens(clean);
  const cityTokens = tokens(city || '');

  // 1) OpenSearch first (works with lowercase "sidi saiyyed mosque" → correct title)
  try {
    const os = await axios.get(WIKI_API, {
      params: {
        action: 'opensearch',
        search: `${clean} ${city || ''}`.trim(),
        limit: 10,
        namespace: 0,
        format: 'json',
      },
      headers: UA,
      timeout: 12000,
    });
    const titles = os.data?.[1] || [];
    for (const title of titles) {
      if (!title || /^list of /i.test(title)) continue;
      const url = await getThumbnailForTitle(title);
      if (url) return url;
    }
  } catch (e) {
    console.warn('Wikipedia opensearch:', e.message);
  }

  // 2) Exact article title (redirects)
  const exactThumb = await getThumbnailForTitle(clean);
  if (exactThumb) return exactThumb;

  // 3) Geosearch: pages nearest the POI (very accurate when coords exist)
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    try {
      const geo = await geosearchCandidates(lat, lng, 1500, 25);
      const ranked = geo
        .map((g) => ({
          title: g.title,
          dist: g.dist,
          score: titleScore(g.title, '', nameTokens, cityTokens) - (g.dist || 0) / 500,
        }))
        .sort((a, b) => b.score - a.score);

      const tryOrder = [
        ...ranked.filter((r) => r.score >= 2),
        ...ranked,
      ];
      const seen = new Set();
      for (const row of tryOrder) {
        if (!row.title || seen.has(row.title)) continue;
        seen.add(row.title);
        const url = await getThumbnailForTitle(row.title);
        if (url) return url;
      }
    } catch (e) {
      console.warn('Wikipedia geosearch:', e.message);
    }
  }

  // 4) Full text search — rank by title/snippet match to place + city
  const queries = [
    `"${clean}" ${city || ''}`.trim(),
    `${clean} ${city || ''}`.trim(),
    clean,
    `${clean} ${city || ''} tourism`.trim(),
  ].filter((q, i, a) => a.indexOf(q) === i);

  let bestHits = [];
  for (const srsearch of queries) {
    try {
      const searchRes = await axios.get(WIKI_API, {
        params: {
          action: 'query',
          list: 'search',
          srsearch,
          format: 'json',
          srlimit: 15,
        },
        headers: UA,
        timeout: 10000,
      });
      const hits = searchRes.data?.query?.search || [];
      bestHits = hits
        .map((h) => ({
          ...h,
          rank: titleScore(h.title, h.snippet, nameTokens, cityTokens),
        }))
        .filter((h) => h.rank > -3)
        .sort((a, b) => b.rank - a.rank);
      if (bestHits.length) break;
    } catch (e) {
      console.warn('Wikipedia search:', srsearch, e.message);
    }
  }

  for (const hit of bestHits) {
    const url = await getThumbnailForTitle(hit.title);
    if (url) return url;
  }

  return null;
}
