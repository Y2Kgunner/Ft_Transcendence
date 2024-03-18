# FROM nginx:latest
# RUN rm /etc/nginx/conf.d/default.conf
# COPY nginx.conf /etc/nginx/nginx.conf
# COPY pages/*.html /usr/share/nginx/html/

# COPY ssl/127.0.0.1.crt /etc/nginx/ssl/certs/127.0.0.1.pem
# COPY ssl/127.0.0.1.key /etc/nginx/ssl/private/127.0.0.1.key
# RUN mkdir -p /etc/nginx/ssl

# EXPOSE 433
# CMD ["nginx", "-g", "daemon off;"]

# FROM nginx:latest
# RUN rm /etc/nginx/conf.d/default.conf
# COPY nginx.conf /etc/nginx/nginx.conf
# COPY ssl/* /etc/nginx/ssl/
# RUN mkdir -p /etc/nginx/ssl
# COPY pages/*.html /usr/share/nginx/html/
# EXPOSE 443

# CMD ["nginx", "-g", "daemon off;"]

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
