const GtfsRealtimeBindings = require("gtfs-realtime-bindings");
const fetch = require("node-fetch");

var request = require('request');

var requestSettings = {
  method: 'GET',
  url: 'https://gtfsrt.api.translink.com.au/GTFS/SEQ_GTFS.zip',
  encoding: null
};
request(requestSettings, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);
    feed.entity.forEach(function(entity) {
      if (entity.trip_update) {
        console.log(entity.trip_update);
      }
    });
  }
});


// (async () => {
//   try {
//     const response = await fetch("https://gtfsrt.api.translink.com.au/GTFS/SEQ_GTFS.zip", {
//       headers: {
//         "x-api-key": "<redacted>",
//         // replace with your GTFS-realtime source's auth token
//         // e.g. x-api-key is the header value used for NY's MTA GTFS APIs
//       },
//     });
//     if (!response.ok) {
//       const error = new Error(`${response.url}: ${response.status} ${response.statusText}`);
//       error.response = response;
//       throw error;
//       process.exit(1);
//     }
//     const buffer = await response.arrayBuffer();
//     const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
//       new Uint8Array(buffer)
//     );
//     feed.entity.forEach((entity) => {
//       if (entity.tripUpdate) {
//         console.log(entity.tripUpdate);
//       }
//     });
//   }
//   catch (error) {
//     console.log(error);
//     process.exit(1);
//   }
// })();