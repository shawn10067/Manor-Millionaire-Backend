FROM node:16
RUN mkdir /app
WORKDIR /app
COPY package.json .
RUN yarn
COPY ./ .
RUN yarn prisma generate
EXPOSE 4000
CMD [ "yarn", "dev" ]