import { gql } from "apollo-server-core";

const typeDefs = gql`
  type LandedType {
    cash: Float!
    userId: Int!
    propertyAddress: String!
    propertyOwnerId: Int!
  }
  type Subscription {
    searchedUsers: String!
    landedCash(propertyOwnerId: Int!): LandedType!
    sentTrade(propertyOwnerId: Int!): String!
  }
`;

export default typeDefs;
