// create a function to remove all jailed people at 12am or pm
import { createServer } from "http";

import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from "apollo-server-core";

import { makeExecutableSchema } from "@graphql-tools/schema";

import { WebSocketServer } from "ws";

import { useServer } from "graphql-ws/lib/use/ws";

import typeDefs from "./graphql/typedefs/index.js";
import resolvers from "./graphql/resolvers/index.js";
import { ApolloServer } from "apollo-server";

// create a graphql server with the schema and the resolvers
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    return {
      user: req.user,
    };
  },
});

// run teh graphql server
server
  .listen()
  .then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  })
  .catch((err) => {
    console.log(err);
  });
