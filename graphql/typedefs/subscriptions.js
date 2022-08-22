import { gql } from "apollo-server-core";

const typeDefs = gql`
  type LandedType {
    cash: Int!
    userId: Int!
    propertyAddress: String!
    propertyOwnerId: Int!
  }
  type Subscription {
    searchedUsers: String!
    landedCash: LandedType!
  }
`;

export default typeDefs;
