/**
 * Bulk Operations Utility
 * Provides helpers for batch processing operations
 */

export interface BulkOperationResult<T = any> {
  success: boolean;
  successCount: number;
  failureCount: number;
  results: Array<{
    item: T;
    success: boolean;
    error?: string;
  }>;
}

/**
 * Execute an operation on multiple items in batches
 * Useful for avoiding rate limits and managing memory
 */
export async function executeBulkOperation<T, R>(
  items: T[],
  operation: (item: T) => Promise<R>,
  options: {
    batchSize?: number;
    delayBetweenBatches?: number; // in milliseconds
    onProgress?: (completed: number, total: number) => void;
  } = {},
): Promise<BulkOperationResult<T>> {
  const { batchSize = 10, delayBetweenBatches = 0, onProgress } = options;

  const results: Array<{
    item: T;
    success: boolean;
    error?: string;
  }> = [];

  let successCount = 0;
  let failureCount = 0;

  // Process items in batches
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    // Execute operations for this batch in parallel
    const batchResults = await Promise.allSettled(
      batch.map((item) => operation(item)),
    );

    // Process results
    batchResults.forEach((result, index) => {
      const item = batch[index];

      if (result.status === "fulfilled") {
        results.push({
          item,
          success: true,
        });
        successCount++;
      } else {
        results.push({
          item,
          success: false,
          error: result.reason?.message || "Unknown error",
        });
        failureCount++;
      }
    });

    // Report progress
    if (onProgress) {
      onProgress(i + batch.length, items.length);
    }

    // Delay between batches if specified
    if (delayBetweenBatches > 0 && i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return {
    success: failureCount === 0,
    successCount,
    failureCount,
    results,
  };
}

/**
 * Validate items before bulk operation
 */
export function validateBulkItems<T>(
  items: T[],
  validator: (item: T, index: number) => string | null,
): {
  valid: boolean;
  errors: Array<{ index: number; item: T; error: string }>;
} {
  const errors: Array<{ index: number; item: T; error: string }> = [];

  items.forEach((item, index) => {
    const error = validator(item, index);
    if (error) {
      errors.push({ index, item, error });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Group items by a key for organized bulk operations
 */
export function groupItemsBy<T>(
  items: T[],
  keyExtractor: (item: T) => string,
): Record<string, T[]> {
  const groups: Record<string, T[]> = {};

  items.forEach((item) => {
    const key = keyExtractor(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  });

  return groups;
}

/**
 * Chunk an array into smaller arrays
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Retry a failed operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number; // in milliseconds
    maxDelay?: number;
    backoffFactor?: number;
  } = {},
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = options;

  let lastError: Error | undefined;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * backoffFactor, maxDelay);
      }
    }
  }

  throw lastError;
}
