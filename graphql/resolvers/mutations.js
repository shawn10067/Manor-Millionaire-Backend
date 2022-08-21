import jwt from "jsonwebtoken";
import prisma from "../../prisma/db.js";
import { UserInputError } from "apollo-server-core";
import { config } from "dotenv";
const { parsed: envConfig } = config();

const resolvers = {
  Mutation: {
    signUp: async (_, { firebaseId, username }) => {
      const newUser = await prisma.user.create({
        data: {
          username: username,
          cash: 200000000,
          fireBaseId: firebaseId,
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
        },
      });
      return jwt.sign(newUser, envConfig.JWT_SECRET);
    },
    acceptProperty: async (_, { propertyID }, ctx) => {
      const { user } = ctx;
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
    },
    landCash: async (_, { propertyOwnerId, cash }, ctx) => {
      const { user } = ctx;
      const intPropertyOwnerId = parseInt(propertyOwnerId);
      const intCash = parseInt(cash);

      // subtract the cash from the user's cash
      const retrivedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          cash: {
            decrement: intCash,
          },
        },
      });

      // add the cash to the property owner's cash
      await prisma.user.update({
        where: {
          id: intPropertyOwnerId,
        },
        data: {
          cash: {
            increment: intCash,
          },
        },
      });

      return retrivedUser;
    },
    sendTrade: async (
      parent,
      {
        theirUserId,
        propertiesYouWant,
        cashYouWant,
        propertiesGiving,
        cashGiving,
      },
      ctx
    ) => {
      const { user } = ctx;
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

      console.log(
        "youre giving",
        intCashGiving,
        "youre getting",
        intCashYouWant
      );

      return newTrade;
    },
    bankTrade: async (_, { propertiesGiving }, ctx) => {
      const { user } = ctx;

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

      // removing the properties from the user's properties
      await prisma.propertiesOnUsers.deleteMany({
        where: {
          id: {
            in: propertiesGivingWithIds,
          },
        },
      });

      // incrementing the user's cash by the property value
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          cash: {
            increment: propertyValues,
          },
        },
      });

      return propertyValues;
    },

    acceptTrade: async (_, { tradeId }, ctx) => {
      // getting the trade
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

      console.log(trade);

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
      const absPriceDifference = Math.abs(priceDifference);

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

      console.log(cashObject);

      // making sure that all the senderProperties are in senderUserProperties
      const senderPropertiesCorrect = senderPropertiesId.every((id) => {
        return sendUserPropertiesId.find((val) => val === id);
      });
      const recieverPropertiesCorrect = recievePropertiesId.every((id) => {
        return recieveUserPropertiesId.find((val) => val === id);
      });
      const senderHasMoney = senderUser.cash >= senderCash || senderCash === 0;
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
        ]);
      } else {
        console.log(
          senderPropertiesCorrect,
          recieverPropertiesCorrect,
          senderHasMoney,
          recieverHasMoney,
          recieverCash,
          recieverUser.cash
        );

        // if the constraints are not met, throw an error
        throw new UserInputError(
          "Can't trade with the current set of properties and cash"
        );
      }

      return trade;
    },
    sendFriendRequest: async (_, { userId }, ctx) => {
      // getting user from context and the userId from the mutation
      const { user } = ctx;
      const intUserId = parseInt(userId);

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

      return newFriendRequest;
    },
    acceptFriendRequest: async (_, { friendRequestId }, ctx) => {
      // getting the friend request and user from the mutation
      const { user } = ctx;
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
      prisma.$transaction([
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
      ]);

      // delete the friend request
      await prisma.friendRequest.delete({
        where: {
          id: intFriendRequestId,
        },
      });

      return friendRequest;
    },
    inAppPurchase: (_, { productId }) => {
      // determine what the product is and then update the user appropriately
      return "PURCHASED";
    },
  },
};

export default resolvers;
