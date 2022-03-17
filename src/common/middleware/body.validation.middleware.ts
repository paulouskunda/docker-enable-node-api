import express from 'express'
import { validationResult } from 'express-validator'
import { statusCodes } from '../http.status'

class BodyValidationMiddle {
    verifyBodyFieldsErrors(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ){
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(statusCodes.HttpStatus_BAD_REQUEST.value).send({ error: errors.array()})
        }

        next()
    }

}

export default new BodyValidationMiddle()