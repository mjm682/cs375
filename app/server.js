const express = require("express");
const app = express();
var request = require('request'); // "Request" library

var favicon = require('serve-favicon');
app.use(favicon(__dirname + '/favicon/favicon-32x32.png'));

let axios = require("axios");
var querystring = require('querystring');

var client_id = 'b0e5f1805df1454daa59e96c976dc66d'; // Your client id
var client_secret = '5c027ea2b9bd4e3095f718ddce2ec43d'; // Your secret
var redirect_uri = 'http://localhost:3000/search.html'; // Your redirect uri

var searchedArtist = '';
var searchedFollowers = '';
var searchedGenre = '';
var searchedURI = '';
let searchedURL = '';

const port = 3000;
const hostname = "localhost";
  
app.use(express.json());
app.use(express.static("public_html"));

app.get('/login', function(req, res) {
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        redirect_uri: redirect_uri,
      }));
  });

app.get('/search', function(req, res) { 
  var code = req.query.code || null;
  let artist = req.query.artist;
  console.log("code: " + code);
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    console.log(response.statusCode);
    if (!error) {

      var access_token = body.access_token,
          refresh_token = body.refresh_token;
        console.log("access token = " + access_token);
        console.log("refresh token = " + refresh_token);

      var options = {
        url: `https://api.spotify.com/v1/search?q=${artist}&type=artist`,
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
      };

      console.log("Artist:" + artist);
      console.log("Token = " + access_token);
      //console.log(`Searching for artist ${artist}`);

      axios.get(`https://api.spotify.com/v1/search?q=${artist}&type=artist`, options).then(function (response){
        console.log(`Searching for artist ${artist}`);
        console.log(response.data.artists.items);
        searchedArtist = response.data.artists.items[0].name;
        searchedFollowers = response.data.artists.items[0].followers.total;
        searchedGenre = response.data.artists.items[0].genres[0];
        searchedURI = response.data.artists.items[0].id;
        searchedURL = response.data.artists.items[0].images[0].url;
		    searchedPopularity = response.data.artists.items[0].popularity;

        if (searchedGenre === undefined){
          searchedGenre = "Unknown";
        }
        
        //let newJSON = {"name" : artistName, "followers": followers, "genre": genre, "imageURL": imageURL, "uri": uri};
        //console.log(newJSON);
        //res.status(200).json(newJSON);
        let relatedURL = 'https://api.spotify.com/v1/artists/' + searchedURI + '/related-artists';
        //let relatedArtists = await axios.get(relatedURL);
        
          console.log(access_token);
          console.log(searchedArtist);
        return axios.get(relatedURL, options);
        console.log(response);
        console.log(newJSON);
        res.status(200).json(newJSON);
  }).then(function (response){
      console.log(response.data);
      // let artistName = response.data.artists[0].name;

      let newJSON = {}
      let artists = [];
      
      let rel_len = (response.data.artists).length;
      console.log("Found " +rel_len+ " related artists.");
      if(rel_len > 20){rel_len = 20;}
      
      if(rel_len !=0){
        for(let i = 0; i < rel_len; i++){
            let artistName = response.data.artists[i].name;
            let followers = response.data.artists[i].followers.total;
            let genre = response.data.artists[i].genres[0];
            let imageURL = '';
            let popularity = response.data.artists[i].popularity;

            if (typeof response.data.artists[i].images[0] == 'undefined'){
                imageURL = '../default.jpg';
            } else {
                imageURL = response.data.artists[i].images[0].url;
            }

            if (genre === "undefined"){
              genre = "Unknown";
            } else {
              genre = response.data.artists[i].genres[0];; 
            }   

            let URI = response.data.artists[i].id;
            
            console.log(imageURL);
            console.log(artistName);
            console.log(followers);
            console.log(genre);
            console.log(URI);
            console.log(popularity);
            
            searchedArtistInfo = {"name" : searchedArtist, "followers": searchedFollowers, "genre": searchedGenre, "imageURL": searchedURL, "uri": searchedURI, "popularity": popularity};
            artistInfo = {"name" : artistName, "followers": followers, "genre": genre, "imageURL": imageURL, "uri": URI, "popularity": popularity}
            artists[0] = searchedArtistInfo;
            artists[i+1] = artistInfo;
        }
      }
      else{
        searchedArtistInfo = {"name" : searchedArtist, "followers": searchedFollowers, "genre": searchedGenre, "imageURL": searchedURL, "uri": searchedURI, "popularity": searchedPopularity};
        artists[0] = searchedArtistInfo;
      }
      newJSON = artists;
      console.log(newJSON);
    res.status(200).json(newJSON);
  }).catch(function (error) {
      console.log(error);
      return res.sendStatus(500);
  });
    } 
    else{
      console.log("error: " + error);
    }
  });
});


app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});
