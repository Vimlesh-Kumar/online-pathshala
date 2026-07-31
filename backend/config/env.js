/**
 * Side-effect import that hydrates process.env from the env files.
 *
 *   import '../config/env.js';
 *
 * Use it in modules that read process.env at import time and can also be loaded
 * outside of server.js (standalone scripts, tests). It replaces the plain
 * `import 'dotenv/config'`, which only ever read `.env` and therefore ignored
 * `.env.local`. Loading is cached, so importing it repeatedly costs nothing and
 * never overrides values the server bootstrap already resolved.
 */
import { loadEnvFiles } from './secrets.bootstrap.js';

loadEnvFiles();
