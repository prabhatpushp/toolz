// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://9867a990b5a5f838207424a080180ed1@o4508381098082304.ingest.us.sentry.io/4508381101555712",

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
