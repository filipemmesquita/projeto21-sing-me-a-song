import { faker } from "@faker-js/faker";
import { prisma } from "../../src/database";

export async function newRecommendation() {
  const youtubelinks = [
    "https://www.youtube.com/watch?v=g3drz5LNYrU",
    "https://www.youtube.com/watch?v=esofirhSD-o",
    "https://www.youtube.com/watch?v=g5JgVRBqP7w",
    "https://www.youtube.com/watch?v=CsHZohS2gPQ",
    "https://www.youtube.com/watch?v=EjL1oMvO22U",
    "https://www.youtube.com/watch?v=Ot-q9ma28Hs",
    "https://www.youtube.com/watch?v=b4taIpALfAo",
    "https://www.youtube.com/watch?v=PZbkF-15ObM",
    "https://www.youtube.com/watch?v=EKLWC93nvAU",
    "https://www.youtube.com/watch?v=ebILIKHi9wo",
    "https://www.youtube.com/watch?v=rQLA4OxjGMY",
    "https://www.youtube.com/watch?v=FC7i2ObP1z8",
  ];
  const linksIndex = faker.mersenne.rand(0, youtubelinks.length);
  const newRec = {
    name: faker.lorem.words(3),
    youtubeLink: youtubelinks[linksIndex],
  };
  return newRec;
}
export async function registerNewRecommendation() {
  const newRec = await newRecommendation();
  const createdRec = await prisma.recommendation.create({
    data: newRec,
  });

  return createdRec;
}
export async function checkRecommendation(id: number) {
  const recomendation = await prisma.recommendation.findFirst({
    where: {
      id: id,
    },
  });
  return recomendation;
}
export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
export async function setScore(id: number, score: number) {
  const createdRec = await prisma.recommendation.update({
    where: { id },
    data: { score },
  });

  return createdRec;
}
