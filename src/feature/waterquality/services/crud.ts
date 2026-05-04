import { CrudRepository } from "../repository/crud";
import { CreateDto } from "../dto/create_dto";

export class CrudService {
    private crudRepository: CrudRepository

    constructor() {
        this.crudRepository = new CrudRepository()
    }

    async createData(data: CreateDto) {
        try {
            let isValid = true;
            let errorCode: string | null = null;

            // Konversi ke angka (defensive programming) untuk memastikan validasi akurat
            const phValue = Number(data.ph);
            const suhuValue = Number(data.suhu);
            const turbidityValue = Number(data.turbidity);
            const ecValue = Number(data.ec);
            const tdsValue = Number(data.tds);

            // --- LOGIKA VALIDASI SENSOR ---

            // 1. Validasi pH (Rentang logis kimia: 0 - 14)
            if (phValue < 0 || phValue > 14) {
                isValid = false;
                errorCode = "INVALID_PH_RANGE";
            }
            // 2. Validasi Turbidity (Batas maksimal kalibrasi: 500 NTU)
            else if (turbidityValue > 500) {
                isValid = false;
                errorCode = "TURBIDITY_LIMIT_EXCEEDED";
            }
            // 3. Validasi Suhu (Rentang logis air tanah: 15°C - 45°C)
            else if (suhuValue < 15 || suhuValue > 45) {
                isValid = false;
                errorCode = "TEMP_OUT_OF_RANGE";
            }
            // 4. Validasi Nilai Negatif (EC dan TDS tidak mungkin minus)
            else if (ecValue < 0 || tdsValue < 0) {
                isValid = false;
                errorCode = "NEGATIVE_SENSOR_VALUE";
            }

            // Lempar data ke Repository beserta status isValid dan errorCode-nya
            const newData = await this.crudRepository.createData(data, isValid, errorCode)
            return newData

        } catch (e) {
            console.error("[FAILED] Creating Aqms Data : ", e);
            throw new Error(`[ERROR] Creating Aqms data ${(e as Error).message}`);
        }
    }

    async queryNewData() {
        try {
            const newData = await this.crudRepository.queryNewData()
            return newData
        } catch (e) {
            console.error("[FAILED] Fetch data Aqms", e);
            throw new Error(`[ERROR] Fetch Data Aqms ${(e as Error).message}`);
        }
    }
}