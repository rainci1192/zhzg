'use strict';

function protectContentApiRoutes(routes) {
  if (!Array.isArray(routes)) return routes;
  return routes.map((route) => {
    const method = String(route.method || '').toUpperCase();
    if (!['POST', 'DELETE'].includes(method)) return route;
    const config = route.config || {};
    const policies = Array.isArray(config.policies) ? config.policies : [];
    if (policies.some((policy) => (typeof policy === 'string' ? policy : policy?.name) === 'global::backend-upload-rbac')) return route;
    return {
      ...route,
      config: {
        ...config,
        policies: [...policies, {
          name: 'global::backend-upload-rbac',
          config: { action: method === 'DELETE' ? 'delete' : 'create' },
        }],
      },
    };
  });
}

function protectRouteFactoryResult(result) {
  if (Array.isArray(result)) return protectContentApiRoutes(result);
  if (result && Array.isArray(result.routes)) {
    return { ...result, routes: protectContentApiRoutes(result.routes) };
  }
  return result;
}

module.exports = (plugin) => {
  const originalRoutes = plugin.routes?.['content-api'];
  if (typeof originalRoutes === 'function') {
    const wrappedRoutes = (...args) => protectRouteFactoryResult(originalRoutes(...args));
    // Strapi's route factory exposes a .routes accessor for compatibility with
    // plugin extensions; preserve it while returning the protected route set.
    Object.defineProperty(wrappedRoutes, 'routes', {
      enumerable: true,
      get: () => protectContentApiRoutes(originalRoutes.routes),
      set: (value) => { originalRoutes.routes = value; },
    });
    plugin.routes['content-api'] = wrappedRoutes;
  } else if (Array.isArray(originalRoutes)) {
    plugin.routes['content-api'] = protectContentApiRoutes(originalRoutes);
  } else if (originalRoutes && Array.isArray(originalRoutes.routes)) {
    plugin.routes['content-api'] = {
      ...originalRoutes,
      routes: protectContentApiRoutes(originalRoutes.routes),
    };
  }
  return plugin;
};
