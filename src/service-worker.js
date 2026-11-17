import { clientsClaim } from "workbox-core";
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

clientsClaim();
cleanupOutdatedCaches();
// eslint-disable-next-line no-restricted-globals
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  new NavigationRoute(
    createHandlerBoundToURL(`${process.env.PUBLIC_URL}/index.html`),
    { denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/] }
  )
);
