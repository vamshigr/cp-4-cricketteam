const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: "./cricketTeam.db",
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
app.get("/players", async (req, res) => {
  try {
    const getAllPlayers = `SELECT * FROM cricket_team;`;
    const playersArray = await db.all(getAllPlayers);
    const response = playersArray.map((player) => {
      return {
        playerId: player.player_id,
        playerName: player.player_name,
        jerseyNumber: player.jersey_number,
        role: player.role,
      };
    });

    res.send(response);
  } catch (error) {
    console.error("Error retrieving players:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/players", async (req, res) => {
  try {
    const { playerName, jerseyNumber, role } = req.body;
    console.log(playerName, jerseyNumber, role);
    const addPlayersQuery = `Insert into cricket_team(player_name, jersey_number, role)
         values('${playerName}', ${jerseyNumber}, '${role}' )`;

    await db.run(addPlayersQuery);
    res.send("Player Added to Team");
  } catch (error) {
    console.log(error);
  }
});

app.get("/players/:playerId", async (req, res) => {
  try {
    const { playerId } = req.params;
    console.log(playerId);
    const playersQuery = `select * from cricket_team where player_id = ${playerId};`;
    const response = await db.get(playersQuery);
    const playerRes = (player) => {
      return {
        playerId: player.player_id,
        playerName: player.player_name,
        jerseyNumber: player.jersey_number,
        role: player.role,
      };
    };

    res.send(playerRes(response));
  } catch (error) {
    console.log(error);
  }
});

app.put("/players/:playerId/", async (req, res) => {
  try {
    const { playerId } = req.params;
    const { playerName, jerseyNumber, role } = req.body;
    const playersQuery = `update cricket_team set player_name="${playerName}", jersey_number=${jerseyNumber}, role="${role}" where player_id=${playerId};`;
    await db.run(playersQuery);
    res.send("Player Details Updated");
  } catch (error) {
    console.log(error);
  }
});

app.delete("/players/:playerId/", async (req, res) => {
  try {
    const { playerId } = req.params;
    const playersQuery = `Delete from cricket_team where player_id=${playerId}`;
    await db.run(playersQuery);
    res.send("Player Removed");
  } catch (error) {
    console.log(error);
  }
});

module.exports = app;
