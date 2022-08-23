import { gql } from "apollo-server-core";

const typeDefs = gql`
  type LandedType {
    cash: Float!
    userId: Int!
    propertyAddress: String!
    propertyOwnerId: Int!
  }
  type TradeSent {
    sender: ID!
    senderUsername: String!
    reciever: ID!
  }
  type TradeAccepted {
    sender: ID!
    recieverUsername: String!
    reciever: ID!
  }
  type FriendRequestSent {
    sender: ID!
    senderUsername: String!
    reciever: ID!
  }
  type FriendRequestAccepted {
    sender: ID!
    recieverUsername: String!
    reciever: ID!
  }
  type Subscription {
    searchedUsers: String!
    landedCash(propertyOwnerId: Int!): LandedType!
    sentTrade(recieverId: Int!): TradeSent!
    acceptedTrade(senderId: Int!): TradeAccepted!
    sentFriendRequest(recieverId: Int!): FriendRequestSent!
    acceptedFriendRequest(senderId: Int!): FriendRequestAccepted!
  }
`;

export default typeDefs;
