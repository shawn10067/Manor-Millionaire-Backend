import { gql } from "apollo-server";

const typeDefs = gql`
  type Mutation {
    signUp(firebaseId: String!, username: String!): String!
    acceptProperty(propertyID: ID!): Boolean!
    landCash(propertyOwnerId: ID!, cash: Int!, propertyAddress: String!): User!
    sendTrade(
      theirUserId: ID!
      propertiesYouWant: [ID!]!
      cashYouWant: Float!
      propertiesGiving: [ID!]!
      cashGiving: Float!
    ): Trade!
    bankTrade(propertiesGiving: [ID!]!): Int
    acceptTrade(tradeId: ID!): Trade
    sendFriendRequest(userId: ID!): FriendRequest!
    acceptFriendRequest(friendRequestId: ID!): FriendRequest!
    inAppPurchase(amount: Int): String!
    removeFriend(friendId: ID!): Boolean!
    deleteUser(userId: ID!): Boolean!
    deleteFriendRequest(friendRequestId: ID!): Boolean!
    deleteTrade(tradeId: ID!): Boolean!
    jailUser(userId: ID!): Boolean!
  }
`;

export default typeDefs;
