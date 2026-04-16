import prisma from "../../../config/database";
import { CreateDto } from "../dto/create_dto";
import { HistoryQueryDto } from "../dto/sensor.dto";
import moment from "moment-timezone";

export class CrudRepository {
  async createData(data:CreateDto) {
    try {
        const newData = await prisma.aqms.create({
            data: {
                co2: data.co2,
                suhu: data.suhu,
                humidity: data.humidity,
            }
        })
        return newData
    } catch (error) {
        console.error("[FAILED] Creating Aqms Data : ", error);
        throw new Error(`[ERROR] Creating Aqms data ${(error as Error).message}`);
    }
  }
  
  async queryNewData(){
    try {
        const newData = await prisma.aqms.findFirst({
            orderBy: {
                createdAt: "desc",
            },
        })
        return newData
    } catch (error) {
        console.error("[FAILED] Fetch data Aqms", error);
        throw new Error(`[ERROR] Fetch Data Aqms ${(error as Error).message}`);
    }
  }

  async getSensorsByRange(range: string) {
    try {
      let startTime: Date;
      const now = new Date();

      switch (range) {
        case '1h':
          startTime = moment(now).subtract(1, 'hours').toDate();
          break;
        case '8h':
          startTime = moment(now).subtract(8, 'hours').toDate();
          break;
        case '24h':
          startTime = moment(now).subtract(24, 'hours').toDate();
          break;
        default:
          startTime = moment(now).subtract(1, 'hours').toDate();
      }

      const data = await prisma.aqms.findMany({
        where: {
          createdAt: {
            gte: startTime,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return data;
    } catch (error) {
      console.error("[FAILED] Fetch sensors by range", error);
      throw new Error(`[ERROR] Fetch sensors by range ${(error as Error).message}`);
    }
  }

  async getHistoryWithFilters(filters: HistoryQueryDto) {
    try {
      const where: any = {};

      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
          where.createdAt.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.createdAt.lte = new Date(filters.endDate);
        }
      }

      const data = await prisma.aqms.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: filters.limit,
        skip: filters.offset,
      });

      const total = await prisma.aqms.count({ where });

      return { data, total };
    } catch (error) {
      console.error("[FAILED] Fetch history with filters", error);
      throw new Error(`[ERROR] Fetch history ${(error as Error).message}`);
    }
  }

  async getHistoryForChart(range: string, interval?: string) {
    try {
      let startTime: Date;
      const now = new Date();

      switch (range) {
        case '24h':
          startTime = moment(now).subtract(24, 'hours').toDate();
          break;
        case '7d':
          startTime = moment(now).subtract(7, 'days').toDate();
          break;
        case '30d':
          startTime = moment(now).subtract(30, 'days').toDate();
          break;
        default:
          startTime = moment(now).subtract(24, 'hours').toDate();
      }

      const data = await prisma.aqms.findMany({
        where: {
          createdAt: {
            gte: startTime,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return data;
    } catch (error) {
      console.error("[FAILED] Fetch chart data", error);
      throw new Error(`[ERROR] Fetch chart data ${(error as Error).message}`);
    }
  }

  async getStatistics(startDate?: string, endDate?: string) {
    try {
      const where: any = {};

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      const data = await prisma.aqms.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return data;
    } catch (error) {
      console.error("[FAILED] Fetch statistics", error);
      throw new Error(`[ERROR] Fetch statistics ${(error as Error).message}`);
    }
  }

  async getHistoryForExport(startDate: string, endDate: string) {
    try {
      const data = await prisma.aqms.findMany({
        where: {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return data;
    } catch (error) {
      console.error("[FAILED] Fetch export data", error);
      throw new Error(`[ERROR] Fetch export data ${(error as Error).message}`);
    }
  }
}
