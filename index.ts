import express, { Express, Request, Response } from "express";
import ejs from "ejs";
import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

const app: Express = express();
const jsonConfigs = new Map();

app.set('view engine', 'ejs');

const jsonFiles = fs.readdirSync("./views/client/configs").filter(file => file.endsWith(".json"));

for (const file of jsonFiles) {
    const fileName = file.split(".")[0];

    var conf = JSON.parse(fs.readFileSync('./views/client/configs/' + file, 'utf8'));
    jsonConfigs.set(fileName, conf);
}

app.get("/", (req: Request, res: Response) => {
    res.render("client/index", {data: jsonConfigs});
});

app.get("/manifest.json", (req: Request, res: Response) => {
    res.sendFile(__dirname + "/views/client/manifest.json");
});

app.use("/assets", express.static("public/assets"));

app.listen(310, () => {
    console.log("[server]: Server is running.");
});