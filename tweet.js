var Twit = require('twit');
var T = new Twit({
  consumer_key:         process.env.CONSUMER_KEY,
  consumer_secret:      process.env.CONSUMER_SECRET,
  access_token:         process.env.ACCESS_TOKEN,
  access_token_secret:  process.env.ACCESS_TOKEN_SECRET,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  strictSSL:            true,     // optional - requires SSL certificates to be valid.
})


module.exports.tweet = function tweet(options, index, tweets) {
  T.post('statuses/update', options, function(err, data, response) {
    console.log('Done for the day, good night :D', data.created_at);
    // console.error(err);
    index++;
    if (index < tweets.length) {
      options = { status: tweets[index], in_reply_to_status_id: data.id_str };
      tweet(options, index, tweets);
    }
  });
};
