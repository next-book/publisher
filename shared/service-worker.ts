export type iso = string;

// Service worker messages API
type ResultSuccess<T> = { success: true; data?: T };
type ResultError = { success: false; error: Error };
type Result<T> = ResultSuccess<T> | ResultError;
interface ResultData {
  error?: string;
}
type SwAPI<Request, ResultData> = {
  req: Request;
  res: Result<ResultData>;
};

interface Metadata extends ResultData {
  activatedAt?: iso;
  cacheDeletedAt?: iso;
  oldCacheDeletedAt?: iso;
  cacheUpdatedAt?: iso;
  ignoreCache: boolean;
  cacheExists: boolean;
}

interface ActivatedAt extends ResultData {
  activatedAt?: iso;
}

interface OldCacheDeletedAt extends ResultData {
  oldCacheDeletedAt?: iso;
}

interface CacheDeletedAt extends ResultData {
  cacheDeletedAt?: iso;
}

interface CacheUpdatedAt extends ResultData {
  cacheUpdatedAt?: iso;
}

type CacheDeletedAndUpdatedAt = CacheUpdatedAt & CacheDeletedAt;

interface IgnoreCache extends ResultData {
  ignoreCache: boolean;
}

interface CacheExists extends ResultData {
  cacheExists: boolean;
}

/**
 * Allowed service worker API messages
 */
enum Messages {
  getMetadata = 'getMetadata',
  getActivatedAt = 'getActivatedAt',

  getOldCacheDeletedAt = 'getOldCacheDeletedAt',
  deleteOldCache = 'deleteOldCache',

  getCacheDeletedAt = 'getCacheDeletedAt',
  getCacheExists = 'getCacheExists',
  deleteCache = 'deleteCache',

  updateCache = 'updateCache',
  getCacheUpdatedAt = 'getCacheUpdatedAt',

  getIgnoreCache = 'getIgnoreCache',
  setIgnoreCache = 'setIgnoreCache',
}

/**
 * Returns service worker metadata.
 */
export type GetMetadataAPI = SwAPI<{ message: Messages.getMetadata }, Metadata>;
/**
 * Returns iso timestamp of last service worker activation.
 */
export type GetActivatedAtAPI = SwAPI<{ message: Messages.getActivatedAt }, ActivatedAt>;

/**
 * Returns iso timestamp of last deletion of the old cache that corresponds to the outdated git revision id.
 * @remarks
 * Does not reflect the cache deletion via browser api e.g. developer tools.
 * The value is updated only via {@link DeleteOldCacheAPI} and {@link handleActivate} deletion.
 */
export type GetOldCacheDeletedAtAPI = SwAPI<
  { message: Messages.getOldCacheDeletedAt },
  OldCacheDeletedAt
>;
/**
 * Deletes the old cache that corresponds to the outdated git revision id.
 * @remarks
 * Do not confuse with {@link DeleteCacheAPI} which deletes the current cache that corresponds to the current git revision id.
 */
export type DeleteOldCacheAPI = SwAPI<{ message: Messages.deleteOldCache }, OldCacheDeletedAt>;

/**
 * Returns iso timestamp of last deletion of the current cache that corresponds to the current git revision id.
 * @remarks
 * Does not reflect the cache deletion via browser api e.g. developer tools.
 * The value is updated only via {@link DeleteCacheAPI} deletion.
 */
export type GetCacheDeletedAtAPI = SwAPI<{ message: Messages.getCacheDeletedAt }, CacheDeletedAt>;
/**
 * Returns boolean indicating existance of the current cache that corresponds to the current git revision id.
 */
export type GetCacheExistsAPI = SwAPI<{ message: Messages.getCacheExists }, CacheExists>;
/**
 * Deletes the current cache that corresponds to the current git revision id.
 * @remarks
 * Do not confuse with {@link DeleteOldCacheAPI} which deletes the cache that corresponds to outdated git revision id.
 */
export type DeleteCacheAPI = SwAPI<{ message: Messages.deleteCache }, CacheDeletedAt>;

/**
 * Returns iso timestamp of last update of the current cache that corresponds to the current git revision id.
 * @remarks
 * The value is updated only via invoking {@link UpdateCacheAPI} and via service worker activation handler {@link handleActivate}.
 */
export type GetCacheUpdatedAtAPI = SwAPI<{ message: Messages.getCacheUpdatedAt }, CacheUpdatedAt>;
/**
 * Completely updates the current cache that corresponds to the current git revision id.
 * Returns timestamps for both last cache deletion and update.
 *
 * @remarks
 * - Used when we need to work with actual files. When files change, its neccessary to call updateCache again.
 * - Alternatively, we may prevent hitting cache altogether by using {@link SetIgnoreCacheAPI}.
 */
export type UpdateCacheAPI = SwAPI<{ message: Messages.updateCache }, CacheDeletedAndUpdatedAt>;

/**
 * Returns boolean that represents whether hitting cache is being prevented.
 */
export type GetIgnoredCacheAPI = SwAPI<{ message: Messages.getIgnoreCache }, IgnoreCache>;
/**
 * Sets whether hitting cache is being prevented.
 *
 * When set to true, the cache may still exist and be updated but the any request
 * of file will proceed to fetch the file as if there is no cache.
 * When set to false, the cached requests will be served as usual.
 *
 * @remarks
 * Used when we need to be sure we always work with actual files.
 */
export type SetIgnoreCacheAPI = SwAPI<
  { message: Messages.setIgnoreCache; payload: { value: boolean } },
  IgnoreCache
>;
