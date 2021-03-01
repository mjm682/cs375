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
        res.status(200);
    }).catch(function (error) {
        console.log(error);
        return res.sendStatus(500);
    });
});
app.get("/result", function(req, res) {
    console.log("result");
    return res.status(200).send("");
});

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});