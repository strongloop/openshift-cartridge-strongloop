var DataSource = require('loopback-datasource-juggler').DataSource;

var config = require('rc')('loopback', {dev: {mongodb: {}}}).dev.mongodb;

var ds = new DataSource(require('../'), config);

var Customer = ds.createModel('customer', {seq: {type: Number, id: true}, name: String, emails: [
  {label: String, email: String}
], age: Number});

Customer.destroyAll(function (err) {
  Customer.create({
    seq: 1,
    name: 'John1',
    emails: [
      {label: 'work', email: 'john@x.com'},
      {label: 'home', email: 'john@y.com'}
    ],
    age: 30
  }, function (err, customer1) {
    console.log(customer1.toObject());

    Customer.create({
      seq: 2,
      name: 'John2',
      emails: [
        {label: 'work', email: 'john2@x.com'},
        {label: 'home', email: 'john2@y.com'}
      ],
      age: 35
    }, function (err, customer2) {

      Customer.find({where: {name: {inq: 'John1'}}}, function(err, customers) {
        console.log('Customers matched by inq', customers);
      });


    });
  });
});


