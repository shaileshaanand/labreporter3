import { faker } from "@faker-js/faker";
import { format } from "date-fns";

export const generatePhoneNumber = () =>
  `${faker.number.int({
    min: 6,
    max: 9,
  })}${faker.string.numeric(9)}`;

export const formatDate = (date: Date) => {
  return format(date, "yyyy-MM-dd hh:mm:ss");
};
