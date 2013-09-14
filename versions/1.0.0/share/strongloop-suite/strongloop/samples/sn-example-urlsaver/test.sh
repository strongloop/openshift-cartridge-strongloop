#!/bin/bash
curl -X PUT http://localhost:1337/sfmeetup?url=http://blog.strongloop.com/improving-meetups-as-the-new-organizer-of-the-sf-node-js-group/
echo
curl http://localhost:1337/sfmeetup
