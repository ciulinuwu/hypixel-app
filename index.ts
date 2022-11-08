import express, { Express, NextFunction, Request, Response } from "express";
import bodyparser from "body-parser";
import ejs from "ejs";
import fetch from 'node-fetch';
import path from 'path';
import { Client as HypixelClient } from "@zikeji/hypixel";

const __dirname = path.resolve();

const app: Express = express();

app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded());

import statsProFields from './views/client/pages/stats_profile.json';
import jcredits from './views/client/pages/credits.json';

function authenticate(req: Request, res: Response, next: NextFunction): void {
    const h = req.headers;
    if (h["x-hypixel-client"] || h["x-hypixel-api-key"]) {
        next();
    } else {
        res.status(403).json({});
    }
}

app.get("/", (req: Request, res: Response) => {
    res.render("client/index", {data: {statsProFields: statsProFields, jcredits: jcredits}});
});

app.get("/manifest.json", (req: Request, res: Response) => {
    res.sendFile(__dirname + "/views/client/manifest.json");
});

app.get("/204", (req: Request, res: Response) => {
    res.sendStatus(204);
});

app.use("/assets", express.static("public/assets"));

app.post("/api", authenticate, async (req: Request, res: Response) => {
    var APIKEY = req.headers["x-hypixel-api-key"];
    try {
        const f_uuid:any = await fetch("https://api.mojang.com/users/profiles/minecraft/" + req.body.uuid).then(r => r.json());
        try {
            const client = new HypixelClient(APIKEY as string);
            try {
                const data = await client.player.uuid(f_uuid.id);
                res.status(200).json(data);
            } catch(err) {
                res.status(400).send("3");
            }
        } catch (err) {
            res.status(400).send("2");
        }
    } catch(err) {
        res.status(400).send("3");
    }
});

app.listen(310, () => {
    console.log("[server]: Server is running.");
});