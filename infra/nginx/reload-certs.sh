#!/bin/sh
# Mounted into the nginx image's /docker-entrypoint.d. Certbot renews certificates in its own container,
# and Nginx only reads them at start, so reload every 6 hours to pick up a renewed certificate.
( while :; do sleep 6h; nginx -s reload; done ) &
