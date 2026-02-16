FROM nginx:alpine

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy frontend build
COPY build /usr/share/nginx/html

# Set environment variable PORT from Cloud Run
ENV PORT 8080

# Update nginx to listen on $PORT
RUN sed -i "s/listen       80;/listen       ${PORT};/" /etc/nginx/conf.d/default.conf

# Expose the dynamic port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
