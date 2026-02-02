import { openRouterService } from './openrouter';
import { logger } from '../utils/logger';

export interface ValidationResult {
  isValid: boolean;
  reason: string;
  confidence: number;
}

export class ChangeValidator {
  async validateChange(
    oldValue: string,
    newValue: string,
    context: string = 'price'
  ): Promise<ValidationResult> {
    try {
      // Quick validation for price changes
      if (context === 'price') {
        const quickValidation = this.quickPriceValidation(oldValue, newValue);
        if (quickValidation.isValid === false) {
          return quickValidation;
        }
      }

      // Use AI for more sophisticated validation
      return await this.validateWithAI(oldValue, newValue, context);
    } catch (error) {
      logger.error('Error validating change:', error);
      // Default to valid if we can't determine
      return {
        isValid: true,
        reason: 'Unable to validate - defaulting to valid',
        confidence: 0.5,
      };
    }
  }

  private quickPriceValidation(oldValue: string, newValue: string): ValidationResult {
    // Extract numeric values
    const oldNum = this.extractNumber(oldValue);
    const newNum = this.extractNumber(newValue);

    if (oldNum === null || newNum === null) {
      // Can't parse numbers, need AI validation
      return { isValid: true, reason: 'Requires AI validation', confidence: 0.5 };
    }

    // Check for suspicious changes (e.g., price went to 0 or extremely high)
    if (newNum === 0 && oldNum > 0) {
      return {
        isValid: false,
        reason: 'Price dropped to zero - likely error or out of stock',
        confidence: 0.9,
      };
    }

    if (newNum > oldNum * 10) {
      return {
        isValid: false,
        reason: 'Price increased by more than 10x - likely error',
        confidence: 0.9,
      };
    }

    // Check for very small changes that might be formatting differences
    const percentChange = Math.abs((newNum - oldNum) / oldNum) * 100;
    if (percentChange < 0.01) {
      return {
        isValid: false,
        reason: `Change is less than 0.01% - likely formatting difference`,
        confidence: 0.8,
      };
    }

    return { isValid: true, reason: 'Requires AI validation', confidence: 0.5 };
  }

  private extractNumber(value: string): number | null {
    // Remove currency symbols and extract number
    const cleaned = value.replace(/[^\d.,]/g, '');
    const normalized = cleaned.replace(',', '');
    const num = parseFloat(normalized);
    return isNaN(num) ? null : num;
  }

  private async validateWithAI(
    oldValue: string,
    newValue: string,
    context: string
  ): Promise<ValidationResult> {
    const systemPrompt = `You are an expert at validating changes detected on web pages.
Determine if a detected change is a REAL, MEANINGFUL change or a FALSE POSITIVE (noise).

Common false positives include:
- Timestamps updating
- Ad content changing
- Recommendation sections updating
- Layout/formatting changes that don't affect content
- Cookie banners appearing/disappearing
- Social media widgets loading
- Minor text formatting differences

Return ONLY valid JSON in this exact format:
{
  "isValid": true/false,
  "reason": "Brief explanation",
  "confidence": 0.0-1.0
}

Rules:
- isValid: true if this is a REAL, MEANINGFUL change worth notifying about
- isValid: false if this is noise/false positive (ads, timestamps, formatting, etc.)
- reason: Brief explanation of your decision
- confidence: How certain you are (0.0-1.0)`;

    const userPrompt = `Validate this change in context: "${context}"

Old value: "${oldValue}"
New value: "${newValue}"

Is this a real, meaningful change or a false positive?
Return the JSON response now:`;

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

      const result = JSON.parse(jsonStr) as ValidationResult;
      
      return {
        isValid: result.isValid ?? true,
        reason: result.reason || 'Validated by AI',
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      };
    } catch (error) {
      logger.error('Error parsing AI validation response:', error);
      return {
        isValid: true,
        reason: 'AI validation failed - defaulting to valid',
        confidence: 0.5,
      };
    }
  }
}

export const changeValidator = new ChangeValidator();
