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

function tearDownDB () {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('BlogPost Resource API', function () {

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    return seedPostData();
  });

  afterEach(function () {
    return tearDownDB();
  });

  after(function () {
    return closeServer();
  });

  describe('Test GET Endpoint', function() {
    it('should return all posts', function () {
      let res;
      return chai.request(app)
        .get('/posts')
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body.blogposts).to.have.length.of.at.least(1);
          return BlogPost.count();
        })
        .then(function(count) {
          expect(res.body.blogposts).to.have.length.of(count);
        });
    });

    it('should return blog posts with the proper fields', function () {
      let resPost;
      return chai.request(app)
        .get('/posts')
        .then(function(res) {
          
        })
    });
  });

});