import supertest from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/database";
import * as recommendationFactory from "../factories/recommendationFactory";

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
});
afterAll(async () => {
  await prisma.$disconnect();
});
describe("Testing POST/recommendations/", () => {
  it("Should return 201 if request is successful", async () => {
    const newRec = await recommendationFactory.newRecommendation();

    const result = await supertest(app).post("/recommendations").send(newRec);

    expect(result.status).toBe(201);
  });
  it("Should return 422 if request body has an invalid format", async () => {
    const wrongRecomendation1 = {
      name: "This should fail",
      youtubeLink: "https://open.spotify.com/track/3NMORNJPqARzfspojSKfRJ",
    };
    const wrongRecomendation2 = {
      youtubeLink: "https://www.youtube.com/watch?v=zhIScvlFn2w",
    };

    const result1 = await supertest(app)
      .post("/recommendations")
      .send(wrongRecomendation1);
    const result2 = await supertest(app)
      .post("/recommendations")
      .send(wrongRecomendation2);
    expect(result1.status).toBe(422);
    expect(result2.status).toBe(422);
  });
  it("Should return 409 if recomendation name is not unique", async () => {
    const newRec = await recommendationFactory.newRecommendation();

    await supertest(app).post("/recommendations").send(newRec);
    const result = await supertest(app).post("/recommendations").send(newRec);

    expect(result.status).toBe(409);
  });
});
describe("Testing GET/recommendations", () => {
  it("Should return the newest 10 recomendations", async () => {
    const recList = [];
    for (let x = 0; x < 11; x++) {
      recList[x] = await recommendationFactory.newRecommendation();
    }
    for (let x = 0; x < 11; x++) {
      await supertest(app).post("/recommendations").send(recList[x]);
    }

    const { body: result } = await supertest(app).get("/recommendations");

    expect(result.length).toBe(10);
    expect(result[0]).toMatchObject(recList[10]);
    expect(result[9]).toMatchObject(recList[1]);
  });
  it("Should return empty array when empty", async () => {
    const { body: result } = await supertest(app).get("/recommendations");
    expect(result.length).toBe(0);
  });
});
describe("Testing route POST/recommendations/:id/upvote", () => {
  it("Should return 200 on a successful upvote", async () => {
    const createdRec = await recommendationFactory.registerNewRecommendation();

    const result = await supertest(app).post(
      `/recommendations/${createdRec.id}/upvote`
    );
    expect(result.status).toBe(200);
  });
  it("Should properly add a upvote on a success", async () => {
    const createdRec = await recommendationFactory.registerNewRecommendation();

    await supertest(app).post(`/recommendations/${createdRec.id}/upvote`);
    let checkedRec = await recommendationFactory.checkRecommendation(
      createdRec.id
    );
    const scoreCheck1 = checkedRec.score;
    await supertest(app).post(`/recommendations/${createdRec.id}/upvote`);
    checkedRec = await recommendationFactory.checkRecommendation(createdRec.id);
    const scoreCheck2 = checkedRec.score;

    expect(scoreCheck1).toBe(1);
    expect(scoreCheck2).toBe(2);
  });
  it("Should return 404 if recommendation does not exist", async () => {
    const randomNumber = recommendationFactory.getRandomInt(1, 1000);

    const result = await supertest(app).post(
      `recommendations/${randomNumber}/upvote`
    );

    expect(result.status).toBe(404);
  });
});
describe("Testing route POST/recommendations/:id/downvote", () => {
  it("Should return 200 on a successful downvote", async () => {
    const createdRec = await recommendationFactory.registerNewRecommendation();

    const result = await supertest(app).post(
      `/recommendations/${createdRec.id}/downvote`
    );
    expect(result.status).toBe(200);
  });
  it("Should properly subtract a downvote on a success", async () => {
    const createdRec = await recommendationFactory.registerNewRecommendation();

    await supertest(app).post(`/recommendations/${createdRec.id}/downvote`);
    let checkedRec = await recommendationFactory.checkRecommendation(
      createdRec.id
    );
    const scoreCheck1 = checkedRec.score;
    await supertest(app).post(`/recommendations/${createdRec.id}/downvote`);
    checkedRec = await recommendationFactory.checkRecommendation(createdRec.id);
    const scoreCheck2 = checkedRec.score;

    expect(scoreCheck1).toBe(-1);
    expect(scoreCheck2).toBe(-2);
  });
  it("Should return 404 if recommendation does not exist", async () => {
    const randomNumber = recommendationFactory.getRandomInt(1, 1000);

    const result = await supertest(app).post(
      `recommendations/${randomNumber}/downvote`
    );

    expect(result.status).toBe(404);
  });
});
describe("Testing route GET/recommendations/:id", () => {
  it("should return status 200 if successful", async () => {
    const createdRec = await recommendationFactory.registerNewRecommendation();

    const result = await supertest(app).get(
      `/recommendations/${createdRec.id}`
    );

    expect(result.status).toBe(200);
  });
  it("Should return the recommendation with specified ID", async () => {
    const createdRec = await recommendationFactory.registerNewRecommendation();

    const result = await supertest(app).get(
      `/recommendations/${createdRec.id}`
    );

    expect(result.body).toMatchObject(createdRec);
  });
  it("Should return status 404 if recommendation does not exist", async () => {
    const randomNumber = recommendationFactory.getRandomInt(1, 1000);

    const result = await supertest(app).get(`/recommendations/${randomNumber}`);

    expect(result.status).toBe(404);
  });
});
describe("Testing route GET/recommendations/random", () => {
  it("Should return 200 if successfull", async () => {
    await recommendationFactory.registerNewRecommendation();

    const result = await supertest(app).get(`/recommendations/random`);

    expect(result.status).toBe(200);
  });
  it("Should return 404 if no recommendations exist", async () => {
    const result = await supertest(app).get(`/recommendations/random`);

    expect(result.status).toBe(404);
  });
  it("Should return a valid, random recommendation", async () => {
    for (let x = 0; x < 10; x++) {
      await recommendationFactory.registerNewRecommendation();
    }

    const result = [];
    for (let x = 0; x < 4; x++) {
      const { body: entry } = await supertest(app).get(
        `/recommendations/random`
      );
      result[x] = entry;
    }
    const comparisons = [];
    for (let x = 0; x < 3; x++) {
      comparisons[x] = result[3].id !== result[x].id;
    }
    expect(comparisons).toContain(true);
  });
});
describe("Testing route GET/recommendations/top:amount", () => {
  it("Should return 200 when successfull", async () => {
    const randomNumber = recommendationFactory.getRandomInt(1, 10);

    const result = await supertest(app).get(
      `/recommendations/top/${randomNumber}`
    );

    expect(result.status).toBe(200);
  });
  it("Should return the top recommendations", async () => {
    const numberOfRecs = recommendationFactory.getRandomInt(1, 10);
    const top3Index = [];
    top3Index[0] = recommendationFactory.getRandomInt(1, 10);
    top3Index[1] = recommendationFactory.getRandomInt(1, 10);
    while (top3Index[0] === top3Index[1]) {
      top3Index[1] = recommendationFactory.getRandomInt(1, 10);
    }
    top3Index[2] = recommendationFactory.getRandomInt(1, 10);
    while (top3Index[0] === top3Index[2] || top3Index[1] === top3Index[2]) {
      top3Index[2] = recommendationFactory.getRandomInt(1, 10);
    }
    const createdRecsList = [];
    for (let x = 0; x < 10; x++) {
      const createdRec =
        await recommendationFactory.registerNewRecommendation();
      createdRecsList[x] = createdRec;
    }
    const top3Rec = [];
    for (let x = 0; x < 3; x++) {
      top3Rec[x] = createdRecsList[top3Index[x]];
    }

    await recommendationFactory.setScore(top3Rec[0].id, 10);
    await recommendationFactory.setScore(top3Rec[1].id, 5);
    await recommendationFactory.setScore(top3Rec[2].id, 2);
    for (let x = 0; x < 3; x++) {
      top3Rec[x] = await recommendationFactory.checkRecommendation(
        top3Rec[x].id
      );
    }

    const { body: result } = await supertest(app).get(
      `/recommendations/top/${numberOfRecs}`
    );

    expect(result[0]).toMatchObject(top3Rec[0]);
    expect(result[1]).toMatchObject(top3Rec[1]);
    expect(result[2]).toMatchObject(top3Rec[2]);
  });
  it("Should return a specified amount of recommendations", async () => {
    const randomNumber = recommendationFactory.getRandomInt(1, 5);
    for (let x = 0; x < 11; x++) {
      await recommendationFactory.registerNewRecommendation();
    }

    const { body: result } = await supertest(app).get(
      `/recommendations/top/${randomNumber}`
    );
    expect(result.length).toBe(randomNumber);
  });
});
