import express from 'express'
import usersService from '../services/users.service'
import * as argon2 from 'argon2'

import debug from 'debug'
import {statusCodes} from '../../common/http.status'

const log: debug.IDebugger = debug('app:users-controller')
const passwordHash = require('password-hash')
class UsersController {
    async listUsers(req: express.Request, res: express.Response){
        const users = await usersService.list(100,0)
        res.status(statusCodes.HttpStatus_OK.value).send(users)
    }

    async getUserById(req: express.Request, res: express.Response){
        log(`User input ${req.body}`)
        const user = await usersService.readById(req.body.id)
        res.status(statusCodes.HttpStatus_OK.value).send(user)
    }

    async createUser(req: express.Request, res: express.Response){
        req.body.password = await argon2.hash(req.body.password) 
        log(req.body.password)

        const userId = await usersService.create(req.body)
        res.status(statusCodes.HttpStatus_CREATED.value).send({ id: userId })
    }

    async patch(req: express.Request, res: express.Response) {
        if (req.body.password) {
            req.body.password = await argon2.hash(req.body.password) 
            log(req.body.password)
        }
        log(await usersService.patchById(req.body.id, req.body)) 
        res.status(statusCodes.HttpStatus_NO_CONTENT.value).send() 
    }

    async put(req: express.Request, res: express.Response) {
        req.body.password = await argon2.hash(req.body.password) 
        log(await usersService.putById(req.body.id, req.body)) 
        res.status(statusCodes.HttpStatus_NO_CONTENT.value).send() 
    }

    async removeUser(req: express.Request, res: express.Response) {
        log(await usersService.deleteByUsingId(req.body.id)) 
        res.status(statusCodes.HttpStatus_NO_CONTENT.value).send()
    }

    
}

export default new UsersController()