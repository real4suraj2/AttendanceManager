const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const uri = 'southeastasia.api.cognitive.microsoft.com';
const key = 'YOUR COGNITIVE SERVICES API KEY';
const facelist_id = 'class-3e-facelist';

const options = {
  baseURL: `https://${uri}/face/v1.0`,
  timeout: 1000,
  headers: {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': key
  }
};

app.get("/create-facelist", async (req, res) => {
  try {
    const instance = { ...options };
    const response = await instance.put(
      `/facelists/${facelist_id}`,
      {
        name: "Classroom 3-E Facelist"
      }
    );

    console.log("created facelist: ", response.data);
    res.send('ok');

  } catch (err) {
    console.log("error creating facelist: ", err);
    res.send('not ok');
  }
});


app.get("/add-face", async (req, res) => {
  try {
    const instance_options = { ...options };
    instance_options.headers['Content-Type'] = 'application/octet-stream';
    const instance = axios.create(instance_options);

    const file_contents = fs.readFileSync('./path/to/selfie.png');

    const response = await instance.post(
      `/facelists/${facelist_id}/persistedFaces`,
      file_contents
    );

    console.log('added face: ', response.data);
    res.send('ok');

  } catch (err) {
    console.log("err: ", err);
    res.send('not ok');
  }
});

const PORT = 3000;
app.listen(PORT, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Running on ports ${PORT}`);
  }
});