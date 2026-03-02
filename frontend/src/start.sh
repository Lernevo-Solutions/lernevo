#!/bin/sh

echo "Cloud Run PORT value: $PORT"

envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

echo "Generated nginx config:"
cat /etc/nginx/conf.d/default.conf

nginx -g 'daemon off;'