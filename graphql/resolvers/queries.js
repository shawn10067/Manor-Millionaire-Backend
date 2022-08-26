import pubsub from "../utils/pubsub.js";
import jwt from "jsonwebtoken";
import prisma from "../../prisma/db.js";
import { config } from "dotenv";
import { authChecker } from "../utils/authentication.js";
import { AuthenticationError, UserInputError } from "apollo-server-core";
import frozenHelper from "../utils/frozenHelper.js";
const { parsed: envConfig } = config();

const resolvers = {
  Query: {
    login: async (_, { firebaseId }) => {
      // TODO: create firebase auth on frontend and integrate with backend (this method)
      // change login to use firebase instead, and then get the profile token based on firebase id
      const user = await prisma.user.findUnique({
        where: {
          fireBaseId: firebaseId,
        },
        include: {
          properties: true,
        },
      });

      if (user) {
        const parsedUser = {
          ...user,
          cash: parseFloat(user.cash),
        };
        return jwt.sign(parsedUser, envConfig.JWT_SECRET);
      } else {
        throw new AuthenticationError("No user found");
      }
    },
    searchUsers: async (_, { searchString }, ctx) => {
      authChecker(ctx);
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
    getMe: (_, __, ctx) => {
      authChecker(ctx);
      return ctx.user;
    },
    getUser: async (_, { username }, ctx) => {
      authChecker(ctx);
      const user = await prisma.user.findUnique({
        where: {
          username: username,
        },
      });
      return user;
    },
    getUserId: async (_, { id }, ctx) => {
      authChecker(ctx);
      const user = await prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      if (!user) {
        throw UserInputError("Can't find user.", {
          invalidArgs: {
            id,
          },
        });
      }
      return user;
    },
    spin: async (_, __, ctx) => {
      authChecker(ctx);

      const { user } = ctx;
      // if the user is jailed, they can't spin
      if (user.jailed) {
        throw new AuthenticationError("You are jailed.");
      }

      if (user.frozen) {
        // unfreeze the user
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            frozen: false,
          },
        });
      }

      const date = new Date();

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          lastSpin: date,
        },
      });

      const spin = Math.floor(Math.random() * 100);
      if (spin < 10) {
        return "JAIL";
      } else if (spin <= 55) {
        return "GET_PROPERTY";
      } else {
        return "PAY_BILLS";
      }
    },
    getRandomProperty: async (parent, _, ctx) => {
      authChecker(ctx);

      // probability object
      const probabilityObject = {
        upperBound: null,
        lowerBound: null,
      };

      // random probability
      const randomProbability = Math.floor(Math.random() * 100);
      if (randomProbability < 4) {
        probabilityObject.upperBound = 150000000;
        probabilityObject.lowerBound = 100000000;
      } else if (randomProbability < 8) {
        probabilityObject.upperBound = 100000000;
        probabilityObject.lowerBound = 70000000;
      } else if (randomProbability < 16) {
        probabilityObject.upperBound = 70000000;
        probabilityObject.lowerBound = 40000000;
      } else {
        probabilityObject.upperBound = 40000000;
        probabilityObject.lowerBound = 5000000;
      }

      // get the corresponding property
      const propertyCount = await prisma.property.count({
        where: {
          price: {
            lte: probabilityObject.upperBound,
            gte: probabilityObject.lowerBound,
          },
        },
      });

      // get a random property based on a random number between 0 and the property count
      const randomProperty = await prisma.property.findFirst({
        where: {
          price: {
            lte: probabilityObject.upperBound,
            gte: probabilityObject.lowerBound,
          },
        },
        skip: Math.floor(Math.random() * propertyCount),
      });

      return randomProperty;
    },
    landRandomProperty: async (parent, _, ctx) => {
      authChecker(ctx);
      // get the user on property count from the database
      const userOnPropertyCount = await prisma.propertiesOnUsers.count();

      // get a random user on property based on a random number between 0 and the property count
      const randomUserOnProperty = await prisma.propertiesOnUsers.findFirst({
        where: {
          user: {
            frozen: false,
          },
        },
        skip: Math.floor(Math.random() * userOnPropertyCount),
        include: {
          user: true,
        },
      });

      const lastTimeSpin = new Date(randomUserOnProperty.user.lastSpin);
      const date = new Date();

      if (frozenHelper(lastTimeSpin, date)) {
        await prisma.user.update({
          where: {
            id: randomUserOnProperty.user.id,
          },
          data: {
            frozen: true,
          },
        });
      }

      return randomUserOnProperty;
    },
  },
};

export default resolvers;
