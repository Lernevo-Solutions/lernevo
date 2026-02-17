FROM nginx:alpine

# Install envsubst (part of gettext) to replace environment variables in nginx config at runtime
RUN apk add --no-cache gettext

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy frontend build
COPY build /usr/share/nginx/html

# Copy custom nginx template
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Set environment variable PORT from Cloud Run (default 8080)
ENV PORT 8080

# Use a startup script to substitute PORT and start nginx
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]