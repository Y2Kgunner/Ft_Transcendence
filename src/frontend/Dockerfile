FROM nginx:latest
RUN mkdir -p /etc/nginx/ssl
COPY ssl/* /etc/nginx/ssl/
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf
COPY proxy_params /etc/nginx/proxy_params
COPY ssl/nginx-selfsigned.crt /etc/nginx/ssl/nginx-selfsigned.crt
COPY ssl/nginx-selfsigned.key /etc/nginx/ssl/nginx-selfsigned.key
RUN update-ca-certificates
COPY pages/*.html /usr/share/nginx/html/
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
