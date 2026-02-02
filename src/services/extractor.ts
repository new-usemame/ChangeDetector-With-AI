import { openRouterService } from './openrouter';
import { extractJsonLd, cleanHtml, extractTextContent } from '../utils/html-parser';
import { logger } from '../utils/logger';

export interface PriceExtractionResult {
  price: string | null;
  currency: string | null;
  productName: string | null;
  available: boolean | null;
  confidence: number;
  rawData?: any;
}

export class PriceExtractor {
  async extractPrice(html: string, url?: string, previousPrice?: string): Promise<PriceExtractionResult> {
    try {
      // First, try to extract structured data (JSON-LD)
      const jsonLdData = extractJsonLd(html);
      const structuredPrice = this.extractFromJsonLd(jsonLdData);
      
      if (structuredPrice.price) {
        logger.debug('Found price in structured data');
        return structuredPrice;
      }

      // If no structured data, use AI to extract from HTML
      logger.debug('Using AI to extract price from HTML');
      return await this.extractWithAI(html, url, previousPrice);
    } catch (error) {
      logger.error('Error extracting price:', error);
      return {
        price: null,
        currency: null,
        productName: null,
        available: null,
        confidence: 0,
      };
    }
  }

  private extractFromJsonLd(jsonLdData: any[]): PriceExtractionResult {
    for (const data of jsonLdData) {
      if (data['@type'] === 'Product' || data['@type'] === 'http://schema.org/Product') {
        const offers = data.offers || (Array.isArray(data.offers) ? data.offers[0] : null);
        const price = offers?.price || data.price;
        const currency = offers?.priceCurrency || data.priceCurrency || 'USD';
        const availability = offers?.availability || data.availability;
        const available = availability 
          ? (availability.includes('InStock') || availability.includes('In Stock'))
          : null;

        if (price) {
          return {
            price: String(price),
            currency: currency || 'USD',
            productName: data.name || null,
            available,
            confidence: 0.95,
            rawData: data,
          };
        }
      }
    }

    return {
      price: null,
      currency: null,
      productName: null,
      available: null,
      confidence: 0,
    };
  }

  private async extractWithAI(html: string, url?: string, previousPrice?: string): Promise<PriceExtractionResult> {
    // Clean and prepare HTML for AI processing
    const cleanedHtml = cleanHtml(html);
    const textContent = extractTextContent(html, 30000); // Limit to 30k chars for AI

    const systemPrompt = `You are an expert at extracting product information from HTML pages. 
Extract the main product price, currency, product name, and availability status.
Return ONLY valid JSON in this exact format:
{
  "price": "29.99" or null,
  "currency": "USD" or null,
  "productName": "Product Name" or null,
  "available": true/false or null,
  "confidence": 0.0-1.0
}

Rules:
- Extract the MAIN product price (not related products, not shipping costs)
- If multiple prices exist, use the current/active price
- Currency should be a 3-letter code (USD, EUR, GBP, etc.)
- available should be true if product is in stock, false if out of stock, null if unknown
- confidence should reflect how certain you are (0.0-1.0)
- Return null for any field you cannot determine`;

    const userPrompt = `Extract product information from this HTML page${url ? ` (URL: ${url})` : ''}:
${previousPrice ? `Previous price was: ${previousPrice}` : ''}

HTML content:
${textContent}

Return the JSON response now:`;

    try {
      const response = await openRouterService.extractText([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);

      // Parse JSON from response (might have markdown code blocks)
      let jsonStr = response.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
      }

      const result = JSON.parse(jsonStr) as PriceExtractionResult;
      
      // Validate and normalize
      return {
        price: result.price || null,
        currency: result.currency || null,
        productName: result.productName || null,
        available: result.available ?? null,
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      };
    } catch (error) {
      logger.error('Error parsing AI response:', error);
      return {
        price: null,
        currency: null,
        productName: null,
        available: null,
        confidence: 0,
      };
    }
  }
}

export const priceExtractor = new PriceExtractor();
