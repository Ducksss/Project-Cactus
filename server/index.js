// Load Environment variable
require('dotenv').config();

// Express App
const express = require('express');
const predict = require('./api/predict');
const app = express();

//Middleware for data parsing and stored into req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post('/predict', (req,res)=>{
    let sentences = req.body.sentences? req.body.sentences: [];

    // Return 404 if no sentences are queried
    if (sentences.length == 0){
        return res.status(404).send("Sentences Not Found!");
    }

    // Query Google ML Product API for prediction
    predict.getPredictions((sentences))
            .then((result)=>{
                let predictions = result.predictions;
                res.send(predictions);
            }).catch((err)=>{
                res.status(500).send(err.message);
            });
});

app.listen(process.env.port||8080, () => {
  console.log(`App listening at http://localhost:${process.env.port}`);
});