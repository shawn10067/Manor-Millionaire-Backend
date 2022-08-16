import users from "../mock/users.js";
import { makeMillion } from "../utils/money.js";
import pubsub from "../utils/pubsub.js";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
const prisma = new PrismaClient();
const { parsed: envConfig } = config();

// create resolvers for the graphql schema based on the graphql typedefs and the 'users' mock data above
const resolvers = {
  Property: {
    income: (parent) => {
      const { aloneIncome, setIncome, tier1Income, tier2Income } = parent;
      return {
        alone: aloneIncome,
        set: setIncome,
        tier1: tier1Income,
        tier2: tier2Income,
      };
    },
    cost: (parent) => {
      const { tier1Cost, tier2Cost } = parent;
      return {
        tier1Cost,
        tier2Cost,
      };
    },
  },
  UserProperty: {
    status: (parent) => {
      const { status } = parent;
      return status.toUpperCase();
    },
    property: async (parent) => {
      const { id } = parent;
      const userProperty = await prisma.propertiesOnUsers.findUnique({
        where: {
          id,
        },
        include: {
          property: true,
        },
      });
      return userProperty.property;
    },
    user: async (parent) => {
      const { id } = parent;
      const userProperty = await prisma.propertiesOnUsers.findUnique({
        where: {
          id,
        },
        include: {
          user: true,
        },
      });
      return userProperty.user;
    },
  },
  User: {
    properties: async (parent) => {
      const properties = await prisma.propertiesOnUsers.findMany({
        where: {
          userId: parent.id,
        },
        include: {
          property: true,
        },
      });

      if (properties) {
        return properties;
      } else {
        return [];
      }
    },
  },
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
            contains: lowerCaseSearchString,
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
  Mutation: {
    signUp: (_, { firebaseToken, username }) => {
      const user = users.find((user) => user.username === username);
      if (user) {
        return "USER_EXISTS";
      } else {
        return "NEW_USER";
      }
    },
    acceptProperty: (_, { propertyID }) => {
      return properties.find((property) => property.id === propertyID);
    },
    landCash: (_, { propertyOwner, cash }) => {
      return properties.find((property) => property.id === propertyOwner);
    },
    sendTrade: (
      _,
      {
        theirUserId,
        propertiesYouWant,
        cashYouWant,
        propertiesGiving,
        cashGiving,
      }
    ) => {
      return {
        id: Math.floor(Math.random() * 1000000),
        theirUserId,
        propertiesYouWant,
        cashYouWant,
        propertiesGiving,
        cashGiving,
      };
    },
    bankTrade: (_, { propertiesGiving, cashGiving }) => {
      makeMillion(Math.floor(Math.random() * 1000000));
    },
    acceptTrade: (_, { tradeId }) => {
      // return random trade from a random user
      return users[Math.floor(Math.random() * users.length)].trades[
        Math.floor(
          Math.random() *
            users[Math.floor(Math.random() * users.length)].trades.length
        )
      ];
    },
    sendFriendRequest: (_, { userId }) => {
      return users.find((user) => user.id === userId);
    },
    acceptFriendRequest: (_, { userId }) => {
      return users.find((user) => user.id === userId);
    },
    inAppPurchase: (_, { productId }) => {
      return "PURCHASED";
    },
  },
  Subscription: {
    searchedUsers: {
      subscribe: () => pubsub.asyncIterator("SEARCHED_USERS"),
    },
  },
};

export default resolvers;
