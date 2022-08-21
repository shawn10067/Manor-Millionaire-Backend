import pubsub from "../utils/pubsub.js";
import jwt from "jsonwebtoken";
import prisma from "../../prisma/db.js";
import { config } from "dotenv";
const { parsed: envConfig } = config();

const resolvers = {
  Query: {
    login: async (_, { username, password }) => {
      // change login to use firebase instead, and then get the profile token based on firebase id
      const user = await prisma.user.findUnique({
        where: {
          username: username,
        },
        include: {
          properties: true,
        },
      });

      if (user && password === "password") {
        return jwt.sign(user, envConfig.JWT_SECRET);
      } else {
        return "no such user";
      }
    },
    searchUsers: async (_, { searchString }) => {
      pubsub.publish("SEARCHED_USERS", {
        searchedUsers: searchString,
      });
      const lowerCaseSearchString = searchString.toLowerCase();
      const results = await prisma.user.findMany({
        where: {
          username: {
            startsWith: lowerCaseSearchString,
            mode: "insensitive",
          },
        },
        take: 8,
      });
      return results;
    },
    getMe: (_, args, ctx) => {
      return ctx.user;
    },
    getUser: async (_, { username }) => {
      const user = await prisma.user.findUnique({
        where: {
          username: username,
        },
      });
      return user;
    },
    getUserId: async (_, { id }) => {
      const user = await prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      return user;
    },
    spin: () => {
      const spin = Math.floor(Math.random() * 100);
      if (spin < 33) {
        return "JAIL";
      } else if (spin < 66) {
        return "GET";
      } else {
        return "LAND";
      }
    },
    getRandomProperty: async () => {
      // get the property count from the database
      const propertyCount = await prisma.property.count();

      // get a random property based on a random number between 0 and the property count
      const randomProperty = await prisma.property.findFirst({
        skip: Math.floor(Math.random() * propertyCount),
      });
      return randomProperty;
    },
    landRandomProperty: async () => {
      // get the user on property count from the database
      const userOnPropertyCount = await prisma.propertiesOnUsers.count();

      // get a random user on property based on a random number between 0 and the property count
      const randomUserOnProperty = await prisma.propertiesOnUsers.findFirst({
        skip: Math.floor(Math.random() * userOnPropertyCount),
      });

      return randomUserOnProperty;
    },
  },
};

export default resolvers;
