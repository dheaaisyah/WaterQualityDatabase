import { SensorService } from "../services/sensor.service";
import { Request, Response } from "express";
import { HistoryQueryDto, ChartQueryDto, StatsQueryDto, ExportQueryDto } from "../dto/sensor.dto";

export class SensorHandler {
  private sensorService: SensorService;

  constructor() {
    this.sensorService = new SensorService();
  }

  async getCurrentSensor(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.sensorService.getCurrentSensor();
      
      if (!data) {
        res.status(404).json({
          success: false,
          message: "[NOT FOUND] No sensor data available",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("[Error] getting current sensor:", error);
      res.status(500).json({
        success: false,
        message: "[Failed] to get current sensor data",
        error: `${(error as Error).message}`,
      });
    }
  }

  async getSensorsByRange(req: Request, res: Response): Promise<void> {
    try {
      const range = req.query.range as string || '1h';
      
      if (!['1h', '8h', '24h'].includes(range)) {
        res.status(400).json({
          success: false,
          message: "[INVALID] Range must be 1h, 8h, or 24h",
        });
        return;
      }

      const data = await this.sensorService.getSensorsByRange(range);

      res.status(200).json({
        success: true,
        range,
        count: data.length,
        data,
      });
    } catch (error) {
      console.error("[Error] getting sensors by range:", error);
      res.status(500).json({
        success: false,
        message: "[Failed] to get sensors by range",
        error: `${(error as Error).message}`,
      });
    }
  }

  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const filters: HistoryQueryDto = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        status: (req.query.status as any) || 'all',
        limit: parseInt(req.query.limit as string) || 50,
        offset: parseInt(req.query.offset as string) || 0,
      };

      const result = await this.sensorService.getHistory(filters);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("[Error] getting history:", error);
      res.status(500).json({
        success: false,
        message: "[Failed] to get history",
        error: `${(error as Error).message}`,
      });
    }
  }

  async getHistoryChart(req: Request, res: Response): Promise<void> {
    try {
      const query: ChartQueryDto = {
        range: (req.query.range as any) || '24h',
        interval: req.query.interval as any,
      };

      if (!['24h', '7d', '30d'].includes(query.range)) {
        res.status(400).json({
          success: false,
          message: "[INVALID] Range must be 24h, 7d, or 30d",
        });
        return;
      }

      const result = await this.sensorService.getHistoryChart(query);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("[Error] getting chart data:", error);
      res.status(500).json({
        success: false,
        message: "[Failed] to get chart data",
        error: `${(error as Error).message}`,
      });
    }
  }

  async getHistoryStats(req: Request, res: Response): Promise<void> {
    try {
      const query: StatsQueryDto = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const stats = await this.sensorService.getStatistics(query);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("[Error] getting statistics:", error);
      res.status(500).json({
        success: false,
        message: "[Failed] to get statistics",
        error: `${(error as Error).message}`,
      });
    }
  }

  async exportHistory(req: Request, res: Response): Promise<void> {
    try {
      const query: ExportQueryDto = {
        format: (req.query.format as any) || 'json',
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      if (!query.startDate || !query.endDate) {
        res.status(400).json({
          success: false,
          message: "[INVALID] startDate and endDate are required",
        });
        return;
      }

      if (!['csv', 'json'].includes(query.format)) {
        res.status(400).json({
          success: false,
          message: "[INVALID] Format must be csv or json",
        });
        return;
      }

      const data = await this.sensorService.exportHistory(query);

      if (query.format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=sensor-data-${Date.now()}.csv`);
        res.send(data);
      } else {
        res.status(200).json({
          success: true,
          data,
        });
      }
    } catch (error) {
      console.error("[Error] exporting history:", error);
      res.status(500).json({
        success: false,
        message: "[Failed] to export history",
        error: `${(error as Error).message}`,
      });
    }
  }
}
