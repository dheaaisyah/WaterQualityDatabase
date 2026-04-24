import { CrudRepository } from "../repository/crud";
import { CreateDto } from "../dto/create_dto";

export class CrudService {
    private crudRepository: CrudRepository
    constructor() {
        this.crudRepository = new CrudRepository()
    }
    async createData(data: CreateDto) {
        try{
            const newData = await this.crudRepository.createData(data)
            return newData
        }catch(e){
            console.error("[FAILED] Creating Aqms Data : ", e);
            throw new Error(`[ERROR] Creating Aqms data ${(e as Error).message}`);
        }
    }   
    async queryNewData() {
        try{
            const newData = await this.crudRepository.queryNewData()
            return newData
        }catch(e){
            console.error("[FAILED] Fetch data Aqms", e);
            throw new Error(`[ERROR] Fetch Data Aqms ${(e as Error).message}`);
        }
    }
}