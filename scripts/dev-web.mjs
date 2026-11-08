#!/usr/bin/env node
/**
 * Starts the website on the first free port at or above 3000.
 *
 * `next dev` fails with a bare `EADDRINUSE` when the port is taken, which is
 * a confusing way to learn that an earlier dev server is still running. This
 * finds a free port instead and says so plainly.
 *
 * Set WEB_PORT to choose a different starting port, and WEB_HOSTNAME to change
 * the interface it binds to. The default is loopback only; set
 * WEB_HOSTNAME=0.0.0.0 to reach the dev server from a phone on the same
 * network.
 */
import { spawn } from 'node:child_process';
import net from 'node:net';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const BASE_PORT = Number(process.env.WEB_PORT ?? 3000);
const HOSTNAME = process.env.WEB_HOSTNAME ?? '127.0.0.1';
const MAX_ATTEMPTS = 20;

function portIsFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    // The probe must bind exactly the way Next will, or it will disagree
    // with Next about whether a port is taken.
    server.listen({ port, host: HOSTNAME });
  });
}

async function findFreePort(start) {
  for (let port = start; port < start + MAX_ATTEMPTS; port += 1) {
    if (await portIsFree(port)) return port;
  }
  return null;
}

const port = await findFreePort(BASE_PORT);

if (port === null) {
  console.error(
    `\n  Could not find a free port between ${BASE_PORT} and ${BASE_PORT + MAX_ATTEMPTS - 1}.\n`,
  );
  process.exit(1);
}

if (port !== BASE_PORT) {
  console.log(`\n  Port ${BASE_PORT} is already in use.`);
  console.log(
    '  Either a dev server from an earlier session is still running, or another',
  );
  console.log('  program has the port. Starting the website on port ' + port + ' instead.');
  console.log(
    '  If the dev server you wanted is the one already running, stop this one and use that.\n',
  );
}

const nextBin = require.resolve('next/dist/bin/next');

const child = spawn(
  process.execPath,
  [nextBin, 'dev', '--port', String(port), '--hostname', HOSTNAME],
  {
    stdio: 'inherit',
    env: { ...process.env, PORT: String(port) },
  },
);

const stop = (signal) => {
  if (!child.killed) child.kill(signal);
};

process.on('SIGINT', () => {
  stop('SIGINT');
  process.exit(0);
});
process.on('SIGTERM', () => {
  stop('SIGTERM');
  process.exit(0);
});

child.on('exit', (code, signal) => {
  process.exit(signal ? 1 : (code ?? 0));
});
