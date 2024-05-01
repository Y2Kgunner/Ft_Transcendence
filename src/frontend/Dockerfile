FROM nginx:latest


RUN mkdir -p /etc/nginx/ssl
COPY ssl/nginx-selfsigned.crt /etc/nginx/ssl/
COPY ssl/nginx-selfsigned.key /etc/nginx/ssl/
RUN update-ca-certificates

#adding ping for debugging remove in production
RUN apt-get update && apt-get install -y iputils-ping

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

COPY proxy_params /etc/nginx/proxy_params
COPY pages/*.html /usr/share/nginx/html/
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
