import { Prisma } from "@prisma/client"
import PrismaCrud from "../../crud/prisma"

type IDoc = {
    email?: string | null | undefined,
    phoneNumber?: string | null | undefined
}

type Iresp<T> = {
    sts: number;
    msg?: string;
    data?: T;
}

type IData = {
    contact: {
        primaryContatctId: number
        emails: string[]
        phoneNumbers: string[]
        secondaryContactIds: number[]
    }
}


export default class Identify {
    private p_crud
    constructor() {
        this.p_crud = new PrismaCrud()
    }
    public async init(doc: IDoc) {
        let resp: Iresp<IData> = {
            sts: 404,
            msg: 'something went wrong'
        }
        try {
            let contact: IData['contact'] = {
                primaryContatctId: Infinity,
                emails: [],
                phoneNumbers: [],
                secondaryContactIds: []
            }
            // check if record present 
            let user = await this.p_crud.findMany({
                table_name: Prisma.ModelName.contact,
                filter: {
                    OR: [
                        { email: doc.email },
                        { phoneNumber: doc.phoneNumber }
                    ]
                }
            })
            if (user && user.length) {
                let comb_exist = false,
                    mail_exist = false,
                    phn_exist = false,
                    upt_sec:number[] = []
                // if records present
                user.forEach(e => {
                    if (e.linkPrecedence == "primary" && contact.primaryContatctId != Infinity) {
                        if (contact.primaryContatctId > e.id) {
                            contact.primaryContatctId = e.id
                            upt_sec.push(contact.primaryContatctId)
                            contact.secondaryContactIds.push(contact.primaryContatctId)
                        } else {
                            upt_sec.push(e.id)
                            contact.secondaryContactIds.push(e.id)
                        }
                    }
                    else if (e.linkPrecedence == "primary")
                        contact.primaryContatctId = e.id
                    else contact.secondaryContactIds.push(e.id)
                    if (e.email) contact.emails.push(e.email)
                    if (e.phoneNumber) contact.phoneNumbers.push(e.phoneNumber)
                    // checking if given combination exist in db
                    if (doc.email == e.email && doc.phoneNumber == e.phoneNumber) comb_exist = true
                    // checking if given mail or phone exists seperately
                    if (doc.email && doc.email == e.email) mail_exist = true
                    if (doc.phoneNumber && doc.phoneNumber == e.phoneNumber) phn_exist = true
                })
                // adding entry if no entry for given mail or phone
                if (!mail_exist || !phn_exist) {
                    let sv = await this.saveData(doc, 'secondary', contact.primaryContatctId)
                    if (contact.secondaryContactIds) contact.secondaryContactIds.push(sv.id)
                    if (sv.email) contact.emails.push(sv.email)
                    if (sv.phoneNumber) contact.phoneNumbers.push(sv.phoneNumber)
                }
                // updating secondary if multiple primaries are found
                if (upt_sec.length) {
                    let up_req = {
                        table_name:Prisma.ModelName.contact,
                        filter:{id:{in:upt_sec}},
                        set:{
                            linkedId:contact.primaryContatctId,
                            linkPrecedence:"secondary"
                        }
                    }
                    await this.p_crud.updateMany(up_req)
                }
            }
            else {
                let sv = await this.saveData(doc, "primary")
                contact.primaryContatctId = sv.id
                if (sv.email) contact.emails.push(sv.email)
                if (sv.phoneNumber) contact.phoneNumbers.push(sv.phoneNumber)
            }
            // send sucess response
            delete resp.msg
            resp.sts = 200
            resp.data = { contact }
            return resp
        } catch (err: any) {
            if (err.sts) resp.sts = err.sts
            if (err.msg) resp.msg = err.msg
            return resp
        }
    }
    private async saveData(
        doc: IDoc,
        lp: "primary" | "secondary" = "secondary",
        li: number | null = null
    ) {
        let sv_req = {
            table_name: Prisma.ModelName.contact,
            data: {
                phoneNumber: doc.phoneNumber || null,
                email: doc.email || null,
                linkedId: li,
                linkPrecedence: lp
            }
        }
        return await this.p_crud.save(sv_req)
    }
}