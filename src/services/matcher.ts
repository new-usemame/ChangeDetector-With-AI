import { openRouterService } from './openrouter';
import { logger } from '../utils/logger';

export interface ProductMatchResult {
  isMatch: boolean;
  confidence: number;
  reason: string;
  similarityScore?: number;
}

export interface ProductInfo {
  name?: string;
  url?: string;
  price?: string;
  imageUrl?: string;
  description?: string;
  sku?: string;
}

export class ProductMatcher {
  async matchProducts(
    product1: ProductInfo,
    product2: ProductInfo
  ): Promise<ProductMatchResult> {
    try {
      // Quick checks first
      const quickMatch = this.quickMatch(product1, product2);
      if (quickMatch.isMatch && quickMatch.confidence > 0.9) {
        return quickMatch;
      }

      // Use AI for semantic matching
      return await this.matchWithAI(product1, product2);
    } catch (error) {
      logger.error('Error matching products:', error);
      return {
        isMatch: false,
        confidence: 0,
        reason: 'Error during matching',
      };
    }
  }

  private quickMatch(product1: ProductInfo, product2: ProductInfo): ProductMatchResult {
    // Exact URL match
    if (product1.url && product2.url && product1.url === product2.url) {
      return {
        isMatch: true,
        confidence: 1.0,
        reason: 'Exact URL match',
      };
    }

    // Exact SKU match
    if (product1.sku && product2.sku && product1.sku === product2.sku) {
      return {
        isMatch: true,
        confidence: 0.95,
        reason: 'Exact SKU match',
      };
    }

    // Exact name match (case-insensitive)
    if (product1.name && product2.name) {
      const name1 = product1.name.toLowerCase().trim();
      const name2 = product2.name.toLowerCase().trim();
      if (name1 === name2) {
        return {
          isMatch: true,
          confidence: 0.9,
          reason: 'Exact name match',
        };
      }
    }

    // No quick match found
    return {
      isMatch: false,
      confidence: 0.5,
      reason: 'Requires AI matching',
    };
  }

  private async matchWithAI(
    product1: ProductInfo,
    product2: ProductInfo
  ): Promise<ProductMatchResult> {
    const systemPrompt = `You are an expert at matching products across different websites and URLs.
Determine if two product descriptions refer to the SAME product, even if:
- URLs are different
- Product IDs/SKUs are different
- Descriptions are slightly different
- One is a variant of the other (different size/color)

Return ONLY valid JSON in this exact format:
{
  "isMatch": true/false,
  "confidence": 0.0-1.0,
  "reason": "Brief explanation",
  "similarityScore": 0.0-1.0
}

Rules:
- isMatch: true if these are the SAME product (or variants of the same product)
- isMatch: false if these are DIFFERENT products
- confidence: How certain you are (0.0-1.0)
- similarityScore: How similar the products are (0.0-1.0)
- reason: Brief explanation of your decision

Consider:
- Product name similarity (accounting for minor variations)
- Price similarity (same price suggests same product)
- Description similarity
- Image similarity (if provided)
- SKU/ID patterns (even if different, might be related)`;

    const product1Str = this.formatProductInfo(product1);
    const product2Str = this.formatProductInfo(product2);

    const userPrompt = `Are these two products the SAME product?

Product 1:
${product1Str}

Product 2:
${product2Str}

Determine if these refer to the same product (or variants). Return the JSON response now:`;

    try {
      const response = await openRouterService.extractText([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);

      // Parse JSON from response
      let jsonStr = response.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
      }

      const result = JSON.parse(jsonStr) as ProductMatchResult;
      
      return {
        isMatch: result.isMatch ?? false,
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
        reason: result.reason || 'Matched by AI',
        similarityScore: result.similarityScore ? Math.max(0, Math.min(1, result.similarityScore)) : undefined,
      };
    } catch (error) {
      logger.error('Error parsing AI match response:', error);
      return {
        isMatch: false,
        confidence: 0,
        reason: 'AI matching failed',
      };
    }
  }

  private formatProductInfo(product: ProductInfo): string {
    const parts: string[] = [];
    
    if (product.name) parts.push(`Name: ${product.name}`);
    if (product.url) parts.push(`URL: ${product.url}`);
    if (product.price) parts.push(`Price: ${product.price}`);
    if (product.sku) parts.push(`SKU: ${product.sku}`);
    if (product.description) parts.push(`Description: ${product.description}`);
    if (product.imageUrl) parts.push(`Image: ${product.imageUrl}`);
    
    return parts.join('\n') || 'No information provided';
  }
}

export const productMatcher = new ProductMatcher();
