import { CommonRoutesConfig } from "../common/common.routes.config"
import express from 'express'
import UsersController from "./controller/users.controller"
import {statusCodes} from '../common/http.status'
import UsersMiddleware from './middleware/users.middleware'
import { body } from "express-validator"
import BodyValidationMiddleware from '../common/middleware/body.validation.middleware';

export class UserRoutes extends CommonRoutesConfig{
    constructor(app: express.Application){
        super(app, "UserRoutes")
    }


    configureRoutes() {

        this.app
            .route('/users')
            .get(UsersController.listUsers)
            .post(
              //  UsersMiddleware.validateRequiredUserBodyFields,
                body('email').isEmail(),
                body('password')
                    .isLength({ min: 5 })
                    .withMessage('Must include password (5+ characters)'),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                UsersMiddleware.validateSameEmailDoesntExist,
                UsersController.createUser
            )
            this.app.param(`userId`, UsersMiddleware.extractUserId) 
            this.app
                .route(`/users/:userId`)
                .all(UsersMiddleware.validateUserExists)
                .get(UsersController.getUserById)
                .delete(UsersController.removeUser) 
    
            this.app.put(`/users/:userId`, [
                body('email').isEmail(),
                body('password')
                    .isLength({ min: 5 })
                    .withMessage('Must include password (5+ characters)'), 
                body('firstName').isString(),
                body('lastName').isString(),
                body('permissionFlags').isInt(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,               
                UsersMiddleware.validateSameEmailBelongToSameUser,
                UsersController.put,
            ]) 
    
            this.app.patch(`/users/:userId`, [
                body('email').isEmail().optional(),
                body('password')
                    .isLength({ min: 5 })
                    .withMessage('Password must be 5+ characters')
                   .optional(),
                body('firstName').isString().optional(),
                body('lastName').isString().optional(),
                body('permissionFlags').isInt().optional(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                UsersMiddleware.validatePatchEmail,
                UsersController.patch,
            ]) 

        return this.app 
    }
}


// this.app.route(`/user`).get((req: express.Request, res: express.Response) => {
//     res.status(statusCodes.HttpStatus_OK.value).send("List of users")
// })


// this.app.route(`/user`).post((req: express.Request, res: express.Response) => {
//     res.status(statusCodes.HttpStatus_CREATED.value).send("User created!")
// })

// this.app.route(`/users/:userId`)
// .all((req: express.Request, res: express.Response, next: express.NextFunction) => {
//     // this middleware function runs before any request to /users/:userId
//     // but it doesn't accomplish anything just yet---
//     // it simply passes control to the next applicable function below using next()
//     next()
// })
// .get((req: express.Request, res: express.Response) => {
//     res.status(statusCodes.HttpStatus_OK.value).send(`GET requested for id ${req.params.userId}`)
// })
// .put((req: express.Request, res: express.Response) => {
//     res.status(203).send(`PUT requested for id ${req.params.userId}`)
// })
// .patch((req: express.Request, res: express.Response) => {
//     res.status(203).send(`PATCH requested for id ${req.params.userId}`)
// })
// .delete((req: express.Request, res: express.Response) => {
//     res.status(204).send(`DELETE requested for id ${req.params.userId}`)
// })