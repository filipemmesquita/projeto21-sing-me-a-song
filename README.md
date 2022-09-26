# projeto21-sing-me-a-song
Test suites for an anonymous song sharing web app.
Open terminal inside directory "back-end" then enter npm install.
Do the same inside directory "front-end".
## Back-End
Open terminal inside directory "back-end". There are 3 testing scripts:
### npm run test:unit
Executes unit testing suites.
### npm run test:integration
Executes integration testing suites. Requires .env.test to be set up. 
### npm run test:e2e
Starts a server in a test environment with intention of executing end to end testing. For tests to actually be executed, cypress must be opened on front end while this server is running.
## Front-End
While test:e2e is running, open terminal inside directory "front-end" and enter "npx cypress open".
