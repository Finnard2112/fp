const http = require("http");
const path = require("path");
const express = require("express");   /* Accessing express module */
const fs = require("fs");
const app = express();  /* app is a request handler function */
const bodyParser = require("body-parser"); /* To handle post parameters */
require("dotenv").config({ path: path.resolve(__dirname, '.env') }) 

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://notmyemail2003:Innotorious123@finalproject.mrzuf.mongodb.net/?retryWrites=true&w=majority&appName=FinalProject";


const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection:process.env.MONGO_COLLECTION};

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function insertHighScore(client, databaseAndCollection, highScore) {
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(highScore);

    console.log(`HighScore entry created with id ${result.insertedId}`);
}

async function getHighScores(client, databaseAndCollection) {
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).find({}).toArray();
    return result
}

/* view/templating engine */
app.set("view engine", "ejs");

/* directory where templates will reside */
app.set("views", path.resolve(__dirname, "templates"));

app.use(express.static('public'));

const portNumber = 5000;

app.use(bodyParser.urlencoded({extended:false}));

app.get("/", async (request, response) => {
    try{
        let table = "";
        await client.connect();
        let highscores = await getHighScores(client, databaseAndCollection);
        if (highscores.length > 0) {
            highscores.forEach((highscore) => {
              table += `<tr> <td>${highscore.name}</td> <td>${highscore.score}</td></tr>`
            });
            table = `<table border="1"><thead><tr><th>Name</th><th>Score</th></tr></thead>` + "<tbody>" + table + "</tbody>" + "</table>"
          } 
        const variables = {
            table: table
        };
        response.render('index', variables);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

app.get("/score", (request, response) => {
    response.render('score');
  });

app.post("/score", async (request, response) => {

    try {
        await client.connect();

        let {name, score} =  request.body;

        let highScore = {name: name, score: score};
    
        await insertHighScore(client, databaseAndCollection, highScore);
        response.render('score');
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    
});


app.listen(portNumber);