import * as http from 'http';
import express, { Express } from 'express';
import * as ws from 'ws';


/**
 * This class encapsulates both the `express` server as well as the `ws`
 * websocket server. `ServerListener` objects will be able to subscribe to
 * specific messages, such that the server forwards these to them.
 * 
 * Pretty much all server responses etc are handled by `ServerListener` (see
 * description of this interface below).
 */
export default class Server {

    // server constituents:
    private http_server: http.Server
    private express: Express;
    private wss: ws.WebSocketServer;

    // A lookup table associating routes with subscribed listeners:
    private routeMap: Map<string, ServerListener>;


    /**
     * Constructor. Sets up the infrastructure for servering clients.
     */
    constructor() {

        this.express = express();
        this.http_server = http.createServer(this.express);
        this.wss = new ws.WebSocketServer({ server: this.http_server });

        // static files should go here!
        this.express.use(express.static("static"));
        
        this.routeMap = new Map<string, ServerListener>();

        this.wss.on("connection", (socket: ws.WebSocket) => {
            const route = socket.protocol;

            const route_val = this.routeMap.get(route);
            if (route_val) {
                route_val.add_websocket(socket);
                return;
            }

            // No valid route, so closing:
            socket.close(1003, `Please specify 1 valid protocol. "${route}" is invalid.`);
        })
    }

    /**
     * Allows a server listener to be added to the server. After this is done:
     * * HTTP GET requests with route `route` will invoke the `express_get()`
     * method of `listener`;
     * * New websocket connections with `route` as `protocol` attribute
     * (minus '/') will invoke the `add_websocket()` method of `listener`. This
     * method takes the socket as argument, meaning that `listener` has full
     * control over it. **IMPORTANT:** it should definitely set `socket.onclose`.
     * And possibly also `socket.onmessage`.
     * @param route The route to subscribe to. Should always start with a forward
     * slash, followed by a valid path string, so "/x", where 'x' is any string.
     * After that, "x.com/x" will redirect to the `ServerListener.express_get()`
     * method, and specifying "x" as protocol will call
     * `ServerListener.add_websocket()` with that websocket.
     * @param listener The listener to add as subscriber.
     */
    public addServerListener(route: Route, listener: ServerListener): void {
        if (this.routeMap.has(route)) {
            console.warn(`The route "${route}" was already added. Ignoring.`);
            return;
        }

        // Apparently protocols cannot start with '/', so taking substring.
        this.routeMap.set(route.substring(1), listener);

        this.express.get(route, (req, res) => {
            listener.express_get(req, res);
        })
    }

    /**
     * Add a redirect to the default ("/") route.
     * @param route The route to redirect the player to
     */
    public setDefaultRoute(route: `/${string}`) {
        this.express.get("/", (req, res) => {
            res.redirect(route);
        })
    }

    /**
     * Makes the server listen. Function does not ever return, so should be
     * called last, of course :-p
     * @param port The port number to listen on.
     */
    public listen(port: number): void {
        this.http_server.listen(port);
    }

}

// Route should always start with a forward slash:
type Route = `/${string}`;

/**
 * An interface that should be implemented by any class/object that wants to
 * be able to interact with the `Server` object.
 */
export interface ServerListener {

    /**
     * A method that gets invoked by `Server` whenever it receives a GET
     * request with as route that this listener is subscribed to
     * @param req The `Request` object gotten from the `express.get()` callback.
     * @param res The `Response` object gotten from the `express.get()` callback.
     * This object can be used to send a reply, with res.send();
     */
    express_get(req: express.Request, res: express.Response): void;

    /**
     * A method that gets called whenever a new socket connects to the server
     * that has as `Socket.protocol` attribute the specific `route` this
     * listener subscribed itself to in the
     * `Server.addServerListener(route, ...)` method.
     * @param socket The newly connected socket. The listener is responsible for:
     * * Keeping a data structure containing all the added sockets;
     * * Setting an on-closed listener to this socket (`socket.onclose`)
     * that makes sure the socket is removed properly from the listener;
     * * Setting a callback response (`socket.onmessage`) that gets
     * called whenever the socket sends a message. This last step is not always
     * needed.
     */
    add_websocket(socket: ws.WebSocket): void;

}