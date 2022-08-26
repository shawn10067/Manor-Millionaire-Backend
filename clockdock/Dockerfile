FROM node:16
RUN mkdir /clock
WORKDIR /clock
COPY ../ .
RUN yarn 
RUN yarn prisma generate
CMD [ "node", "clock.js" ]