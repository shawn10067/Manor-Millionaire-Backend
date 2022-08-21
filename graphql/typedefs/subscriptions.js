import { gql } from "apollo-server-core";

const typeDefs = gql`
  type Subscription {
    searchedUsers: String
  }
`;

export default typeDefs;
