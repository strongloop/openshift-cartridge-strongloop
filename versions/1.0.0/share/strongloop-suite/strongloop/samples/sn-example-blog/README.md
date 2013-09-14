A sample blog application built with Node.js
============================================

How to run the server?
----------------------

1. Start a local mongodb instance

        mongod --dbpath=mongodb-2.2-demo/ &

2. Run the server as a single instance:

        slc run .

3. Run the server in 'clustered mode', with an instance per CPU

        slc run . --size=cpus

4. Access the server using the following URLs

  - <http://localhost:3000>
  - <http://localhost:3000/rest/users>
  - <http://localhost:3000/rest/blogs>

5. Sample user credentials, if prompted for authorization, use :

  - user: strongloop
  - password: password

Customize the configurations
----------------------------

### Configure the MongoDB connection

Update config/config.js:

        exports.creds = {
          mongo: {
            'hostname': 'localhost', // Host name
            'port': 27017, // Port number
            'username': '',
            'password': '',
            'name': '',
            'db': 'sample-blog_development' // DB name
          }
        }
