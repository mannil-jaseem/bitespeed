import { PrismaClient, Prisma, contact} from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'

type ISaveContact = {
    table_name: Prisma.ModelName,
    data: Omit<contact, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
}

type IFindone = {
    table_name: Prisma.ModelName,
    filter?: { [key: string]: any },
    sort?: { [key: string]: "asc" | "desc" },
    select?: { [key: string]: boolean }
}

type IUpdate = {
    table_name: Prisma.ModelName,
    filter: { [key: string]: any },
    set: { [key: string]: any },
}

export default class PrismaCrud {
    private prisma:PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
    constructor() {
        this.prisma = new PrismaClient()
    }
    public async save(doc: ISaveContact) {
        let { table_name, data } = doc
        try {
            return await (this.prisma[table_name]).create({
                data
            })
        } catch (e) {
            return Promise.reject({
                msg: `error in updateing ${table_name} data`,
                err: e
            })
        }
    }
    public async findMany(doc: IFindone) {
        let { table_name, filter, sort, select } = doc
        try {
            return await this.prisma[table_name].findMany({
                where: filter,
                orderBy: sort,
                select
            })
        } catch (e) {
            return Promise.reject({
                msg: `error in getting ${table_name} data`,
                err: e
            })
        }
    }
    public async updateMany(doc: IUpdate) {
        let { table_name, filter, set } = doc
        try {
            return await this.prisma[table_name].updateMany({
                where: filter,
                data: set
            })
        } catch (e) {
            return Promise.reject({
                msg: `error in updating ${table_name} data`,
                err: e
            })
        }
    }
}