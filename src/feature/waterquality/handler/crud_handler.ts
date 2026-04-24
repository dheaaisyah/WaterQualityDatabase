import { CrudService } from "../services/crud";
import { Request, Response } from "express";
import { CreateDto } from "../dto/create_dto";

export class CrudHandler {
    private crudService: CrudService
    constructor() {
        this.crudService = new CrudService()
    }
    async createData(req: Request, res: Response): Promise<void> {
        try {
            const data: CreateDto = req.body
            const newData = await this.crudService.createData(data)
            res.status(201).json({
                success: true,
                message: "[SUCCESS] Create Data Water Quality",
                dataWaterQuality: newData,
            })
        } catch (e) {
            console.error("[Error] creating Water Quality data:", e)
            res.status(500).json({
                success: false,
                message: "[Failed] to create Water Quality data",
                error: `${(e as Error).message}`,
            })
        }
    }
    async queryNewData(req: Request, res: Response): Promise<void> {
        try {
            const newData = await this.crudService.queryNewData()
            res.status(200).json({
                success: true,
                message: "[Success] Retrieved New Data Water Quality",
                dataWaterQuality: newData,
            })
        } catch (e) {
            console.error("[Error] retrieving Water Quality data:", e)
            res.status(500).json({
                success: false,
                message: "[Failed] to retrieve Water Quality data",
                error: `${(e as Error).message}`,
            })
        }
    }
}