const express = require("express");
const app = express();

let axios = require("axios");
var querystring = require('querystring');

var client_id = 'b0e5f1805df1454daa59e96c976dc66d'; // Your client id
var client_secret = '5c027ea2b9bd4e3095f718ddce2ec43d'; // Your secret
var redirect_uri = 'http://localhost:3000/search.html'; // Your redirect uri

const port = 3000;
const hostname = "localhost";

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};
  
var stateKey = 'spotify_auth_state';

app.use(express.json());
app.use(express.static("public_html"));

app.get('/login', function(req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);
  
    // your application requests authorization
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        redirect_uri: redirect_uri,
        state: state
      }));
  });

app.get("/search", function(req, res) {

  let artist = req.query.artist;
  let access_token = req.query.access_token;
  console.log("Artist:" + artist);
  console.log("Token = " + access_token);

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  console.log(code);
  console.log(state);
  console.log(storedState);

  let config = {
      headers: { Authorization: `Bearer ${access_token}` }
  };

  axios.get(`https://api.spotify.com/v1/search?q=${artist}&type=artist`, config).then(function (response){
      console.log(`Searching for artist ${artist}`);
      console.log(response.data.artists.items);
      let artistName = response.data.artists.items[0].name;
      let followers = response.data.artists.items[0].followers.total;
      let genre = response.data.artists.items[0].genres[0];
      let artistURI = response.data.artists.items[0].uri;
      
      let newJSON = {"name" : artistName, "followers": followers, "genre": genre, "uri": artistURI};
      console.log(newJSON);
      res.status(200).json(newJSON);
  }).catch(function (error) {
      console.log(error);
      return res.sendStatus(500);
  });
});

app.get("/result", function(req, res) {
    console.log("result");
    return res.status(200).send("");
});

app.get('/refresh_token', function(req, res) {

    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };
  
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        res.send({
          'access_token': access_token
        });
      }
    });
  });

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});
