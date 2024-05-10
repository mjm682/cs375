const dotenv = require('dotenv');
dotenv.config();
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

const express = require("express");
const app = express();
let request = require('request');

let favicon = require('serve-favicon');
app.use(favicon(__dirname + '/favicon/favicon-32x32.png'));

let axios = require("axios");
let querystring = require('querystring');

let redirect_uri = 'http://localhost:3000/search.html'; 

let searchedArtist = '';
let searchedFollowers = '';
let searchedGenre = '';
let searchedURI = '';
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
  let code = req.query.code || null;
  let artist = req.query.artist;
  console.log("Auth Code: " + code);
  let authOptions = {
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

      let access_token = body.access_token;
      console.log("Acces Token: " + access_token);

      let options = {
        url: `https://api.spotify.com/v1/search?q=${artist}&type=artist`,
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
      };

      axios.get(`https://api.spotify.com/v1/search?q=${artist}&type=artist`, options).then(function (response){
        console.log(`Searching for ${artist}`);
        searchedArtist = response.data.artists.items[0].name;
        searchedFollowers = response.data.artists.items[0].followers.total;
        searchedGenre = response.data.artists.items[0].genres[0];
        searchedURI = response.data.artists.items[0].id;
		    searchedPopularity = response.data.artists.items[0].popularity;

        if (response.data.artists.items[0].images[0] === undefined){
          searchedURL = 'default.jpg';
        }
        else{
          searchedURL = response.data.artists.items[0].images[0].url;
        }

        if (searchedGenre === undefined){
          searchedGenre = "Unknown";
        }

        let relatedURL = 'https://api.spotify.com/v1/artists/' + searchedURI + '/related-artists';

        return axios.get(relatedURL, options);
        res.status(200).json(newJSON);
  }).then(function (response){

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
