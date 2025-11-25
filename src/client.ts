/**
 * Optimious API Client
 */

export class OptimiousClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: { baseUrl: string; apiKey?: string }) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  /**
   * Example method - replace with actual SDK methods
   */
  async ping(): Promise<string> {
    return 'pong';
  }
}

