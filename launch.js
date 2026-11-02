// Preserve shared lesson hashes and query strings when opening the app entry point.
const appEntry = new URL('dist/', location.href);
appEntry.search = location.search;
appEntry.hash = location.hash;
location.replace(appEntry.href);
