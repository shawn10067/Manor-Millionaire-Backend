const { gql } = require("apollo-server");

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
    theirUserID: ID!
    theirProperties: [Properties!]!
    requestedCash: Int!
    recievingProperties: [Properties!]!
    recievingCash: Int!
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

  type User {
    id: ID!
    username: String!
    cash: Int!
    properties: [Properties!]!
    trades: [Trade!]!
    friends: [User!]!
  }

  type Properties {
    id: ID!
    country: String!
    address: String!
    imageUrl: String!
    price: Int!
    income: PropertyPriceValues!
    propertyValue: Int!
    cost: PropertyCostValues!
    status: PropertyStatus!
    frozen: Boolean!
  }

  type Mutation {
    signUp(firebaseToken: String!, username: String!): String!
    acceptProperty(propertyID: ID!): Property!
    landCash(propertyOwner: ID! cash: Int!): Property!
    sendTrade(theirUserId: ID! propertiesYouWant: [Properties!]! cashYouWant: Int propertiesGiving: [Properties!]! cashGiving: Int ): Trade!
    bankTrade(propertiesGiving: [Properties!]! cashGiving: Int ): Trade!
    acceptTrade(tradeId: ID!): Trade!
    sendFriendRequest(userId: ID!): User!
    acceptFriendRequest(userId: ID!): User!
    inAppPurchase(amount: Int): String!
  }

  type Query {
    login(username: String!, password: String!): String!
    searchUsers(seachString: String!): [User!]!
    getMe: User!
    getUser(username: String!): User
    spin(): SpinOutcome!
    getRandomProperty(): Property!
    landRandomProperty(): Property!
  }
`;

/*
 * notes:
 * user will have a firebase id in the table
 * it will be indexed based on pkey id and username
 * will have a many-to-many properties relationship
 * will have a many-to-many users relationship
 */

module.exports = typeDefs;
