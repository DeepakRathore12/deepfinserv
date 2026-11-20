/**
 * PM2 process file for the EC2 host. Environment comes from /etc/dkfinance/*.env, written by
 * infra/scripts/fetch-env.sh from AWS SSM Parameter Store. Never commit secrets here.
 */
const root = process.env.DK_RELEASE ?? '/srv/dkfinance/current';

module.exports = {
  apps: [
    {
      name: 'dk-api',
      cwd: `${root}/apps/backend`,
      script: 'dist/server.js',
      node_args: '--env-file=/etc/dkfinance/api.env --enable-source-maps',
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '400M',
      kill_timeout: 12000,
      env: { NODE_ENV: 'production', PORT: 4000 },
    },
    {
      name: 'dk-web',
      cwd: `${root}/apps/frontend/.next/standalone`,
      script: 'apps/frontend/server.js',
      node_args: '--env-file=/etc/dkfinance/web.env',
      instances: 1,
      max_memory_restart: '600M',
      env: { NODE_ENV: 'production', PORT: 3000, HOSTNAME: '127.0.0.1' },
    },
  ],
};
