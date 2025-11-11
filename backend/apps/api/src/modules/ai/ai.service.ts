import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HfInference } from '@huggingface/inference';

export interface AIFeedbackResult {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  suggestions: {
    type: string;
    original?: string;
    suggestion: string;
    reasoning: string;
  }[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private hf: HfInference;
  private readonly llmModel: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('huggingface.apiKey');
    if (!apiKey) {
      throw new ServiceUnavailableException('HuggingFace API key not configured');
    }

    this.llmModel = this.configService.get<string>('huggingface.llmModel') ?? 'gpt2';
    this.hf = new HfInference(apiKey);
  }

  /**
   * Get AI feedback on a poem
   */
  async getPoemFeedback(title: string, content: string): Promise<AIFeedbackResult> {
    const startTime = Date.now();

    try {
      const prompt = this.buildFeedbackPrompt(title, content);

      this.logger.log(`Requesting feedback from ${this.llmModel}`);

      const response = await this.hf.textGeneration({
        model: this.llmModel,
        inputs: prompt,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false,
        },
      });

      const processingTime = Date.now() - startTime;
      this.logger.log(`Feedback received in ${processingTime}ms`);

      // Parse the response
      const feedback = this.parseFeedbackResponse(response.generated_text);

      return feedback;
    } catch (error) {
      this.logger.error('Error getting AI feedback:', error);
      
      // Return fallback feedback instead of throwing
      return this.getFallbackFeedback(content);
    }
  }

  /**
   * Calculate quality score based on various metrics
   */
  calculateQualityScore(content: string, feedback?: AIFeedbackResult): number {
    let score = 50; // Base score

    // Length factor (optimal range: 100-500 words)
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 50 && wordCount <= 500) {
      score += 15;
    } else if (wordCount < 20) {
      score -= 10;
    }

    // Line breaks (indicates structure)
    const lineCount = content.split('\n').filter(line => line.trim()).length;
    if (lineCount >= 4) {
      score += 10;
    }

    // Vocabulary richness (unique words ratio)
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(words);
    const richnessRatio = uniqueWords.size / words.length;
    score += Math.floor(richnessRatio * 20);

    // If we have AI feedback, incorporate it
    if (feedback) {
      score = Math.floor((score + feedback.overallScore) / 2);
    }

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate embedding for semantic search (placeholder - will implement later)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // For now, return a placeholder
    // We'll implement this properly with sentence-transformers later
    this.logger.warn('Embedding generation not yet implemented - returning placeholder');
    return new Array(384).fill(0);
  }

  /**
   * Build the feedback prompt for the LLM
   */
  private buildFeedbackPrompt(title: string, content: string): string {
    return `You are an expert poetry critic. Analyze the following poem and provide constructive feedback.

Poem Title: "${title}"

Poem Content:
${content}

Please provide feedback in the following format:

SCORE: [A number from 0-100 representing overall quality]

STRENGTHS:
- [List 2-3 specific strengths]

IMPROVEMENTS:
- [List 2-3 areas for improvement]

SUGGESTIONS:
- [1-2 specific actionable suggestions]

Keep your feedback constructive, specific, and helpful for a poet looking to improve their craft.`;
  }

  /**
   * Parse the LLM response into structured feedback
   */
  private parseFeedbackResponse(responseText: string): AIFeedbackResult {
    try {
      // Extract score
      const scoreMatch = responseText.match(/SCORE:\s*(\d+)/i);
      const overallScore = scoreMatch ? parseInt(scoreMatch[1]) : 70;

      // Extract strengths
      const strengthsMatch = responseText.match(/STRENGTHS:([\s\S]*?)(?=IMPROVEMENTS:|$)/i);
      const strengths = strengthsMatch
        ? strengthsMatch[1]
            .split('\n')
            .filter(line => line.trim().startsWith('-'))
            .map(line => line.replace(/^-\s*/, '').trim())
            .filter(Boolean)
        : ['Shows creative expression', 'Has a clear voice'];

      // Extract improvements
      const improvementsMatch = responseText.match(/IMPROVEMENTS:([\s\S]*?)(?=SUGGESTIONS:|$)/i);
      const improvements = improvementsMatch
        ? improvementsMatch[1]
            .split('\n')
            .filter(line => line.trim().startsWith('-'))
            .map(line => line.replace(/^-\s*/, '').trim())
            .filter(Boolean)
        : ['Consider adding more vivid imagery'];

      // Extract suggestions
      const suggestionsMatch = responseText.match(/SUGGESTIONS:([\s\S]*?)$/i);
      const suggestionTexts = suggestionsMatch
        ? suggestionsMatch[1]
            .split('\n')
            .filter(line => line.trim().startsWith('-'))
            .map(line => line.replace(/^-\s*/, '').trim())
            .filter(Boolean)
        : ['Experiment with different metaphors'];

      const suggestions = suggestionTexts.map(text => ({
        type: 'general',
        suggestion: text,
        reasoning: 'Based on poetic analysis',
      }));

      return {
        overallScore: Math.max(0, Math.min(100, overallScore)),
        strengths: strengths.slice(0, 3),
        improvements: improvements.slice(0, 3),
        suggestions: suggestions.slice(0, 2),
      };
    } catch (error) {
      this.logger.error('Error parsing feedback response:', error);
      return this.getFallbackFeedback('');
    }
  }

  /**
   * Fallback feedback when AI service fails
   */
  private getFallbackFeedback(content: string): AIFeedbackResult {
    const wordCount = content.split(/\s+/).length;

    return {
      overallScore: 65,
      strengths: [
        'Your poem shows authentic voice and personal expression',
        'The writing demonstrates effort and creativity',
      ],
      improvements: [
        'Consider adding more sensory details to enhance imagery',
        'Experiment with varied line lengths for rhythm',
      ],
      suggestions: [
        {
          type: 'structure',
          suggestion: 'Try breaking longer lines into shorter phrases for impact',
          reasoning: 'This can create natural pauses and emphasize key ideas',
        },
      ],
    };
  }
}