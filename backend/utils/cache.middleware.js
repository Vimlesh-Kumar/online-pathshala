import cacheService from './cache.service.js';

/**
 * Middleware to check cache before executing handler
 * Usage: app.get('/courses', cacheMiddleware('courses:all', 3600), courseHandler)
 */
export const cacheMiddleware = (cacheKey, ttlSeconds = 3600) => {
  return async (req, res, next) => {
    if (!cacheService.isConnected()) {
      return next();
    }

    try {
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        res.set('X-Cache', 'HIT');
        return res.json(JSON.parse(cachedData));
      }
      res.set('X-Cache', 'MISS');

      // Store original send to intercept response
      const originalSend = res.json;
      res.json = function(data) {
        // Cache the response
        cacheService.set(cacheKey, data, ttlSeconds).catch((err) => {
          console.error(`Failed to cache ${cacheKey}:`, err.message);
        });

        // Call original send
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error(`Cache middleware error for ${cacheKey}:`, error.message);
      next();
    }
  };
};

/**
 * Helper to cache function results
 * Usage: const courses = await cacheable('courses:all', () => fetchCourses(), 3600);
 */
export const cacheable = async (key, fetchFn, ttlSeconds = 3600) => {
  if (!cacheService.isConnected()) {
    return fetchFn();
  }

  try {
    const cached = await cacheService.get(key);
    if (cached) {
      console.log(`📦 Cache HIT: ${key}`);
      return JSON.parse(cached);
    }

    const data = await fetchFn();
    await cacheService.set(key, data, ttlSeconds);
    console.log(`💾 Cache SET: ${key} (TTL: ${ttlSeconds}s)`);

    return data;
  } catch (error) {
    console.error(`Cacheable error for ${key}:`, error.message);
    return fetchFn();
  }
};

/**
 * Invalidate related caches
 * Usage: invalidateCache('courses:*', 'user:123:*')
 */
export const invalidateCache = async (...patterns) => {
  if (!cacheService.isConnected()) return;

  for (const pattern of patterns) {
    try {
      // Simple pattern matching - in production consider using Redis KEYS command
      await cacheService.del(pattern);
      console.log(`🗑️  Invalidated cache: ${pattern}`);
    } catch (error) {
      console.error(`Failed to invalidate cache ${pattern}:`, error.message);
    }
  }
};

/**
 * Session storage using cache
 * Usage: await sessionCache.set('user:123', userData); const user = await sessionCache.get('user:123');
 */
export const sessionCache = {
  set: async (userId, data) => {
    const ttl = 24 * 60 * 60; // 24 hours
    return cacheService.set(`session:${userId}`, data, ttl);
  },

  get: async (userId) => {
    const data = await cacheService.get(`session:${userId}`);
    return data ? JSON.parse(data) : null;
  },

  del: async (userId) => {
    return cacheService.del(`session:${userId}`);
  },
};

/**
 * User data caching (shorter TTL)
 * Usage: const user = await userCache.get(userId);
 */
export const userCache = {
  set: async (userId, data) => {
    const ttl = 60 * 60; // 1 hour
    return cacheService.set(`user:${userId}`, data, ttl);
  },

  get: async (userId) => {
    const data = await cacheService.get(`user:${userId}`);
    return data ? JSON.parse(data) : null;
  },

  del: async (userId) => {
    return cacheService.del(`user:${userId}`);
  },
};

/**
 * Course catalog caching (longer TTL)
 * Usage: const courses = await courseCache.getAll();
 */
export const courseCache = {
  setAll: async (data) => {
    const ttl = 7 * 24 * 60 * 60; // 7 days
    return cacheService.set('courses:all', data, ttl);
  },

  getAll: async () => {
    const data = await cacheService.get('courses:all');
    return data ? JSON.parse(data) : null;
  },

  setCourse: async (courseId, data) => {
    const ttl = 7 * 24 * 60 * 60; // 7 days
    return cacheService.set(`course:${courseId}`, data, ttl);
  },

  getCourse: async (courseId) => {
    const data = await cacheService.get(`course:${courseId}`);
    return data ? JSON.parse(data) : null;
  },

  invalidateAll: async () => {
    await cacheService.del('courses:all');
    console.log('🗑️  Invalidated all courses cache');
  },

  invalidateCourse: async (courseId) => {
    await cacheService.del(`course:${courseId}`);
    console.log(`🗑️  Invalidated course ${courseId} cache`);
  },
};
