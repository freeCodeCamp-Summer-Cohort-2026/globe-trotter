/** @type {import("jest").Config} */
const path = require("node:path");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

module.exports = {
  rootDir: ".",
  testEnvironment: "node",

  transform: {
    "^.+\\.(t|j)s$": "@swc/jest",
},

  testMatch: ["<rootDir>/src/__tests__/**/*.test.ts"],

  moduleFileExtensions: ["js", "ts", "json"],
};