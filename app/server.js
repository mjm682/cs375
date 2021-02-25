const express = require("express");
const app = express();

const port = 3000;
const hostname = "localhost";

app.use(express.json());
app.use(express.static("public_html"));

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});