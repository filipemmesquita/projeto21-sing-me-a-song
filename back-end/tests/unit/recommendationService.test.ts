import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import { recommendationService } from "../../src/services/recommendationsService";
import { faker } from "@faker-js/faker";
import { jest } from "@jest/globals";
import * as recommendationFactory from "../factories/recommendationFactory";

beforeEach(() => {
  jest.restoreAllMocks();
});

describe("Unit testing insert", () => {
  it("Should call create recommendation with correct params", async () => {
    const body = await recommendationFactory.newRecommendation();
    const spy = jest
      .spyOn(recommendationRepository, "create")
      .mockResolvedValue(undefined);
    jest
      .spyOn(recommendationRepository, "findByName")
      .mockResolvedValue(undefined);

    await recommendationService.insert(body);

    expect(spy).toHaveBeenCalledWith({
      name: body.name,
      youtubeLink: body.youtubeLink,
    });
  });

  it("Should call findByName with correct params", async () => {
    const body = await recommendationFactory.newRecommendation();

    jest.spyOn(recommendationRepository, "create").mockResolvedValue(undefined);

    const spy = jest
      .spyOn(recommendationRepository, "findByName")
      .mockResolvedValue(undefined);

    await recommendationService.insert(body);

    expect(spy).toHaveBeenCalledWith(body.name);
  });

  it("Should throw a conflict error when name already exists", async () => {
    const body = await recommendationFactory.newRecommendation();
    jest.spyOn(recommendationRepository, "create").mockResolvedValue(undefined);

    jest.spyOn(recommendationRepository, "findByName").mockResolvedValue({
      id: faker.datatype.number(),
      score: faker.datatype.number({ min: -4 }),
      name: body.name,
      youtubeLink: body.youtubeLink,
    });

    const result = recommendationService.insert(body);

    expect(result).rejects.toMatchObject({
      type: "conflict",
      message: "Recommendations names must be unique",
    });
  });
});
describe("Unit testing upvote", () => {
  it("Should get a recommendation by id", async () => {
    const newRecId = faker.datatype.number();
    const newRec = await recommendationFactory.newRecommendation();

    const spy = jest.spyOn(recommendationRepository, "find").mockResolvedValue({
      id: newRecId,
      score: faker.datatype.number({ min: -4 }),
      name: newRec.name,
      youtubeLink: newRec.youtubeLink,
    });

    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockResolvedValue(undefined);

    await recommendationService.upvote(newRecId);

    expect(spy).toHaveBeenCalledWith(newRecId);
  });

  it("Should call updateScore with increment", async () => {
    const newRecId = faker.datatype.number();
    const newRec = await recommendationFactory.newRecommendation();

    jest.spyOn(recommendationRepository, "find").mockResolvedValue({
      id: newRecId,
      score: faker.datatype.number({ min: -4 }),
      name: newRec.name,
      youtubeLink: newRec.youtubeLink,
    });

    const spy = jest
      .spyOn(recommendationRepository, "updateScore")
      .mockResolvedValue({
        id: newRecId,
        score: faker.datatype.number({ min: -4 }),
        name: newRec.name,
        youtubeLink: newRec.youtubeLink,
      });

    await recommendationService.upvote(newRecId);

    expect(spy).toHaveBeenCalledWith(newRecId, "increment");
  });
});
describe("Unit testing downvote", () => {
  it("Should call find from repository with correct params", async () => {
    const newRecId = faker.datatype.number();
    const newRec = await recommendationFactory.newRecommendation();
    const spy = jest.spyOn(recommendationRepository, "find").mockResolvedValue({
      id: newRecId,
      score: faker.datatype.number({ min: -4 }),
      name: newRec.name,
      youtubeLink: newRec.youtubeLink,
    });

    jest.spyOn(recommendationRepository, "updateScore").mockResolvedValue({
      id: newRecId,
      score: faker.datatype.number({ min: -4 }),
      name: newRec.name,
      youtubeLink: newRec.youtubeLink,
    });

    await recommendationService.downvote(newRecId);

    expect(spy).toHaveBeenCalledWith(newRecId);
  });
  it("Should call updateScore with decrement", async () => {
    const newRecId = faker.datatype.number();
    const newRec = await recommendationFactory.newRecommendation();

    jest.spyOn(recommendationRepository, "find").mockResolvedValue({
      id: newRecId,
      score: faker.datatype.number({ min: -4 }),
      name: newRec.name,
      youtubeLink: newRec.youtubeLink,
    });

    const spy = jest
      .spyOn(recommendationRepository, "updateScore")
      .mockResolvedValue({
        id: newRecId,
        score: faker.datatype.number({ min: -4 }),
        name: newRec.name,
        youtubeLink: newRec.youtubeLink,
      });
    await recommendationService.downvote(newRecId);

    expect(spy).toHaveBeenCalledWith(newRecId, "decrement");
  });
  it("Should call delete when score is lowered to -5", async () => {
    const newRecId = faker.datatype.number();
    const newRec = await recommendationFactory.newRecommendation();

    jest.spyOn(recommendationRepository, "find").mockResolvedValue({
      id: newRecId,
      score: faker.datatype.number({ min: -4 }),
      name: newRec.name,
      youtubeLink: newRec.youtubeLink,
    });

    jest.spyOn(recommendationRepository, "updateScore").mockResolvedValue({
      id: newRecId,
      score: -6,
      name: newRec.name,
      youtubeLink: newRec.youtubeLink,
    });

    const spy = jest
      .spyOn(recommendationRepository, "remove")
      .mockResolvedValue(undefined);

    await recommendationService.downvote(newRecId);

    expect(spy).toHaveBeenCalledWith(newRecId);
  });
});
describe("Unit testing get", () => {
  it("Should call all corresponding recommendations", async () => {
    const newRec = await recommendationFactory.newRecommendation();
    const spy = jest
      .spyOn(recommendationRepository, "findAll")
      .mockResolvedValue([
        {
          id: faker.datatype.number(),
          score: faker.datatype.number(),
          name: newRec.name,
          youtubeLink: newRec.youtubeLink,
        },
      ]);

    await recommendationService.get();

    expect(spy).toHaveBeenCalled();
  });
});
describe("Unit testing getTop", () => {
  it("Should call getAmountByScore with correct params", async () => {
    const amount = faker.datatype.number({ min: 1, max: 10 });
    const mockArray = [];
    for (let x = 0; x < amount; x++) {
      const newRec = await recommendationFactory.newRecommendation();
      mockArray[x] = {
        id: faker.datatype.number(),
        score: faker.datatype.number(),
        name: newRec.name,
        youtubeLink: newRec.youtubeLink,
      };
    }

    const spy = jest
      .spyOn(recommendationRepository, "getAmountByScore")
      .mockResolvedValue(mockArray);

    await recommendationService.getTop(amount);

    expect(spy).toHaveBeenCalledWith(amount);
  });
});
describe("Unit testing getById", () => {
  it("Should call find with correct values", async () => {
    const newRecId = faker.datatype.number();
    const newRec = await recommendationFactory.newRecommendation();

    const spy = jest.spyOn(recommendationRepository, "find").mockResolvedValue({
      id: newRecId,
      score: faker.datatype.number(),
      name: newRec.name,
      youtubeLink: newRec.youtubeLink,
    });
    await recommendationService.getById(newRecId);

    expect(spy).toHaveBeenCalledWith(newRecId);
  });
  it("Should throw an error when a recommendation does not exist", async () => {
    const newRecId = faker.datatype.number();
    const newRec = await recommendationFactory.newRecommendation();

    const spy = jest
      .spyOn(recommendationRepository, "find")
      .mockResolvedValue(undefined);

    const result = recommendationService.getById(newRecId);

    expect(result).rejects.toMatchObject({
      type: "not_found",
    });
  });
});
