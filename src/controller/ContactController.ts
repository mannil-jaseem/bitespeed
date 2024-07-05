import {Controller, Req, Res, Post, UseBefore} from "routing-controllers";
import { CONTACTS_SERVICE } from "../services";
import { Request, Response } from "express";

@Controller("/contact")
export class ContactController{
    @Post("/identify")
    // @UseBefore(Auth) 
    async contactList(@Req() req: Request, @Res() res: Response) {
        // validate request (joi validation use middle ware)
        let srv = new CONTACTS_SERVICE.Identify()
        let {sts,msg,data} = await srv.init(req.body)
        return res
            .status(sts)
            .json(msg?{msg}:{...data});
    }
}