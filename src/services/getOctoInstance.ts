import { Octokit } from "@octokit/rest";
import { InstanceConfig } from "./getSettings";

type CacheKey = string;
type OctokitRequestResult<T extends (...args: any) => any> = Awaited<
  ReturnType<T>
>;

function createGetOctoInstance() {
  // Singleton of Octokit instances
  const instances = new Map<string, Octokit>();
  // Singleton cache
  const cache = new Map<
    CacheKey,
    Promise<OctokitRequestResult<Octokit["request"]>>
  >();

  return (instanceConfig: InstanceConfig): Octokit => {
    const instanceKey = `${instanceConfig.pat}:${instanceConfig.ghBaseUrl}`; // Unique key for each instanceConfig

    // If an instance already exists for the given key, return it
    if (instances.has(instanceKey)) {
      return instances.get(instanceKey) as Octokit;
    }

    // Create a new Octokit instance
    const octokit = new Octokit({
      auth: instanceConfig.pat,
      baseUrl: instanceConfig.ghBaseUrl,
    });

    // Add caching behavior using octokit hooks
    octokit.hook.wrap("request", async (request, options) => {
      const nonCacheableMethods = ["POST", "PUT", "DELETE"];

      // If the request method is non-cacheable, bypass the cache
      if (nonCacheableMethods.includes(options.method)) {
        return request(options); // Execute the request directly
      }

      // Due to the [key: string]: unknown; signature,
      // the options object has the keys only at runtime, hence the need to stringify it
      const optionsForCacheKey: Partial<typeof options> = { ...options };
      delete optionsForCacheKey.headers;
      delete optionsForCacheKey.request;
      const cacheKey: CacheKey = JSON.stringify(optionsForCacheKey);

      // Check if there is already a cached or in-flight request
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey)!; // Return the cached promise
      }

      // Otherwise, execute the request and cache the promise
      const requestPromise = (async () => {
        try {
          const response = await request(options);
          // Cache the resolved response for future identical requests
          cache.set(cacheKey, Promise.resolve(response));
          return response;
        } catch (error) {
          // Remove from cache if the request fails
          cache.delete(cacheKey);
          throw error;
        }
      })();

      cache.set(cacheKey, requestPromise); // Cache the in-flight promise
      return requestPromise;
    });

    // Store the new Octokit instance in the map
    instances.set(instanceKey, octokit);

    return octokit;
  };
}

// Create a singleton factory function
export const getOctoInstance = createGetOctoInstance();
