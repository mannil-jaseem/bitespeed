import "reflect-metadata";
import express from "express"
import cluster, { Worker } from "cluster"
import { cpus } from "os"
import { useExpressServer } from "routing-controllers"
import "./controller/ContactController";
import morgan from "morgan"


if (cluster.isPrimary) {
    let numCpus = cpus().length
    for (let i = 0; i < numCpus; i++) {
        cluster.fork()
    }
    cluster.on('exit', (worker: Worker, code) => {
        console.log(`Worker ${worker.process.pid} exited with code ${code}`);
        console.log('Fork new worker!');
        cluster.fork();
    });
} else {
    const app = express()
    const port = 3000
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    useExpressServer(app)
    app.use(morgan("dev"))

    app.listen(port, () => {
        console.log(`listening to port ${port}`)
    })

    app.on("error", (error: any) => {
        var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
        if (error.syscall !== 'listen') throw error;
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                console.error(error);
        }
    })
}