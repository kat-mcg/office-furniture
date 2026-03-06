import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status}` },
        { status: 400 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try common selectors for product info
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

    // Price extraction
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

    // Description
    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      $("#productDescription p").first().text().trim() ||
      "";

    // Try to find dimensions from text
    let widthCm = "";
    let depthCm = "";
    let heightCm = "";
    const dimensionText = $("body").text();
    // Look for patterns like "60 x 40 x 75 cm" or "24 x 16 x 30 inches"
    const cmMatch = dimensionText.match(
      /(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*cm/i
    );
    const inMatch = dimensionText.match(
      /(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:in|inch)/i
    );
    if (cmMatch) {
      widthCm = cmMatch[1];
      depthCm = cmMatch[2];
      heightCm = cmMatch[3];
    } else if (inMatch) {
      widthCm = (parseFloat(inMatch[1]) * 2.54).toFixed(1);
      depthCm = (parseFloat(inMatch[2]) * 2.54).toFixed(1);
      heightCm = (parseFloat(inMatch[3]) * 2.54).toFixed(1);
    }

    // Material
    let material = "";
    const materialKeywords = [
      "wood", "metal", "steel", "fabric", "leather", "plastic",
      "glass", "marble", "oak", "walnut", "pine", "bamboo", "mesh",
    ];
    const bodyText = $("body").text().toLowerCase();
    for (const kw of materialKeywords) {
      if (bodyText.includes(kw)) {
        material = kw.charAt(0).toUpperCase() + kw.slice(1);
        break;
      }
    }

    return NextResponse.json({
      title: title.slice(0, 200),
      imageUrl,
      price,
      description: description.slice(0, 500),
      widthCm,
      depthCm,
      heightCm,
      material,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scrape failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
