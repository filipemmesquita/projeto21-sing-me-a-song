import {faker} from '@faker-js/faker'
import recommendationFactory from './factories/recommendationFactory.js'

beforeEach(async () => {
    await cy.request('POST', 'http://localhost:4001/test/reset', {});
  });

describe('Tests route POST/recommendations',()=>{
    it('Tests if a new recommendation can be successfully created',async()=>{
        const newRec=await recommendationFactory();

        cy.visit('http://localhost:3000')

        cy.get('input[placeholder=Name]').type(newRec.name);
        cy.get("input[placeholder='https://youtu.be/...']").type(newRec.youtubeLink);
        

        cy.intercept('POST','http://localhost:4001/recommendations').as('newRec')

        cy.get('button').click();

        cy.wait('@newRec');

        cy.get('article').should('have.length',1);
    })
})