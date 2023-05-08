import { createWriteStream, WriteStream } from "fs";

/**
 * Class for loggin object. See below
 */
class GameLogger {

    private logFile: WriteStream | undefined;
    
    /**
     * Log some data to the log file. If you call it with `msg`, it appends
     * `"timestamp msg"` to the log file, where `timestamp` is the current date
     * and time.
     * @param msg The message you want to log
     */
    public log(msg: string) {
        if (!this.logFile || !this.logFile.writable)
            return;
        
        const date = new Date();
        this.logFile.write(date.toLocaleString() + " - " + msg + "\r\n");
    }

    /**
     * Serializes a Map object and logs it by calling this.log()
     * @param map The Map<any, any> object you want to log.
     */
    public logMap(map: Map<any, any>) {
        this.log(JSON.stringify(Object.fromEntries(map)));
    }
    
    /**
     * Set the target file for logging. Object won't be in a valid state until
     * you call this method with a good path. If the file already exists, it
     * will simply append to the end.
     * @param file The file you want to write to
     */
    public setTargetFile(file: string) {
        this.logFile = createWriteStream(file, { flags: "a" });
    }
}

/**
 * A Loggin singleton object. First, one should set a file to log to using the
 * `gamelogger.setTargetFile(string)` method. After that, you can call
 * `gamelogger.log(string)`, or `gamelogger.logMap(Map<any, any>)` to log data.
 * It will add timestamps for each logged message.
 */
const gamelogger = new GameLogger();
export default gamelogger;