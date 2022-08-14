import numeral from "numeral";
export const toMoneyString = (cash) => {
  return numeral(cash).format("0,0");
};

export const makeMillion = (cash) => {
  return Number.parseFloat(cash.toPrecision(2));
};
