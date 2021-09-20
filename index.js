const express = require('express');
const mysql = require('mysql');
const app = express();
const bodyParser = require('body-parser')

const sql_config = {
   driver: 'mysql',
   client: 'mysql',
   connection: {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'svested_test',
   }
}
const knex = require('knex')(sql_config);

const server = app.listen(8081, function () {
   const port = server.address().port

   console.log(`started at http://localhost:${port}`)
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// sync way
app.get('/bar', function (req, res) {
   // here will be so many .then() nested if we have multiple queries
   // process runs one at a time and when completed, move to another process
   knex('users').then(users => {
      const num_user = {
         young_adult: 0,
         adult: 0,
         seniors: 0
      };
      for (let i = 0; i < users.length; i++) {
         const user = users[i];

         if (user.age >= 0 && user.age <= 35) {
            num_user.young_adult = num_user.young_adult + 1;
         }

         if (user.age >= 36 && user.age <= 50) {
            num_user.adult = num_user.adult + 1;
         }

         if (user.age >= 51) {
            num_user.seniors = num_user.seniors + 1;
         }
      }

      res.send({
         status: 'success',
         message: 'sync way',
         data: num_user
      })
   }).catch(error => {
      console.log('error', error);
      res.send({
         status: 'fail',
         message: error.message
      })
   })
})

// async way
app.get('/pie', async function (req, res) {
   try {
      // multiple processes can run simultaneously
      // and using async await is simple and clean
      const male_users = await knex('users').where('gender', 'M');
      const female_users = await knex('users').where('gender', 'F')

      res.send({
         status: "success",
         message: 'async way',
         data: {
            male_users: male_users.length,
            female_users: female_users.length
         }
      })
   } catch (error) {
      console.log('error', error);
      res.send({
         status: "fail",
         message: error.message
      })
   }
})

app.post('/chart', async function (req, res) {
   try {
      const inserted_user_id = await knex('users').insert(req.body)
      const user = await knex('users').where('id', inserted_user_id).first()

      res.send({
         status: "success",
         message: 'async way',
         data: user
      })
   } catch (error) {
      console.log('error', error);
      res.send({
         status: "fail",
         message: error.message
      })
   }
})

app.get('/chart', async function (req, res) {
   try {
      const users = await knex('users');

      res.send({
         status: "success",
         message: 'async way',
         data: users
      })
   } catch (error) {
      console.log('error', error);
      res.send({
         status: "fail",
         message: error.message
      })
   }
})