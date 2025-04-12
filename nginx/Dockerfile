FROM nginx:latest

# Remove the default nginx.conf
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom one
COPY nginx.conf /etc/nginx/conf.d/default.conf
