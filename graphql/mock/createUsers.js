import { faker } from "@faker-js/faker";
import { nanoid } from "nanoid";
import { makeMillion } from "../utils/money.js";
import createProperty from "./createProperties.js";

// creating the properties
let properties = [];
for (let i = 0; i < 100; i++) {
  const newProperty = createProperty();
  properties = [...properties, newProperty];
}

// random username and password
const randomUsernamePassword = () => {
  const username = faker.internet.userName();
  const password = faker.internet.password();
  return {
    username,
    password,
  };
};

// creating users based on the User graphql typedef and getting random properties from it
const createUser = () => {
  const { username, password } = randomUsernamePassword();
  const id = nanoid();
  const cash = makeMillion(Math.random() * 1000000);
  const userProperties = [];
  for (let i = 0; i < Math.floor(Math.random() * 10); i++) {
    userProperties.push(
      properties[Math.floor(Math.random() * properties.length)]
    );
  }
  return {
    id,
    username,
    password,
    cash,
    properties: userProperties,
  };
};

const userArray = [];
for (let i = 0; i < 100; i++) {
  const newUser = createUser();
  userArray.push(newUser);
}

// add friends to the users based on the Friend graphql typedef and other users from the userArray
const createFriends = (user) => {
  const friends = [];
  for (let i = 0; i < Math.floor(Math.random() * 10); i++) {
    friends.push(userArray[Math.floor(Math.random() * userArray.length)]);
  }
  return friends;
};

const userWithFriends = userArray.map((user) => {
  return {
    ...user,
    friends: createFriends(user),
  };
});

// add trades to users based on the Trade graphql typedef and other users from the userArray
const createTrades = (user) => {
  const trades = [];
  // filter the userArray to get all users that are not the current user
  const otherUsers = userArray.filter((otherUser) => otherUser.id !== user.id);

  // get random number of trades to create for the user
  const numberOfTrades = Math.floor(Math.random() * 10);

  for (let i = 0; i < numberOfTrades; i++) {
    // get random user and their property from the otherUsers array
    const randomUser =
      otherUsers[Math.floor(Math.random() * otherUsers.length)];
    const theirUserID = randomUser.id;
    const theirProperties = [
      randomUser.properties[
        Math.floor(Math.random() * randomUser.properties.length)
      ],
    ];
    const recievingCash = makeMillion(Math.random() * 1000000);

    // random property from the user's properties
    const requestedCash = makeMillion(Math.random() * 1000000);
    const recievingProperties = [
      user.properties[Math.floor(Math.random() * user.properties.length)],
    ];

    // create trade object
    const randomTradeId = nanoid();
    const newTrade = {
      id: randomTradeId,
      theirUserID,
      theirProperties,
      requestedCash,
      recievingProperties,
      recievingCash,
    };

    // add trade to trades array
    trades.push(newTrade);
  }

  user.trades = trades;
  return user;
};

const userTrades = userWithFriends.map((user) => {
  return createTrades(user);
});

// console.dir(userTrades, { depth: null });

const createUsers = () => {
  return userTrades;
};

export default createUsers;
