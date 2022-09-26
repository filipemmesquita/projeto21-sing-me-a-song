import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import { recommendationService } from "../../src/services/recommendationsService";
import { faker } from "@faker-js/faker";
import { jest } from "@jest/globals";
import { conflictError, notFoundError } from "../../src/utils/errorUtils";
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
      score: faker.datatype.number(),
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