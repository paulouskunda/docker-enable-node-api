import dotenv from 'dotenv'

import express from 'express'
import * as http from 'http'

import * as winston from 'winston'
import * as expressWinston from 'express-winston'
import cors from 'cors'
import {CommonRoutesConfig} from './common/common.routes.config'
import {UserRoutes} from './users/users.routes.config'
import { AuthRoutes } from './auth/auth.routes.config'
import debug from 'debug'
const dotEnvResult = dotenv.config()

const app: express.Application = express()
const server: http.Server = http.createServer(app)
const port = 3000
const routes: Array<CommonRoutesConfig> = []
const debugLog: debug.IDebugger = debug('app')


app.use(express.json())

app.use(cors())

const loggerOptions: expressWinston.LoggerOptions = {
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.json(),
        winston.format.prettyPrint(),
        winston.format.colorize({all: true})
    ),

}

if(dotEnvResult.error){
    throw dotEnvResult.error
}

if(!process.env.DEBUG){
    loggerOptions.meta = false
}

app.use(expressWinston.logger(loggerOptions))

routes.push(new AuthRoutes(app))
routes.push(new UserRoutes(app))

const runMessage =  `Server running at http://localhost:${port}`

app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send(runMessage)
})


server.listen(port, () => {
    routes.forEach((routes: CommonRoutesConfig) => {
        debugLog(`Routes  configured for ${routes.getName}`)
    })

    console.log(runMessage)
})