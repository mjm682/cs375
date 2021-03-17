const express = require("express");
const app = express();

let axios = require("axios");
let env = require("./env.json");
let token = env["token"];

const port = 3000;
const hostname = "localhost";

app.use(express.json());
app.use(express.static("public_html"));

let config = {
    headers: { Authorization: `Bearer ${token}` }
};

app.get("/search", function(req, res) {
    let artist = req.query.artist;
    console.log(artist);
    axios.get(`https://api.spotify.com/v1/search?q=${artist}&type=artist`, config).then(function (response){
        console.log(`Searching for artist ${artist}`);
        console.log(response.data.artists.items);
        let artistName = response.data.artists.items[0].name;
        let followers = response.data.artists.items[0].followers.total;
        let genre = response.data.artists.items[0].genres[0];
        let imageURL = response.data.artists.items[0].images[0].url;
        let URI = response.data.artists.items[0].id;

        let newJSON = {"name" : artistName, "followers": followers, "genre": genre, "imageURL": imageURL, "uri": URI};
        console.log(newJSON);
        res.status(200).json(newJSON);
    }).catch(function (error) {
        console.log(error);
        return res.sendStatus(500);
    });
});

app.get("/related", function(req, res) {
    let uri = req.query.uri;
    console.log(uri);
    let spotifyURL ='https://api.spotify.com/v1/artists/' + uri + '/related-artists';
    axios.get(spotifyURL, config).then(function (response){
        console.log(response.data);
        let artistName = response.data.artists[0].name;

        let newJSON = {};
        let artists = [];
        
        for(let i = 0; i < 20; i++){
            let artistName = response.data.artists[i].name;
            let followers = response.data.artists[i].followers.total;
            let genre = response.data.artists[i].genres[0];
            let imageURL = response.data.artists[i].images[0].url;
            let URI = response.data.artists[i].id;
            console.log(imageURL);
            
            console.log(artistName);
            console.log(followers);
            console.log(genre);
            console.log(URI);
            
            artistInfo = {"name" : artistName, "followers": followers, "genre": genre, "imageURL": imageURL, "uri": URI}
            artists[i] = artistInfo;
        }
        newJSON = artists;

        
        //console.log(newJSON);
        res.status(200).json(newJSON);
    }).catch(function (error){
        console.log(error);
        res.status(500);
    })
})

app.get("/result", function(req, res) {
    console.log("result");
    return res.status(200).send("");
});

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});
