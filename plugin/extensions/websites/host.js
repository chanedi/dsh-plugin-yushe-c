import { NEWS_SOURCES } from '../../src/host/sources.js';
import { initWebsites, registerWebsiteRoutes } from './config.js';

/** Initialize the extension once; register routes inside the host's webServer scope. */
export function createWebsites(storage) {
  initWebsites(storage, NEWS_SOURCES);
  return registerWebsiteRoutes;
}
