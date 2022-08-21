import { gql } from "apollo-server";

const typeDefs = gql`
  type Mutation {
    signUp(firebaseId: String!, username: String!): String!
    acceptProperty(propertyID: ID!): Boolean!
    landCash(propertyOwnerId: ID!, cash: Int!): User!
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
  }
`;

export default typeDefs;
