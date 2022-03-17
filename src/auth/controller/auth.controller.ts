import express from 'express'
import debug  from 'debug'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { statusCodes } from '../../common/http.status'

const log: debug.IDebugger = debug('app:auth-controller')

/**
* This value is automatically populated from .env, a file which you will have
* to create for yourself at the root of the project.
*
* See .env.example in the repo for the required format.
*/
// 
// const jwtSecret: string = process.env.JWT_SECRET


class AuthController{
  
    async createJWT(req: express.Request, res: express.Response){
        const {JWT_SECRET} = process.env
        // @ts-expect-error
        const jwtSecret: string = JWT_SECRET
        const tokenExpirationInSecods = 36000
        try{
            const refreshId = req.body.userId +jwtSecret //"deepMate1234"
            const salt = crypto.createSecretKey(crypto.randomBytes(16))
            const hash = crypto.createHmac('sha512', salt)
                                .update(refreshId)
                                .digest('base64')
            req.body.refreshId = salt.export()

            const token = jwt.sign(req.body, jwtSecret, {
                expiresIn: tokenExpirationInSecods, })
            return res.status(statusCodes.HttpStatus_CREATED.value)
                        .send({ accessToken: token, refreshToken: hash})
        }catch(err){
            log('Create JWT error: %0', err)
            return res.status(statusCodes.HttpStatus_INTERNAL_SERVER_ERROR.value)
            .send();
        }
    }

}


export default new AuthController()