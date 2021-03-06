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
          expect(res.body).to.have.lengthOf.at.least(1);
          return BlogPost.count();
        })
        .then(function(count) {
          expect(res.body).to.have.lengthOf(count);
        });
    });

    it('should return blog posts with the proper fields', function () {
      let resPost;
      return chai.request(app)
        .get('/posts')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);

          res.body.forEach(function(post) {
            expect(post).to.be.a('object');
            expect(post).to.include.keys(
              'title', 'content', 'author');            
          });
          resPost = res.body[0];
          return BlogPost.findById(resPost.id);
        })
        .then(function (post) {
          expect(resPost.id).to.be.equal(post.id);
          expect(resPost.author).to.be.equal(`${post.author.firstName} ${post.author.lastName}`);
          expect(resPost.content).to.be.equal(post.content);
          expect(resPost.title).to.be.equal(post.title);
        });
    });
  });

  describe('POST endpoint', function () {

    it('should add a new blog post', function () {

      const newPost = {
        author: {
          lastName: 'Bridges',
          firstName: 'Chris'
        },
        title: 'Title title title',
        content: 'lorem ipsum lorem ipsum'
      };

      return chai.request(app)
        .post('/posts')
        .send(newPost)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('title', 'content', 'author');
          expect(res.body.author).to.equal(`${newPost.author.firstName} ${newPost.author.lastName}`);
          expect(res.body.title).to.equal(newPost.title);
          expect(res.body.content).to.equal(newPost.content);
          
          return BlogPost.findById(res.body.id);
        })
        .then(function(post) {
          expect(post.title).to.equal(newPost.title);
          expect(post.content).to.equal(newPost.content);
          expect(JSON.stringify(post.author)).to.equal(JSON.stringify(newPost.author));
        });

    });
  });

  describe('PUT endpoint', function() {

    it('should update given fields', function () {
      const updatedFields = {
        title: 'Updated title',
        content: 'updated content'
      };

      return BlogPost.findOne()
        .then(function(post) {
          updatedFields.id = post.id;
          return chai.request(app)
            .put(`/posts/${post.id}`)
            .send(updatedFields);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return BlogPost.findById(updatedFields.id);
        })
        .then(function(post) {
          expect(post.title).to.equal(updatedFields.title);
          expect(post.content).to.equal(updatedFields.content);
        });

    });
  });

  describe('DELETE endpoint', function () {

    it('should delete blog post by ID', function () {
      let post;
      BlogPost.findOne()
      .then(function(_post) {
        post = _post;
        return chai.request(app).delete(`/posts/${post.id}`);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
        return BlogPost.findById(post.id);
      })
      .then(function(_post) {
        expect(_post).to.be.null;
      })
    });

  });

});