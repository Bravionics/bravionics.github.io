'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "app.js": "d325c58841f999ebc7b891316986b8da",
"assets/AssetManifest.json": "2ce8a53de21625498643487e555fc083",
"assets/FontManifest.json": "3a9e5a1eefdc1d45bbc99d417d5f3792",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/lib/assets/app-calendar.png": "47343518b18f38389adf0d3d17a9b582",
"assets/lib/assets/app-home.png": "545129be680438d923e854a53917e0c4",
"assets/lib/assets/app-toolkit.png": "4af3efd850fa3fa073ac37c39c1a57bd",
"assets/lib/assets/backend-1.png": "7dbe84328aba125049fa07c923280f76",
"assets/lib/assets/backend-2.png": "9cb9fe81fbc30cd160a79bb9da317387",
"assets/lib/assets/backend-3.png": "b21d246164e9fb379a455488b6779b1b",
"assets/lib/assets/backend-mobile-1.png": "f5403f6a7e416beab795fed023decfbb",
"assets/lib/assets/backend-mobile-2.png": "49e323a0c6eb1bb62ec34e279c68a377",
"assets/lib/assets/backend-mobile-3.png": "4d031b980fa9e1ca34fc79fc7f47f02c",
"assets/lib/assets/bhawkinsavatar.JPG": "dd06e1dc1a4d29791fb627362be354be",
"assets/lib/assets/contact-us-background.png": "1812816532d9ce758307150740275737",
"assets/lib/assets/contact-us-phone.png": "3a6a72d0d627d616eef0453baa432ab5",
"assets/lib/assets/icon-app.png": "f417c6f74eddd609dda21d02c2d8ccd6",
"assets/lib/assets/icon-backToTop.png": "ee290a8bcafe5f21c1d22ec18af4aa00",
"assets/lib/assets/icon-edit.png": "c4c35f49a4d637e1e03bd7345106223c",
"assets/lib/assets/icon-editPresets.png": "5c121d471ed9bb87413dfb6c87fbe746",
"assets/lib/assets/icon-info.png": "f2f2c836903dada2c17d614d8d96af1c",
"assets/lib/assets/icon-pageButton.png": "0f5699c90c5b84473698700e559b9171",
"assets/lib/assets/icon-sliders.png": "24425a59e94fe1d66932e0d18be8ae45",
"assets/lib/assets/integral-icon.png": "6ba23b2bcc374584b7a59ad697cac2b0",
"assets/lib/assets/iphone-frame.png": "e120e3dd4ba2434db7477d3077235aff",
"assets/lib/assets/logo_white.png": "9c5eabb0f8fd3612d89d8ee3c30b0a6c",
"assets/lib/assets/mkwonavatar.jpg": "86e76207f7558364b0788eaa53735efa",
"assets/lib/assets/pcuiavatar.jpg": "6ed5dd4f65f0c3cb5e81d56dd05ce567",
"assets/lib/fonts/futura_book.ttf": "f9f02ed05aa86534c3842d44cb20d6c4",
"assets/lib/fonts/futura_light.ttf": "98d2f97305ab25d4511982e73740922e",
"assets/lib/fonts/futura_medium.ttf": "ee64fb9d3f1ba2333e1b489283925bce",
"assets/NOTICES": "7583c99c7c562e6284b38518265aa8fa",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "b14fcf3ee94e3ace300b192e9e7c8c5d",
"favicon.png": "334b14e1abddb67c5253d1a9bf691376",
"icons/Icon-192.png": "d000bf00e07cc6975c3bffc613ebf05c",
"icons/Icon-512.png": "13bf42d8342d3659419e20ae0463f5e9",
"index.html": "df85e86919fc596368c57ae306f1e740",
"/": "df85e86919fc596368c57ae306f1e740",
"main.dart.js": "e96f8f88540721d4dd673a5c726a9b5b",
"manifest.json": "f21f7fa0a5876b178996f4eb9b0272c0",
"version.json": "a0de4ed2e882d6adf142ecaf9c377119"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
