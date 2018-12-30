const parse_signed_request = require("./signrequest");
const fs = require("fs");
const config = JSON.parse(fs.readFileSync("config.json"));

const { MessengerClient } = require("messaging-api-messenger");

const client = MessengerClient.connect(config.PAGE_ACCESS_TOKEN);

client.sendNotifi = function(psid, title, message) {
  client.sendGenericTemplate(
    psid,
    [
      {
        title: title,
        subtitle: message
      }
    ],
    { image_aspect_ratio: "square" }
  );
};

module.exports = {
    parse_signed_request,
    sendAPI:client
}