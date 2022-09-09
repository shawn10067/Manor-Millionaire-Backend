// create a function to remove all jailed people at 12am or pm
import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginDrainHttpServer,
  AuthenticationError,
} from "apollo-server-core";
import express from "express";
import typeDefs from "./graphql/typedefs/index.js";
import resolvers from "./graphql/resolvers/index.js";

// suscriptions dependencites
import { createServer } from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";

// prisma client
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// token dependencies and functions
import jwt from "jsonwebtoken";
import envConfig from "./graphql/utils/envHelper.js";
const getUser = async (token) => {
  const { id } = jwt.verify(token, envConfig.JWT_SECRET);
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  return user;
};

// firebase admin stuff
import googleApiKey from "./secrets/manor-millionaire-admin.js";
import { initializeApp } from "firebase-admin/app";
import admin from "firebase-admin";
initializeApp({
  credential: admin.credential.cert(googleApiKey),
});

// create a graphql server with the schema and the resolvers
async function startApolloServer() {
  // Required logic for integrating with Express
  const app = express();
  const httpServer = createServer(app);
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const serverCleanup = useServer({ schema }, wsServer);
  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
    context: async ({ req }) => {
      let user = null;
      console.log("req", req.headers);
      // user auth
      if (req && req.headers && req.headers.authorization) {
        try {
          const authSplit = req.headers.authorization.split(" ");
          const bearer = authSplit[0];
          if (bearer === "Bearer") {
            const token = authSplit[1] || "";
            user = token ? await getUser(token) : null;
          }
        } catch (e) {
          console.log("got an error");
          throw new AuthenticationError("Can't read token");
        }
      }
      return {
        user,
      };
    },
  });

  // More required logic for integrating with Express
  await server.start();
  server.applyMiddleware({
    app,
  });

  const port = process.env.PORT || 4000;
  const url = process.env.PROD
    ? "https://manor-millionaire-server.herokuapp.com/graphql"
    : `http://localhost:${port}/graphql`;

  await new Promise((resolve) => httpServer.listen({ port }, resolve));
  console.log(`🚀 Server ready at ${url}`);
}

startApolloServer();
