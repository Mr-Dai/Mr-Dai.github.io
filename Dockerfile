FROM node:10-alpine

ADD . /site/
ADD entrypoint.sh /bin/
WORKDIR /site

RUN chmod +x /bin/entrypoint.sh \
    && npm install \
    && npm install -g hexo-cli

EXPOSE 4000

ENTRYPOINT [ "/bin/entrypoint.sh" ]
CMD [ "/bin/sh" ]
