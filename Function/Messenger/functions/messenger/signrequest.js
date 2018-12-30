const base64url = require("base64url");
const crypto = require("crypto");


module.exports = parse_signed_request;
function parse_signed_request(signed_request, secret) {
  const encoded_data = signed_request.split(".", 2);
  // decode the data
  const sig = encoded_data[0];
  const json = base64url.decode(encoded_data[1]);
  const data = JSON.parse(json); // ERROR Occurs Here!

  // check algorithm - not relevant to error
  if (!data.algorithm || data.algorithm.toUpperCase() !== "HMAC-SHA256") {
    console.error("Unknown algorithm. Expected HMAC-SHA256");
    return null;
  }

  // check sig - not relevant to error
  expected_sig = crypto
    .createHmac("sha256", secret)
    .update(encoded_data[1])
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace("=", "");
  if (sig !== expected_sig) {
    console.error("Bad signed JSON Signature!");
    return null;
  }

  return data;
}