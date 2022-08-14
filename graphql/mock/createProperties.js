import { faker } from "@faker-js/faker";
import { makeMillion } from "../utils/money.js";
import { nanoid } from "nanoid";

const countries = {
  Canada: "en_CA",
  Germany: "de",
  Australia: "en_AU",
  USA: "en_US",
  Spain: "es",
  France: "fr",
  Switzerland: "fr_CH",
  Italy: "it",
};

const rarities = {
  legendary: {
    min: 100000000,
    max: 150000000,
  },
  ultraRare: {
    min: 70000000,
    max: 100000000,
  },
  rare: {
    min: 40000000,
    max: 70000000,
  },
  common: {
    min: 5000000,
    max: 40000000,
  },
};

// getting country and address
const countryNames = Object.keys(countries);
const randomCountryName = () => {
  const countryIndex = Math.floor(Math.random() * countryNames.length);
  const countryName = countryNames[countryIndex];
  return {
    countryName,
    locale: countries[countryName],
  };
};

// getting a rarity
const getRarity = () => {
  let rarity;
  const chance = Math.random();
  if (chance < 0.04) {
    rarity = rarities.legendary;
  } else if (chance < 0.08) {
    rarity = rarities.ultraRare;
  } else if (chance < 0.2) {
    rarity = rarities.rare;
  } else {
    rarity = rarities.common;
  }
  const { min, max } = rarity;
  return {
    min,
    max,
  };
};

// getting random price based on min max
const createPrice = (min, max) => {
  const difference = max - min;
  return makeMillion(min + Math.random() * difference);
};

// getting random house status
const houseStatus = ["alone", "set", "tier1", "tier2"];
const createHouseStatus = () => {
  return houseStatus[Math.floor(Math.random() * houseStatus.length)];
};

// alone / = 6
// set / = 4
// tier 1 = / 2
// tier 2 = * 1.5
// property value = / 2.4
// tier 1 = / 1.6
// tier 2 = * 1.25

const createProperty = () => {
  // getting locale
  const { locale, countryName } = randomCountryName();
  faker.locale = locale;

  // address
  let address = faker.address.street();
  while (address.length > 21) {
    address = faker.address.street();
  }

  // price
  const { min, max } = getRarity();
  const price = createPrice(min, max);

  // income
  const income = {
    alone: makeMillion(price / 6),
    set: makeMillion(price / 4),
    tier1: makeMillion(price / 2),
    tier2: makeMillion(price * 1.5),
  };

  // property value
  const propertyValue = makeMillion(price / 2.4);

  // cost
  const cost = {
    tier1Cost: makeMillion(price / 1.6),
    tier2Cost: makeMillion(price * 1.25),
  };

  // status
  const status = createHouseStatus();

  // property
  const returnProperty = {
    id: nanoid(),
    country: countryName,
    address,
    imageUrl: "../assets/castle.jpg",
    price,
    income,
    propertyValue,
    cost,
    status,
    frozen: false,
  };

  return returnProperty;
};

export default createProperty;
