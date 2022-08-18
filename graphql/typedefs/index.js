import { gql } from "apollo-server";

const typeDefs = gql`
  enum PropertyStatus {
    ALONE
    SET
    TIER1
    TIER2
  }

  enum SpinOutcome {
    JAIL
    GET
    LAND
  }

  type Trade {
    id: ID!
    user: User!
    fromUser: User!
    theirProperties: [UserProperty!]!
    requestedCash: Int!
    recievingProperties: [UserProperty!]!
    recievingCash: Int!
  }

  type FriendRequest {
    id: ID!
    user: User!
    fromUser: User!
  }

  type PropertyPriceValues {
    alone: Int!
    set: Int!
    tier1: Int!
    tier2: Int!
  }

  type PropertyCostValues {
    tier1Cost: Int!
    tier2Cost: Int!
  }

  type UserProperty {
    id: ID!
    status: PropertyStatus!
    frozen: Boolean!
    property: Property!
    user: User!
  }

  type User {
    id: ID!
    username: String!
    cash: Int!
    properties: [UserProperty!]!
    trades: [Trade!]!
    friends: [User!]!
    friendRequests: [FriendRequest!]!
  }

  type Property {
    id: ID!
    country: String!
    address: String!
    imageUrl: String!
    price: Int!
    income: PropertyPriceValues!
    propertyValue: Int!
    cost: PropertyCostValues!
  }

  type Mutation {
    signUp(firebaseId: String!, username: String!): String!
    acceptProperty(propertyID: ID!): Boolean!
    landCash(propertyOwnerId: ID!, cash: Int!): User!
    sendTrade(
      theirUserId: ID!
      propertiesYouWant: [ID!]!
      cashYouWant: Int!
      propertiesGiving: [ID!]!
      cashGiving: Int!
    ): Trade!
    bankTrade(propertiesGiving: [ID!]!): Int
    acceptTrade(tradeId: ID!): Trade
    sendFriendRequest(userId: ID!): FriendRequest!
    acceptFriendRequest(friendRequestId: ID!): FriendRequest!
    inAppPurchase(amount: Int): String!
  }

  type Query {
    login(username: String!, password: String!): String!
    searchUsers(searchString: String!): [User!]!
    getMe: User!
    getUser(username: String!): User
    getUserId(id: Int!): User
    spin: SpinOutcome!
    getRandomProperty: Property!
    landRandomProperty: UserProperty!
  }

  type Subscription {
    searchedUsers: String
  }
`;

/*
 * notes:
 * user will have a firebase id in the table
 * it will be indexed based on pkey id and username
 * will have a many-to-many properties relationship
 * will have a many-to-many users relationship
 * will have a reset password option for firebase
 */

export default typeDefs;
