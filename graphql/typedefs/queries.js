import { gql } from "apollo-server";

const typeDefs = gql`
  type Query {
    login(firebaseId: ID!): String!
    searchUsers(searchString: String!): [User!]!
    getMe: User!
    getUser(username: String!): User
    getUserId(id: Int!): User
    getTradeId(id: Int!): Trade
    getUserPropertiesId(userId: Int!): [UserProperty!]!
    userExists(firebaseId: String!): Boolean!
    spin: SpinOutcome!
    getRandomProperty: Property!
    landRandomProperty: UserProperty!
  }
`;

export default typeDefs;
