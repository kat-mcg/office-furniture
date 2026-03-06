import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

interface ScrapeResult {
  title: string;
  imageUrl: string;
  price: string;
  description: string;
  widthCm: string;
  depthCm: string;
  heightCm: string;
  material: string;
}

function isEmpty(result: ScrapeResult): boolean {
  return !result.title && !result.imageUrl && !result.price && !result.description;
}

function isUseful(result: ScrapeResult): boolean {
  // Count how many key fields we got
  let score = 0;
  if (result.title && result.title.length > 10) score++;
  if (result.imageUrl) score++;
  if (result.price) score++;
  if (result.description && result.description.length > 20) score++;
  return score >= 2;
}

function str(val: unknown): string {
  if (Array.isArray(val)) return val[0] || "";
  if (typeof val === "string") return val;
  return "";
}

function extractFromText(text: string, result: ScrapeResult): ScrapeResult {
  // Dimensions: "60 x 40 x 75 cm" or "24 x 16 x 30 inches"
  if (!result.widthCm) {
    const cmMatch = text.match(
      /(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*cm/i
    );
    const inMatch = text.match(
      /(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:in|inch)/i
    );
    if (cmMatch) {
      result.widthCm = cmMatch[1];
      result.depthCm = cmMatch[2];
      result.heightCm = cmMatch[3];
    } else if (inMatch) {
      result.widthCm = (parseFloat(inMatch[1]) * 2.54).toFixed(1);
      result.depthCm = (parseFloat(inMatch[2]) * 2.54).toFixed(1);
      result.heightCm = (parseFloat(inMatch[3]) * 2.54).toFixed(1);
    }
  }

  // Material
  if (!result.material) {
    const materialKeywords = [
      "wood", "metal", "steel", "fabric", "leather", "plastic",
      "glass", "marble", "oak", "walnut", "pine", "bamboo", "mesh",
      "aluminum", "aluminium", "chrome", "velvet", "linen", "polyester",
    ];
    const lower = text.toLowerCase();
    for (const kw of materialKeywords) {
      if (lower.includes(kw)) {
        result.material = kw.charAt(0).toUpperCase() + kw.slice(1);
        break;
      }
    }
  }

  // Price from text
  if (!result.price) {
    const priceMatch = text.match(/(?:US\s*)?\$\s*(\d+(?:[.,]\d{1,2})?)/);
    if (priceMatch) {
      result.price = priceMatch[1].replace(/,/g, "");
    }
  }

  return result;
}

async function scrapeWithFirecrawl(url: string): Promise<ScrapeResult | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown", "html"],
        timeout: 30000,
      }),
    });

    if (!res.ok) return null;

    const json = await res.json();
    if (!json.success || !json.data) return null;

    const { markdown, html, metadata } = json.data;

    let result: ScrapeResult = {
      title: str(metadata?.["og:title"] || metadata?.ogTitle || metadata?.title).slice(0, 200),
      imageUrl: str(metadata?.["og:image"] || metadata?.ogImage || metadata?.image),
      price: "",
      description: str(metadata?.["og:description"] || metadata?.ogDescription || metadata?.description).slice(0, 500),
      widthCm: "",
      depthCm: "",
      heightCm: "",
      material: "",
    };

    // Try to extract title from first markdown heading if metadata had nothing
    if (!result.title && markdown) {
      const headingMatch = markdown.match(/^#\s+(.+)$/m);
      if (headingMatch && headingMatch[1].length > 5) {
        result.title = headingMatch[1].slice(0, 200);
      }
    }

    // Try to extract first product image from markdown
    if (!result.imageUrl && markdown) {
      const imgMatch = markdown.match(/!\[.*?\]\((https?:\/\/[^\s)]+(?:\.jpg|\.jpeg|\.png|\.webp|\.avif)[^\s)]*)\)/i);
      if (imgMatch) {
        result.imageUrl = imgMatch[1];
      }
    }

    // Parse HTML with Cheerio for structured data
    if (html) {
      const $ = cheerio.load(html);

      if (!result.imageUrl) {
        result.imageUrl =
          $('meta[property="og:image"]').attr("content") ||
          $('img[itemprop="image"]').attr("src") ||
          "";
      }

      // Price from HTML
      const priceSelectors = [
        '.a-price .a-offscreen',
        '[data-testid="price"]',
        '.price-current',
        '.product-price',
        '[itemprop="price"]',
        'meta[property="product:price:amount"]',
        '.a-price-whole',
      ];
      for (const sel of priceSelectors) {
        const el = $(sel).first();
        const val = el.attr("content") || el.text().trim();
        if (val) {
          const match = val.replace(/[^0-9.,]/g, "");
          if (match) {
            result.price = match.replace(/,/g, "");
            break;
          }
        }
      }
    }

    // Extract dimensions, material, and price from full text
    const fullText = markdown || "";
    result = extractFromText(fullText, result);

    return result;
  } catch {
    return null;
  }
}

async function scrapeWithCheerio(url: string): Promise<ScrapeResult> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const title =
    $('meta[property="og:title"]').attr("content") ||
    $("h1").first().text().trim() ||
    $("title").text().trim() ||
    "";

  const imageUrl =
    $('meta[property="og:image"]').attr("content") ||
    $("#landingImage").attr("src") ||
    $("#imgBlkFront").attr("src") ||
    $('img[data-a-dynamic-image]').attr("src") ||
    $("img.product-image").attr("src") ||
    $('img[itemprop="image"]').attr("src") ||
    "";

  let price = "";
  const priceSelectors = [
    '.a-price .a-offscreen',
    '[data-testid="price"]',
    '.price-current',
    '.product-price',
    '[itemprop="price"]',
    'meta[property="product:price:amount"]',
    '.a-price-whole',
  ];
  for (const sel of priceSelectors) {
    const el = $(sel).first();
    const val = el.attr("content") || el.text().trim();
    if (val) {
      const match = val.replace(/[^0-9.,]/g, "");
      if (match) {
        price = match.replace(/,/g, "");
        break;
      }
    }
  }

  const description =
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content") ||
    $("#productDescription p").first().text().trim() ||
    "";

  let result: ScrapeResult = {
    title: title.slice(0, 200),
    imageUrl,
    price,
    description: description.slice(0, 500),
    widthCm: "",
    depthCm: "",
    heightCm: "",
    material: "",
  };

  const bodyText = $("body").text();
  result = extractFromText(bodyText, result);

  return result;
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    // Try Firecrawl first (handles JS-rendered sites like AliExpress, Amazon)
    const firecrawlResult = await scrapeWithFirecrawl(url);

    // Fall back to direct Cheerio scraping
    let cheerioResult: ScrapeResult | null = null;
    try {
      cheerioResult = await scrapeWithCheerio(url);
    } catch {
      // Cheerio may fail on some sites (CORS, blocked, etc.)
    }

    // Return whichever result is more useful
    const fc = firecrawlResult && isUseful(firecrawlResult) ? firecrawlResult : null;
    const ch = cheerioResult && isUseful(cheerioResult) ? cheerioResult : null;

    if (fc && ch) {
      // Merge: prefer Firecrawl but fill gaps from Cheerio
      const merged: ScrapeResult = { ...fc };
      if (!merged.title && ch.title) merged.title = ch.title;
      if (!merged.imageUrl && ch.imageUrl) merged.imageUrl = ch.imageUrl;
      if (!merged.price && ch.price) merged.price = ch.price;
      if (!merged.description && ch.description) merged.description = ch.description;
      if (!merged.widthCm && ch.widthCm) merged.widthCm = ch.widthCm;
      if (!merged.depthCm && ch.depthCm) merged.depthCm = ch.depthCm;
      if (!merged.heightCm && ch.heightCm) merged.heightCm = ch.heightCm;
      if (!merged.material && ch.material) merged.material = ch.material;
      return NextResponse.json(merged);
    }

    if (fc) return NextResponse.json(fc);
    if (ch) return NextResponse.json(ch);

    // Both empty or not useful — return whichever has anything
    const fallback = firecrawlResult && !isEmpty(firecrawlResult)
      ? firecrawlResult
      : cheerioResult && !isEmpty(cheerioResult)
        ? cheerioResult
        : null;

    if (fallback) return NextResponse.json(fallback);

    return NextResponse.json(
      { error: "Could not extract product details from this page. Try entering them manually." },
      { status: 422 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scrape failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
