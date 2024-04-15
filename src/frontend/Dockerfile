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
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log
RUN mkdir -p /code/media/profile_pictures
RUN chown -R www-data:www-data /code/media
RUN chmod -R 775 /code/media
    
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
