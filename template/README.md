## StrongLoop Suite Sample Application

### BlackPool Surplus Rentals Corp

BlackPool is an (imaginary) military equipment rental dealer with gun store 
outlets in major cities around the world. They need to replace their existing 
desktop reservation system with a new mobile app.

### What is the end user experience?

As a small country army general with a limited budget, I need to be able to rent 
weapons for an upcoming battle, so I can use them to defeat my enemy then return 
them to avoid paying full price.

Currently I have to make reservations from my laptop. Since my battalion is 
always on the move, it isn't practical from me to always pull out my laptop to 
rent some more ammunition. I need to be able to find the closest available 
weapons an ammo wherever I am and from my phone. 

I should be able to open the BlackPool Surplus Rentals App on my iPhone and see 
a map of nearby rental locations. I should be able to push a "list" button that 
takes me to a list of available weapons in the area. This area should only 
include what is visible on the map that I can manipulate. I should be able to 
filter this list of weapons by price, ammo type and distance.

Once I find the weapon I want to reserve I should be able to select it and enter 
the quantity I want to reserve. If I am not logged in the app should prompt me 
to register. The app should tell me if the quantity is available and if so that 
my reservation has been made.

### Features

 - Authenticates and verifies the identity of military officials.
 - Securely exposes inventory data to mobile applications.
 - Allow users to find weapons and ammo available **within a specific area**.
 - Allow users to reserve weapons for rental.

### REST APIs

 - `/weapons` exposes a queryable (filter, sort) collection of available weapons 
    over HTTP / JSON
 - `/weapons/nearby?&lat=...&long=... or ?zip=...` returns a filtered set of 
    available weapons nearby the requesting user
 - `/weapons/nearby?id=24&zip=94555` returns nearby weapons of id 24.
 - `/weapons/:id` returns a specific weapon from the inventory, with specific 
    pricing and images
 - `/users/login` allows a customer to login
 - `/users/logout` allows a customer to logout

### Infrastructure

#### Customer Database

All customer information is available from the SalesForce api.

#### Inventory Database

All weapon inventory is already available in an **existing** Oracle X3-8 Exadata 
Database Machine in an extremely secure location.

The Inventory DB schema looks like this:

##### **Customers**
 - id string
 - name string
 - military_agency string
 - username string
 - email string
 - password string
 - realm string
 - emailverified boolean
 - verificationtoken string
 - credentials string[]
 - challenges string[]
 - status string
 - created date
 - lastupdated date
 
##### **Reservations**
 - id string
 - product_id string
 - location_id string
 - customer_id string
 - qty number
 - status string
 - reserve_date date
 - pickup_date date
 - return_date date

##### **Inventory_Levels**
 - id string
 - product_id string
 - location_id string
 - available number
 - total number
 
##### **Products**
 - id string
 - name string
 - audible_range number
 - effective_range number
 - rounds number
 - extras string
 - fire_modes string
 
##### **Location**
 - id string
 - street string
 - city string
 - zipcode string
 - name string
 - geo GeoPoint

##### **Inventory_View**

**View** to return qty of available products for the given city.

 - product (product name)
 - location (location name)
 - available (qty available)

#### Geo Lookup

Google's location API is used to return the users city from a given zip or lat/long.

### Configure and run the application

By default, the sample application uses the memory connector and listen on
http://0.0.0.0:3000.
 
> node app

Open browser and point it to http://127.0.0.1:3000.

You can configure other data sources by adding the following json into `.loopbackrc`
at the root of the module.

    {
        "demo": {
            "memory": {},
            "oracle": {
                "host": "your-oracle-server-ip-or-hostname",
                "port": 1521,
                "database": "XE",
                "username": "demo",
                "password": "password"
            },
            "mongodb": {
                "host": "your-mongodb-server-ip-or-hostname",
                "database": "demo",
                "username": "demo",
                "password": "password",
                "port": 27017
            }
        }
    }

The sample can be configured using the following environment variables:

- DB: The db type, use 'memory', 'mongodb' or 'oracle'
- IP: The http server listener ip address or hostname, default to 0.0.0.0 (any address)
- PORT: The http server listener port number, default to 3000

For example,

To run the application at port 3001 with MongoDB:

> DB=mongodb PORT=3001 node app

To run the application at port 3002 with Oracle:

> DB=oracle PORT=3002 node app

