import express from 'express'
import userService from '../services/users.service'
import debug from 'debug'
import { statusCodes } from '../../common/http.status'

const log: debug.IDebugger = debug('app:users-controller')
class UsersMiddleware {

    async validateRequiredUserBodyFields(
        req: express.Request,
        res: express.Response, 
        next:express.NextFunction){
        if(req.body && req.body.email && req.body.password){
            next()
        }else{
            res.status(statusCodes.HttpStatus_BAD_REQUEST.value).send({errror: "Missing required fields email and password"})
        }
    }

    async validateSameEmailDoesntExist(
        req: express.Request,
        res: express.Response, 
        next:express.NextFunction
    ){
            const user = await userService.getUserByEmail(req.body.email)
            if(user){
                res.status(statusCodes.HttpStatus_BAD_REQUEST.value).send({ error: "User email already exists"})
            }else{
                next()
            }
    }

    async validateSameEmailBelongToSameUser(
        req: express.Request,
        res: express.Response, 
        next:express.NextFunction
    ){
        const user = await userService.getUserByEmail(req.body.email)
        if(user && user.id === req.params.userId){
            next()
        }else{
            res.status(statusCodes.HttpStatus_BAD_REQUEST.value).send({ error: "Invalid Email" })
        }
    }


    validatePatchEmail = async (
        req: express.Request,
        res: express.Response, 
        next:express.NextFunction) => {
            if(req.body.email){
                log('Validate email', req.body.email)
                
                this.validateSameEmailBelongToSameUser(req, res, next)
            }else{
                next()
            }
    }

    async validateUserExists(
        req: express.Request,
        res: express.Response, 
        next:express.NextFunction
    ){
        const user = await userService.readById(req.params.userId)
        if(user){
            next()
        }else{
            res.status(statusCodes.HttpStatus_NOT_FOUND.value).send({error: `User ${req.params.userId} not found` })
        }
    }

    async extractUserId(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        req.body.id = req.params.userId
        next()
    }
}

export default new UsersMiddleware()