# syntax=docker/dockerfile:1.7
FROM node:22-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
WORKDIR /repo

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/backend/package.json apps/backend/
RUN pnpm install --frozen-lockfile --filter @dk/backend...
COPY packages/shared packages/shared
COPY apps/backend apps/backend
RUN pnpm --filter @dk/backend build \
 && pnpm --filter @dk/backend deploy --prod --legacy /out \
 && cp -r apps/backend/dist /out/dist

FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /out ./
# Amazon's RDS certificate authorities. RDS certificates are not signed by a CA that Node trusts by default,
# so without this the TLS connection to an RDS database (DATABASE_SSL=true) is refused.
ADD --chown=node:node --chmod=644 https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem /home/node/rds-global-bundle.pem
ENV NODE_EXTRA_CA_CERTS=/home/node/rds-global-bundle.pem
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://127.0.0.1:4000/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server.js"]
