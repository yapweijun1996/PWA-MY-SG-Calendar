/// <reference lib="webworker" />
import { setCacheNameDetails, clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: {url: string; revision: string|null}[] };
// Scope isolates this app from other applications on the same host.
setCacheNameDetails({ prefix: 'my-sg-calendar', suffix: self.registration.scope });
precacheAndRoute(self.__WB_MANIFEST);
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));
clientsClaim();
// Installation never skips waiting without an explicit action in a client.
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting();
  if (event.data?.type === 'BUILD_ID') event.ports[0]?.postMessage(__APP_BUILD__);
});
