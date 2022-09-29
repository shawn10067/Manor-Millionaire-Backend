import { gql } from "apollo-server";

const typeDefs = gql`
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

  type Trade {
    id: ID!
    senderUser: User!
    senderCash: Float!
    senderProperties: [UserProperty!]!
    recieverUser: User!
    recieverProperties: [UserProperty!]!
    recieverCash: Float!
  }

  type FriendRequest {
    id: ID!
    user: User!
    fromUser: User!
  }

  type User {
    id: ID!
    username: String!
    cash: Float!
    properties: [UserProperty!]!
    trades: [Trade!]!
    friends: [User!]!
    friendRequests: [FriendRequest!]!
    jailed: Boolean!
    frozen: Boolean!
    lastSpin: String!
  }

  type UserProperty {
    id: ID!
    status: PropertyStatus!
    property: Property!
    user: User!
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
`;

export default typeDefs;
