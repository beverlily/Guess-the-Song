const request = require("request");
const bodyParser = require('body-parser');
const express = require("express");
const app = express();

app.use(bodyParser.json());
app.use("/", express.static(__dirname + '/'));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

//Referenced: https://developer.spotify.com/documentation/web-api/quick-start/
//Referenced: https://developer.spotify.com/documentation/general/guides/authorization-guide/#client-credentials-flow

//Referenced: https://github.com/spotify/web-api-auth-examples/blob/master/client_credentials/app.js
app.post("/musix/spotify", (req, res) => {
    const client_id = "";
    const client_secret = "";
    const token = new Buffer(`${client_id}:${client_secret}`).toString('base64');
    const url = 'https://accounts.spotify.com/api/token';
    // your application requests authorization
    const authOptions = {
        url: url,
        headers: {
            'Authorization': `Basic ${token}`
        },
        form: {
            grant_type: 'client_credentials'
        },
        json: true
    };

    request.post(authOptions, (error, response, body) => {
        if (error) {
            res.status(400).send("Error generating token");
        }
        if (response.statusCode === 200) {
            res.send({"access_token": body.access_token});
        }
    })
});

const port = process.env.PORT || 8888;
app.listen(port, () => {
    console.log("Listening on port: " + port);
})
