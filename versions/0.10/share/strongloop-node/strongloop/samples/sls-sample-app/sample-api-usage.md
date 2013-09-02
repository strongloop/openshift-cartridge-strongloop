### `/weapons`

**exposes a queryable (filter, sort) collection of available weapons over HTTP / JSON**


#### GET `/weapons`

**Request**

    Content-Type: application/json

**Response**

    200
    [
      {"id": 1, ...},
      {"id": 2, ...},
      {"id": 3, ...},
      {"id": 4, ...},
      {"id": 5, ...},
      ...
    ]
  
#### GET `/weapons?{"limit": 5, "qty": {"gt": 0}}`

**Request**

    Content-Type: application/json

**Response**

    200
    [
      {"id": 1, ...},
      {"id": 2, ...},
      {"id": 3, ...},
      {"id": 4, ...},
      {"id": 5, ...}
    ]

Queries may include anything in the following form:

    {
      where: {qty: {gt: 0}} // qty is > 0
      order: 'qty DESC',
      skip: 10,
      limit: 5
    }