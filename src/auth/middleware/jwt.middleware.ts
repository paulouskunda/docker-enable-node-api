import express from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { Jwt } from '../../common/types/jwt'
import usersService from '../../users/services/users.service'
import { statusCodes } from '../../common/http.status'




class JwtMiddleware {

    verifyRefreshBodyField( req: express.Request, res: express.Response, next: express.NextFunction ) {

        if (req.body && req.body.refreshToken) {
            return next();
        } else {
            return res
                .status(statusCodes.HttpStatus_BAD_GATEWAY.value)
                .send({ errors: ['Missing required field: refreshToken'] });
        }
    }


    async validRefreshNeeded(req: express.Request, res: express.Response, next: express.NextFunction ) {
        const {JWT_SECRET} = process.env
        // @ts-expect-error
        const jwtSecret: string = JWT_SECRET
        const user: any = await usersService.getUserByEmailWithPassword(
            res.locals.jwt.email
        );
        const salt = crypto.createSecretKey(
            Buffer.from(res.locals.jwt.refreshKey.data)
        );
        const hash = crypto
            .createHmac('sha512', salt)
            .update(res.locals.jwt.userId + jwtSecret)
            .digest('base64');
        if (hash === req.body.refreshToken) {
            req.body = {
                userId: user._id,
                email: user.email,
                permissionFlags: user.permissionFlags,
            };
            return next();
        } else {
            return res.status(statusCodes.HttpStatus_BAD_REQUEST.value).send({ errors: ['Invalid refresh token'] });
        }
    }

    validJWTNeeded(req: express.Request, res: express.Response, next: express.NextFunction) {
        const {JWT_SECRET} = process.env
        // @ts-expect-error
        const jwtSecret: string = JWT_SECRET
        if (req.headers['authorization']) {
            try {
                const authorization = req.headers['authorization'].split(' ');
                if (authorization[0] !== 'Bearer') {
                    return res.status(statusCodes.HttpStatus_UNAUTHORIZED.value).send();
                } else {
                    res.locals.jwt = jwt.verify(
                        authorization[1],
                        jwtSecret
                    ) as Jwt;
                    next();
                }
            } catch (err) {
                return res.status(statusCodes.HttpStatus_FORBIDDEN.value).send();
            }
        } else {
            return res.status(statusCodes.HttpStatus_UNAUTHORIZED.value).send();
        }
    }
}

export default new JwtMiddleware();
