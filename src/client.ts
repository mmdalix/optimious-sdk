/**
 * Optimious API Client
 */

export type ParameterValue = number | string;

export type ParameterChangeType = 'added' | 'updated' | 'deleted';

export interface ParameterChange {
  name: string;
  type: ParameterChangeType;
  oldValue?: ParameterValue;
  newValue?: ParameterValue;
}

export type ParameterChangeListener = (changes: ParameterChange[]) => void;

export interface OptimiousClientConfig {
  fetchUrl: string;
  intervalSeconds?: number;
}

export class OptimiousClient {
  private fetchUrl: string;
  private intervalSeconds: number;
  private parameters: Record<string, ParameterValue> = {};
  private isInitialized: boolean = false;
  private intervalId?: NodeJS.Timeout;
  private listeners: Set<ParameterChangeListener> = new Set();

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

      const data = (await response.json()) as { parameters?: Record<string, ParameterValue> };
      if (data.parameters && typeof data.parameters === 'object') {
        const nextParameters = data.parameters;
        const prevParameters = this.parameters;
        const changes: ParameterChange[] = [];

        // Added or updated
        for (const [name, newValue] of Object.entries(nextParameters)) {
          if (!(name in prevParameters)) {
            changes.push({ name, type: 'added', newValue });
          } else {
            const oldValue = prevParameters[name];
            if (oldValue !== newValue) {
              changes.push({ name, type: 'updated', oldValue, newValue });
            }
          }
        }

        // Deleted
        for (const [name, oldValue] of Object.entries(prevParameters)) {
          if (!(name in nextParameters)) {
            changes.push({ name, type: 'deleted', oldValue });
          }
        }

        this.parameters = nextParameters;
        this.notifyListeners(changes);
      } else {
        throw new Error('Invalid response format: expected parameters object');
      }
    } catch (error) {
      throw error;
    }
  }

  private notifyListeners(changes: ParameterChange[]): void {
    if (changes.length === 0) return;

    for (const listener of this.listeners) {
      try {
        listener(changes);
      } catch (error) {
        console.error('Error in parameter change listener:', error);
      }
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

  getParam(parameterName: string): ParameterValue {
    if (!this.isInitialized) {
      throw new Error('Client not initialized. Call init() first.');
    }

    if (!(parameterName in this.parameters)) {
      throw new Error(`Parameter "${parameterName}" not found`);
    }

    return this.parameters[parameterName];
  }

  /**
   * Subscribe to parameter changes.
   * Returns an unsubscribe function for convenience.
   */
  subscribe(listener: ParameterChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.unsubscribe(listener);
    };
  }

  /**
   * Unsubscribe a previously registered listener.
   */
  unsubscribe(listener: ParameterChangeListener): void {
    this.listeners.delete(listener);
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
    this.listeners.clear();
  }
}

