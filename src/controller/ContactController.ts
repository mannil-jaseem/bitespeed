import {Controller, Req, Res, Post, UseBefore} from "routing-controllers";
import { CONTACTS_SERVICE } from "../services";
import { ContactValidation } from "./Contact.validation";
import { Request, Response } from "express";

@Controller("/contact")
export class ContactController{
    @Post("/identify")
    async contactList(@Req() req: Request, @Res() res: Response) {
        try {
            // validate request (joi validation use middle ware)
            let body = ContactValidation.parse(req.body)
            let srv = new CONTACTS_SERVICE.Identify()
            let { sts, msg, data } = await srv.init(body)
            return res
                .status(sts)
                .json(msg ? { msg } : { ...data });
        } catch (err: any) {
            console.log(err);
            if (err.name = 'ZodError') {
                let i = err.issues[err.issues.length-1]
                return res
                    .status(400)
                    .json({ msg: i.message || 'something went wrong' });
            } else
                return res
                    .status(404)
                    .json({ msg: 'something went wrong' });
        }
    }
}