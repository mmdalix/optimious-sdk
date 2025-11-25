/**
 * Optimious API Client
 */

export interface OptimiousClientConfig {
  fetchUrl: string;
  intervalSeconds?: number;
}

export class OptimiousClient {
  private fetchUrl: string;
  private intervalSeconds: number;
  private parameters: Record<string, number | string> = {};
  private isInitialized: boolean = false;
  private intervalId?: NodeJS.Timeout;

  constructor(config: OptimiousClientConfig) {
    this.fetchUrl = config.fetchUrl;
    this.intervalSeconds = config.intervalSeconds ?? 30;
  }

  private async fetch(): Promise<void> {
    try {
      const response = await fetch(this.fetchUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      const data = await response.json() as { parameters?: Record<string, number | string> };
      if (data.parameters && typeof data.parameters === 'object') {
        this.parameters = data.parameters;
      } else {
        throw new Error('Invalid response format: expected parameters object');
      }
    } catch (error) {
      throw error;
    }
  }

  async init(): Promise<void> {
    try {
      await this.fetch();
      this.isInitialized = true;

      // Set up interval for subsequent fetches
      this.intervalId = setInterval(async () => {
        try {
          await this.fetch();
        } catch (error) {
          console.error('Failed to fetch parameters in interval:', error);
        }
      }, this.intervalSeconds * 1000);
      
      // Don't block process exit - interval will run as long as process is alive
      this.intervalId.unref();
    } catch (error) {
      throw new Error(`Initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getParam(parameterName: string): number | string {
    if (!this.isInitialized) {
      throw new Error('Client not initialized. Call init() first.');
    }

    if (!(parameterName in this.parameters)) {
      throw new Error(`Parameter "${parameterName}" not found`);
    }

    return this.parameters[parameterName];
  }

  /**
   * Clean up the interval when done
   */
  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isInitialized = false;
  }
}

