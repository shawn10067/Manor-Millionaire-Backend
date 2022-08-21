import { gql } from "apollo-server";

const typeDefs = gql`
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
`;

export default typeDefs;
