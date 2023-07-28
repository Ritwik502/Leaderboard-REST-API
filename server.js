const express = require("express");
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

// Database Connection Info
const MongoClient = require("mongodb").MongoClient;

const url = "mongodb://ritwik502:UFH2kuTJbTviX23v@ac-wdzobjo-shard-00-00.vo3jy2i.mongodb.net:27017,ac-wdzobjo-shard-00-01.vo3jy2i.mongodb.net:27017,ac-wdzobjo-shard-00-02.vo3jy2i.mongodb.net:27017/?ssl=true&replicaSet=atlas-cq22mr-shard-0&authSource=admin&retryWrites=true&w=majority";
app.get("/", function(req, res) {
    res.send("Word Game Leaderboard API!");
});

let db;
// Connect to the database with [url]
(async () => {
   let client = await MongoClient.connect(
       url,
       { useNewUrlParser: true }
   );

   db = client.db("Players");

   app.listen(PORT, async function() {
       console.log(`Listening on Port ${PORT}`);
       if (db) {
           console.log("Database is Connected!");
       }
   });
})();

// Route to create new player
app.post("/players", async function(req, res) {
    // get information of player from POST body data
    let { username, score } = req.body;
 
    // check if the username and score pair already exists
    const alreadyExisting = await db
        .collection("players")
        .findOne({ username: username, score:score });
 
    if (alreadyExisting) {
        res.send({ status: false, msg: "player username and score already exists" });
    } else {
        // create the new player
        await db.collection("players").insertOne({ username, score });
        console.log(`Created Player ${username} - ${score} `);
        res.send({ status: true, msg: "player created" });
    }
 });

 app.put("/players", async function(req, res) {
    let { username, score } = req.body;
    // check if the username already exists
    const alreadyExisting = await db
        .collection("players")
        .findOne({ username: username });
    if (alreadyExisting) {
        // Update player object with the username
        await db
            .collection("players")
            .updateOne({ username }, { $set: { username, score } });
        console.log(`Player ${username} score updated to ${score}`);
        res.send({ status: true, msg: "player score updated" });
    } else {
        res.send({ status: false, msg: "player username not found" });
    }
 });

 // delete player
app.delete("/players", async function(req, res) {
    let { username, score } = req.body;
    // check if the username already exists
    const alreadyExisting = await db
        .collection("players")
        .findOne({ username: username, score:score });
 
    if (alreadyExisting) {
        await db.collection("players").deleteOne({ username,score });
        console.log(`Player ${username} - ${score} deleted`);
        res.send({ status: true, msg: "player deleted" });
    } else {
        res.send({ status: false, msg: "username not found" });
    }
 });


 
// Access the leaderboard
app.get("/players", async function(req, res) {
    // retrieve ‘lim’ from the query string info
    try{
        let lim = parseInt(req.query.lim);
        let col=db.collection("players")
        let data=await col.find().sort({ "score": -1 }).limit(lim).toArray();
        res.json(data);
    }catch(err){
        console.error('Error occurred:', err);
        res.status(500).json({ error: 'An error occurred' });
    }


        // .find()
        // -1 is for descending and 1 is for ascending
        // .sort({ "score": -1 })
        // Show only [lim] players
        // .limit(lim)
        // .toArray(function(err, result) {
        //     console.log("entered"); 
        //     if (err)
        //         res.send({ status: false, msg: "failed to retrieve players" });
        //     console.log(Array.from(result));
        //     res.send({ status: true, msg: result });
        // });
        // res.send({ status: true, msg: "dcdce" });

 });