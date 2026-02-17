#!/bin/sh
# Replace ${PORT} in nginx config template with actual PORT environment variable
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
# Start nginx
nginx -g 'daemon off;'