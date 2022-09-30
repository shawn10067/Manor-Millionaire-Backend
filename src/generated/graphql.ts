/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type FriendRequest = {
  __typename?: "FriendRequest";
  fromUser: User;
  id: Scalars["ID"];
  user: User;
};

export type Property = {
  __typename?: "Property";
  address: Scalars["String"];
  cost: PropertyCostValues;
  country: Scalars["String"];
  id: Scalars["ID"];
  imageUrl: Scalars["String"];
  income: PropertyPriceValues;
  price: Scalars["Int"];
  propertyValue: Scalars["Int"];
};

export type PropertyCostValues = {
  __typename?: "PropertyCostValues";
  tier1Cost: Scalars["Int"];
  tier2Cost: Scalars["Int"];
};

export type PropertyPriceValues = {
  __typename?: "PropertyPriceValues";
  alone: Scalars["Int"];
  set: Scalars["Int"];
  tier1: Scalars["Int"];
  tier2: Scalars["Int"];
};

export enum PropertyStatus {
  Alone = "ALONE",
  Set = "SET",
  Tier1 = "TIER1",
  Tier2 = "TIER2",
}

export enum SpinOutcome {
  GetProperty = "GET_PROPERTY",
  Jail = "JAIL",
  PayBills = "PAY_BILLS",
}

export type Trade = {
  __typename?: "Trade";
  id: Scalars["ID"];
  recieverCash: Scalars["Float"];
  recieverProperties: Array<UserProperty>;
  recieverUser: User;
  senderCash: Scalars["Float"];
  senderProperties: Array<UserProperty>;
  senderUser: User;
};

export type User = {
  __typename?: "User";
  cash: Scalars["Float"];
  friendRequests: Array<FriendRequest>;
  friends: Array<User>;
  frozen: Scalars["Boolean"];
  id: Scalars["ID"];
  jailed: Scalars["Boolean"];
  lastSpin: Scalars["String"];
  properties: Array<UserProperty>;
  trades: Array<Trade>;
  username: Scalars["String"];
};

export type UserProperty = {
  __typename?: "UserProperty";
  id: Scalars["ID"];
  property: Property;
  status: PropertyStatus;
  user: User;
};
