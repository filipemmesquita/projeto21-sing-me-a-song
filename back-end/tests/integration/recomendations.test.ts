import supertest from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/database";
import recommendationFactory from "../factories/recommendationFactory";

beforeEach(async()=>{
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
});
afterAll(async()=>{
    await prisma.$disconnect();
});
describe('Testing POST/recommendations/',()=>{
    it('Should return 201 if request is successful',async()=>{
        const newRec = await recommendationFactory();

        const result = await supertest(app).post('/recommendations').send(newRec);

        expect(result.status).toBe(201);
    })
    it('Should return 422 if request body has an invalid format',async()=>{
        const wrongRecomendation1={
            name:"This should fail",
            youtubeLink:"https://open.spotify.com/track/3NMORNJPqARzfspojSKfRJ"
        }
        const wrongRecomendation2={
            youtubeLink:"https://www.youtube.com/watch?v=zhIScvlFn2w"
        }

        const result1 = await supertest(app).post('/recommendations').send(wrongRecomendation1);
        const result2 = await supertest(app).post('/recommendations').send(wrongRecomendation2);
        expect(result1.status).toBe(422);
        expect(result2.status).toBe(422);
    });
    it('Should return 409 if recomendation name is not unique',async()=>{
        const newRec = await recommendationFactory();
        
        await supertest(app).post('/recommendations').send(newRec);
        const result = await supertest(app).post('/recommendations').send(newRec);
        
        expect(result.status).toBe(409);
    })
})
describe('Testing GET/recommendations',()=>{
    it('Should return the newest 10 recomendations',async()=>{
        const recList=[];
        for(let x=0;x<11;x++){
            recList[x]=await recommendationFactory();
        }
        for(let x=0;x<11;x++){
            await supertest(app).post('/recommendations').send(recList[x]);
        }
        
        const {body:result}=await supertest(app).get('/recommendations');

        expect(result.length).toBe(10);
        expect(result[0]).toMatchObject(recList[10]);
        expect(result[9]).toMatchObject(recList[1]);
    })
    it('Should return empty array when empty',async()=>{
        const{body:result}=await supertest(app).get('/recommendations');
        expect(result.length).toBe(0);
    })
})