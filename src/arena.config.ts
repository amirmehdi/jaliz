import Arena from "@colyseus/arena";
import {monitor} from "@colyseus/monitor";
import winston from "winston"
import * as express from "express"
/**
 * Import your Room files
 */
import {JalizRoom} from "./jaliz";
import * as path from "path";

export default Arena({
    getId: () => "Your Colyseus App",

    initializeGameServer: (gameServer) => {

        if (process.env.NODE_ENV !== "production") {
            // simulate 200ms latency between server and client.
            gameServer.simulateLatency(200);
        }
        gameServer.define('jaliz', JalizRoom);

    },

    initializeExpress: (app) => {
        const publicDirectoryPath = path.join(__dirname, '../public')
        app.use(express.static(publicDirectoryPath))

        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: {service: 'user-service'},
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.File({filename: 'error.log', level: 'error'}),
        new winston.transports.File({filename: 'combined.log'}),
    ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}
