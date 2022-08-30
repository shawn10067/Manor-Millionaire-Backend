import jwt from "jsonwebtoken";
import prisma from "../../prisma/db.js";
import { AuthenticationError, UserInputError } from "apollo-server-core";
import { config } from "dotenv";
import { authChecker } from "../utils/authentication.js";
import pubsub from "../utils/pubsub.js";
const { parsed: envConfig } = config();
import { getAuth } from "firebase-admin/auth";

const resolvers = {
  Mutation: {
    signUp: async (_, { firebaseId, username }) => {
      try {
        const verfiyUser = await getAuth().verifyIdToken(firebaseId);
        const { uid } = verfiyUser;
        const newUser = await prisma.user.create({
          data: {
            username: username,
            cash: 250000000,
            fireBaseId: uid,
            properties: {
              create: [],
            },
            friendsWithMe: {
              create: [],
            },
            myFriends: {
              create: [],
            },
            sentTrades: {
              create: [],
            },
            receivedTrades: {
              create: [],
            },
            jailed: false,
            frozen: false,
          },
        });
        return jwt.sign(newUser, envConfig.JWT_SECRET);
      } catch (e) {
        throw new UserInputError(e.message, {
          invalidArgs: e.errors,
        });
      }
    },
    acceptProperty: async (_, { propertyID }, ctx) => {
      authChecker(ctx);
      const { user } = ctx;
      try {
        const intPropertyId = parseInt(propertyID);

        await prisma.propertiesOnUsers.create({
          data: {
            user: {
              connect: {
                id: user.id,
              },
            },
            property: {
              connect: {
                id: intPropertyId,
              },
            },
          },
        });

        return true;
      } catch (e) {
        throw new UserInputError(e.message, {
          invalidArgs: {
            propertyID,
          },
        });
      }
    },
    landCash: async (_, { propertyOwnerId, cash, propertyAddress }, ctx) => {
      authChecker(ctx);
      const { user } = ctx;
      try {
        const intPropertyOwnerId = parseInt(propertyOwnerId);
        const intCash = parseInt(cash);

        const [paidUser, _] = await prisma.$transaction([
          prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              cash: {
                decrement: intCash,
              },
            },
          }),
          prisma.user.update({
            where: {
              id: intPropertyOwnerId,
            },
            data: {
              cash: {
                increment: intCash,
              },
            },
          }),
        ]);

        pubsub.publish("LANDED_CASH", {
          landedCash: {
            cash: intCash,
            userId: paidUser.id,
            propertyAddress,
            propertyOwnerId: parseInt(propertyOwnerId),
          },
        });

        return paidUser;
      } catch (e) {
        throw new UserInputError(e.message, {
          invalidArgs: {
            propertyOwnerId,
            cash,
          },
        });
      }
    },
    sendTrade: async (
      _,
      {
        theirUserId,
        propertiesYouWant,
        cashYouWant,
        propertiesGiving,
        cashGiving,
      },
      ctx
    ) => {
      authChecker(ctx);
      const { user } = ctx;
      // if the user is trying to send a trade to themselves, throw an error
      if (user.id === theirUserId) {
        throw new AuthenticationError("You can't trade with yourself.");
      }
      // if the user is frozen, they can't trade
      if (user.frozen) {
        throw new AuthenticationError("You are frozen.");
      }
      try {
        const intTheirUserId = parseInt(theirUserId);
        const intCashYouWant = parseInt(cashYouWant);
        const intCashGiving = parseInt(cashGiving);

        // formatting the properties you want to get the id's of
        const propertiesYouWantWithIds = propertiesYouWant.map((propertyId) => {
          return {
            id: parseInt(propertyId),
          };
        });

        const propertiesGivingWithIds = propertiesGiving.map((propertyId) => {
          return {
            id: parseInt(propertyId),
          };
        });

        const newTrade = await prisma.tradesOnUsers.create({
          data: {
            senderUser: {
              connect: {
                id: user.id,
              },
            },
            recieverUser: {
              connect: {
                id: intTheirUserId,
              },
            },
            recieverProperties: {
              connect: propertiesYouWantWithIds,
            },
            recieverCash: intCashYouWant,
            senderProperties: {
              connect: propertiesGivingWithIds,
            },
            senderCash: intCashGiving,
          },

          include: {
            senderUser: true,
            recieverUser: true,
            recieverProperties: true,
            senderProperties: true,
          },
        });

        // parsing all the bigint into floats from newTrade
        const parsedNewTrade = {
          ...newTrade,
          senderUser: {
            ...newTrade.senderUser,
            cash: parseFloat(newTrade.senderUser.cash),
          },
          recieverUser: {
            ...newTrade.recieverUser,
            cash: parseFloat(newTrade.recieverUser.cash),
          },
          recieverCash: parseFloat(newTrade.recieverCash),
          senderCash: parseFloat(newTrade.senderCash),
        };

        pubsub.publish("SENT_TRADE", {
          sentTrade: {
            sender: parsedNewTrade.senderUser.id,
            senderUsername: parsedNewTrade.senderUser.username,
            reciever: parsedNewTrade.recieverUser.id,
          },
        });

        return newTrade;
      } catch (e) {
        throw new Error(e.message, {
          invalidArgs: {
            theirUserId,
            propertiesYouWant,
            cashYouWant,
            propertiesGiving,
            cashGiving,
          },
        });
      }
    },
    bankTrade: async (_, { propertiesGiving }, ctx) => {
      authChecker(ctx);
      const { user } = ctx;

      try {
        // formatting the properties you want to get the id's of
        const propertiesGivingWithIds = propertiesGiving.map((propertyId) =>
          parseInt(propertyId)
        );

        // getting the properties in the array
        const properties = await prisma.propertiesOnUsers.findMany({
          where: {
            id: {
              in: propertiesGivingWithIds,
            },
          },
          include: {
            property: true,
          },
        });

        // getting the property value from all the properties
        const propertyValues = properties.reduce((acc, curr) => {
          return acc + curr.property.propertyValue;
        }, 0);

        await prisma.$transaction([
          prisma.propertiesOnUsers.deleteMany({
            where: {
              id: {
                in: propertiesGivingWithIds,
              },
            },
          }),
          prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              cash: {
                increment: propertyValues,
              },
            },
          }),
        ]);

        return propertyValues;
      } catch (e) {
        throw new Error(e.message, {
          invalidArgs: {
            propertiesGiving,
          },
        });
      }
    },
    acceptTrade: async (_, { tradeId }, ctx) => {
      authChecker(ctx);
      const { user } = ctx;
      // if the user is frozen, they can't trade
      if (user.frozen) {
        throw new AuthenticationError("You are frozen.");
      }
      // getting the trade
      try {
        const intTradeId = parseInt(tradeId);

        const trade = await prisma.tradesOnUsers.findUnique({
          where: {
            id: intTradeId,
          },
          include: {
            senderUser: {
              include: {
                properties: true,
              },
            },
            recieverUser: {
              include: {
                properties: true,
              },
            },
            senderProperties: true,
            recieverProperties: true,
          },
        });

        const {
          senderUser,
          recieverUser,
          senderProperties,
          recieverProperties,
          senderCash,
          recieverCash,
        } = trade;

        // determining the constraints on the trade
        const sendUserPropertiesId = senderUser.properties.map((val) => val.id);
        const recieveUserPropertiesId = recieverUser.properties.map(
          (val) => val.id
        );

        const senderPropertiesId = senderProperties.map((val) => val.id);
        const recievePropertiesId = recieverProperties.map((val) => val.id);
        const priceDifference = senderCash - recieverCash;
        const absPriceDifference = Math.abs(parseInt(priceDifference));

        // setting the constraints when the trade is accepted
        let cashObject = {
          sender: null,
          reciever: null,
        };

        if (priceDifference > 0) {
          cashObject.reciever = {
            increment: absPriceDifference,
          };
          cashObject.sender = {
            decrement: absPriceDifference,
          };
        } else if (priceDifference < 0) {
          cashObject.reciever = {
            decrement: absPriceDifference,
          };
          cashObject.sender = {
            increment: absPriceDifference,
          };
        } else {
          cashObject = undefined;
        }

        // making sure that all the senderProperties are in senderUserProperties
        const senderPropertiesCorrect = senderPropertiesId.every((id) => {
          return sendUserPropertiesId.find((val) => val === id);
        });
        const recieverPropertiesCorrect = recievePropertiesId.every((id) => {
          return recieveUserPropertiesId.find((val) => val === id);
        });
        const senderHasMoney =
          senderUser.cash >= senderCash || senderCash === 0;
        const recieverHasMoney =
          recieverUser.cash >= recieverCash || recieverCash === 0;

        // running the transaction
        if (
          senderPropertiesCorrect &&
          recieverPropertiesCorrect &&
          senderHasMoney &&
          recieverHasMoney
        ) {
          // getting the ids in the right format
          const mappedSenderProperties = senderProperties.map((val) => {
            return {
              id: val.id,
            };
          });
          const mappedRecieveProperties = recieverProperties.map((val) => {
            return {
              id: val.id,
            };
          });

          await prisma.$transaction([
            prisma.user.update({
              where: {
                id: recieverUser.id,
              },
              data: {
                properties: {
                  connect: mappedSenderProperties,
                },
                cash: cashObject ? cashObject.reciever : undefined,
              },
            }),
            prisma.user.update({
              where: {
                id: senderUser.id,
              },
              data: {
                properties: {
                  connect: mappedRecieveProperties,
                },
                cash: cashObject ? cashObject.sender : undefined,
              },
            }),
            prisma.tradesOnUsers.delete({
              where: {
                id: intTradeId,
              },
            }),
          ]);

          pubsub.publish("ACCEPTED_TRADE", {
            acceptedTrade: {
              sender: senderUser.id,
              recieverUsername: recieverUser.username,
              reciever: recieverUser.id,
            },
          });

          return trade;
        } else {
          // if the constraints are not met, throw an error
          throw new UserInputError(
            "Can't trade with the current set of properties and cash"
          );
        }
      } catch (e) {
        throw new UserInputError(e.message, { invalidArgs: tradeId });
      }
    },
    sendFriendRequest: async (_, { userId }, ctx) => {
      // getting user from context and the userId from the mutation

      authChecker(ctx);
      const { user } = ctx;

      // if you are sending a friend request to yourself, throw an error
      if (user.id === userId) {
        throw new UserInputError("You can't send a friend request to yourself");
      }

      // if the user is already friends with the userId, throw an error
      // implement this later
      // console.log(user);
      // // TODO: see if the property exists
      // const isAlreadyFriends = user.friends.some((val) => val.id === userId);
      // if (isAlreadyFriends) {
      //   throw new UserInputError("You are already friends with this user");
      // }

      try {
        const intUserId = parseInt(userId);

        // if a friend request already exists, return the friend request
        const friendRequest = await prisma.friendRequest.findFirst({
          where: {
            requestUserId: user.id,
            userId: intUserId,
          },
        });
        if (friendRequest) {
          return friendRequest;
        }

        // send a friend request to the user with the userId
        const newFriendRequest = await prisma.friendRequest.create({
          data: {
            requestUser: {
              connect: {
                id: user.id,
              },
            },
            user: {
              connect: {
                id: intUserId,
              },
            },
          },
        });

        pubsub.publish("SENT_FRIEND_REQUEST", {
          sentFriendRequest: {
            sender: user.id,
            senderUsername: user.username,
            reciever: intUserId,
          },
        });

        return newFriendRequest;
      } catch (e) {
        throw new UserInputError(e.message, { invalidArgs: userId });
      }
    },
    acceptFriendRequest: async (_, { friendRequestId }, ctx) => {
      authChecker(ctx);
      // getting the friend request and user from the mutation
      const { user } = ctx;

      try {
        const intFriendRequestId = parseInt(friendRequestId);

        // get the friend request
        const friendRequest = await prisma.friendRequest.findUnique({
          where: {
            id: intFriendRequestId,
          },
          include: {
            user: true,
            requestUser: true,
          },
        });

        // add friends to each user
        await prisma.$transaction([
          prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              myFriends: {
                connect: {
                  id: friendRequest.requestUser.id,
                },
              },
            },
            include: {
              myFriends: true,
            },
          }),
          prisma.user.update({
            where: {
              id: friendRequest.requestUser.id,
            },
            data: {
              myFriends: {
                connect: {
                  id: user.id,
                },
              },
            },
            include: {
              myFriends: true,
            },
          }),
          prisma.friendRequest.delete({
            where: {
              id: intFriendRequestId,
            },
          }),
        ]);

        pubsub.publish("ACCEPTED_FRIEND_REQUEST", {
          acceptedFriendRequest: {
            sender: friendRequest.requestUser.id,
            recieverUsername: user.username,
            reciever: user.id,
          },
        });

        // deleting the friend request
        await prisma.friendRequest.delete({
          where: {
            id: intFriendRequestId,
          },
        });

        return friendRequest;
      } catch (e) {
        throw new UserInputError(e.message, { invalidArgs: friendRequestId });
      }
    },
    inAppPurchase: (_, { productId }, ctx) => {
      authChecker(ctx);
      // determine what the product is and then update the user appropriately
      return "PURCHASED";
    },
    deleteUser: async (_, { userId }, ctx) => {
      authChecker(ctx);
      const { user } = ctx;
      try {
        const intUserId = parseInt(userId);
        if (user.id === intUserId) {
          // delete the user
          await prisma.user.delete({
            where: {
              id: intUserId,
            },
          });
          return true;
        } else {
          throw new AuthenticationError(
            "You can't delete someone else's account",
            { invalidArgs: userId }
          );
        }
      } catch (e) {
        throw new UserInputError(e.message, { invalidArgs: userId });
      }
    },
    jailUser: async (_, { userId }, ctx) => {
      authChecker(ctx);
      const { user } = ctx;

      // if user is already in jail, return true
      if (user.inJail) {
        return true;
      }

      try {
        const intUserId = parseInt(userId);
        if (user.id === intUserId) {
          // jail the user
          await prisma.user.update({
            where: {
              id: intUserId,
            },
            data: {
              jailed: true,
            },
          });
          return true;
        } else {
          throw new AuthenticationError(
            "You can't jail someone else's account",
            { invalidArgs: userId }
          );
        }
      } catch (e) {
        throw new UserInputError(e.message, { invalidArgs: userId });
      }
    },
  },
};

export default resolvers;
