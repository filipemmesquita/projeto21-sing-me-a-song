import { faker } from "@faker-js/faker";
import * as scenarioFactory from "./factories/scenarioFactory.js";

beforeEach(async () => {
  await cy.request("POST", `${Cypress.env("baseURL")}/test/reset`, {});
});

describe("Tests homepage", () => {
  it("Should add a recommendation", async () => {
    const newRec = scenarioFactory.newRecommendation();

    cy.visit("http://localhost:3000");

    cy.get("input[placeholder=Name]").type(newRec.name);
    cy.get("input[placeholder='https://youtu.be/...']").type(
      newRec.youtubeLink
    );

    cy.intercept("POST", `${Cypress.env("baseURL")}/recommendations`).as(
      "newRec"
    );

    cy.get("button").click();

    cy.wait("@newRec");

    cy.get("article").should("have.length", 1);
  });
  it("Should add an upvote ", async () => {
    await scenarioFactory.registerNewRecommendation();

    cy.visit("http://localhost:3000");

    cy.contains("0").should("be.visible");
    cy.get("article").first().find("svg").first().click();
    cy.contains("1").should("be.visible");
  });
  it("Should subtract a downvote", async () => {
    await scenarioFactory.registerNewRecommendation();

    cy.visit("http://localhost:3000");

    cy.contains("0").should("be.visible");
    cy.get("article").first().find("svg").last().click();
    cy.contains("-1").should("be.visible");
  });
});
describe("Tests random page", () => {
  it("Should show one random recommendation", async () => {
    await scenarioFactory.registerNewRecommendation();

    cy.visit("http://localhost:3000/");
    cy.contains("Random").click();

    cy.url().should("equal", "http://localhost:3000/random");
    cy.get("article").should("have.length", 1);
  });
});
describe("Tests top page", () => {
  it("Should show 10 recommendations", async () => {
    for (let x = 0; x < 10; x++) {
      scenarioFactory.registerNewRecommendation();
    }
    cy.visit("http://localhost:3000/");
    cy.contains("Top").click();

    cy.url().should("equal", "http://localhost:3000/top");
    cy.get("article").should("have.length", 10);
  });
});
