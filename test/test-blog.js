'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the expect syntax available throughout
// this module
const expect = chai.expect;

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config'); // declare TestDatabaseURL in config.js

chai.use(chaiHttp);

function seedPostData () {
  console.info('seeding post data');
  const seedData = [];

  for (let i = 0; i < 10; i++) {
    seedData.push({
      author: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
      },
      title: faker.lorem.words(),
      content: faker.lorem.paragraph()
    });
  }
  console.log(seedData);
  return BlogPost.insertMany(seedData);
}