import express from 'express'
import usersService from '../../users/services/users.service'
import { statusCodes } from '../../common/http.status'
import * as argon2 from 'argon2'

class AuthMiddleware {

    async verifyUserPassword(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ){
        const user: any = await usersService.getUserByEmailWithPassword(
            req.body.email
        )

        if(user){
            const passwordHash = user.password

            if(await argon2.verify(passwordHash, req.body.password)){
                req.body = {
                    userId: user._id,
                    email: user.email,
                    permissionFlags: user.permissionFlags,
                }

                return next()
            }
        }
        return res.status(statusCodes.HttpStatus_BAD_REQUEST.value).send({ errors: ['Invalid email and/or password'] });


        // if (await argon2.verify(passwordHash, req.body.password)) {
        //     req.body = {
        //         userId: user._id,
        //         email: user.email,
        //         permissionFlags: user.permissionFlags,
        //     };
        // }
    }

}

export default new AuthMiddleware()