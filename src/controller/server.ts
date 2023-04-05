import * as http from 'http';
import express, {Express} from 'express';
import * as ws from 'ws';

import fs from 'fs'; // TODO remove

// For test:
const connection_list: ws.WebSocket[] = [];


/**
 * This class encapsulates both the `express` server as well as the `ws`
 * websocket server. `ServerListener` objects will be able to subscribe to
 * specific messages, such that the server forwards these to them.
 */
export default class Server {

    private http_server: http.Server
    private express: Express;
    private wss: ws.WebSocketServer;
    
    constructor() {

        this.express = express();
        this.http_server = http.createServer(this.express);
        this.wss = new ws.WebSocketServer({ server: this.http_server });

        // Testing stuff; will be deleted:
        this.express.get("/", (_, res) => res.send(fs.readFileSync("./test.html", "utf-8")))

        this.wss.on("connection", (ws) => {

            connection_list.push(ws);

            console.log("Today I made a new friend!!!!");
            ws.send("Will you be my friend?");
            
            ws.on("message", (msg: string) => {
                console.log("Got the following message from a client: ", JSON.parse(msg));
                ws.send(`Cool message! :-D -- I have ${connection_list.length} friends btw ;-)`);
            })

            ws.on("close", (code, reason) => {
                const idx = connection_list.indexOf(ws);
                connection_list.splice(idx, 1);
            })

        })
    }

    public listen() {
        this.http_server.listen(8080);
    }

}