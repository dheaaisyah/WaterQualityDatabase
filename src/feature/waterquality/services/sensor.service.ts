import { CrudRepository } from "../repository/crud";
import { HistoryQueryDto, ChartQueryDto, StatsQueryDto, ExportQueryDto } from "../dto/sensor.dto";
import { DataWQ } from "@prisma/client";
import moment from "moment-timezone";

export class SensorService {
  private crudRepository: CrudRepository;

  constructor() {
    this.crudRepository = new CrudRepository();
  }

  // Calculate status based on pH levels
  private calculateStatus(phValue: string | null): 'safe' | 'warning' | 'danger' {
    if (!phValue) return 'safe';

    const ph = parseFloat(phValue);

    if (isNaN(ph)) return 'safe';
    if (ph >= 6.5 && ph <= 8.5) return 'safe';
    if ((ph >= 6.0 && ph < 6.5) || (ph > 8.5 && ph <= 9.0)) return 'warning';
    return 'danger';
  }

  // Format sensor data with status
  private formatSensorData(sensor: DataWQ | null) {
    if (!sensor) {
      return null;
    }

    return {
      sensorId: sensor.id,
      timestamp: sensor.createdAt.toISOString(),
      ph: parseFloat(sensor.ph || '0'),
      suhu: parseFloat(sensor.suhu || '0'),
      ec: parseFloat(sensor.ec || '0'),
      tds: parseFloat(sensor.tds || '0'),
      turbidity: parseFloat(sensor.turbidity || '0'),
      status: this.calculateStatus(sensor.ph),
    };
  }

  async getCurrentSensor() {
    try {
      const sensor = await this.crudRepository.queryNewData();
      return this.formatSensorData(sensor);
    } catch (error) {
      console.error("[FAILED] Get current sensor", error);
      throw new Error(`[ERROR] Get current sensor ${(error as Error).message}`);
    }
  }

  async getSensorsByRange(range: string) {
    try {
      const sensors = await this.crudRepository.getSensorsByRange(range);
      return sensors.map((sensor: DataWQ) => this.formatSensorData(sensor));
    } catch (error) {
      console.error("[FAILED] Get sensors by range", error);
      throw new Error(`[ERROR] Get sensors by range ${(error as Error).message}`);
    }
  }

  async getHistory(filters: HistoryQueryDto) {
    try {
      const { data, total } = await this.crudRepository.getHistoryWithFilters(filters);

      // Filter by status if specified
      let filteredData = data;
      if (filters.status && filters.status !== 'all') {
        filteredData = data.filter((sensor: DataWQ) => {
          const status = this.calculateStatus(sensor.ph);
          return status === filters.status;
        });
      }

      const formattedData = filteredData.map((sensor: DataWQ) => this.formatSensorData(sensor));

      return {
        data: formattedData,
        total: filters.status && filters.status !== 'all' ? formattedData.length : total,
        limit: filters.limit,
        offset: filters.offset,
      };
    } catch (error) {
      console.error("[FAILED] Get history", error);
      throw new Error(`[ERROR] Get history ${(error as Error).message}`);
    }
  }

  async getHistoryChart(query: ChartQueryDto) {
    try {
      const data = await this.crudRepository.getHistoryForChart(query.range, query.interval);

      // Auto-calculate interval if not provided
      let intervalMinutes: number;
      if (query.interval) {
        switch (query.interval) {
          case '1h':
            intervalMinutes = 60;
            break;
          case '4h':
            intervalMinutes = 240;
            break;
          case '1d':
            intervalMinutes = 1440;
            break;
          default:
            intervalMinutes = 60;
        }
      } else {
        // Auto-calculate based on range
        switch (query.range) {
          case '24h':
            intervalMinutes = 60; // 1 hour intervals
            break;
          case '7d':
            intervalMinutes = 240; // 4 hour intervals
            break;
          case '30d':
            intervalMinutes = 1440; // 1 day intervals
            break;
          default:
            intervalMinutes = 60;
        }
      }

      // Aggregate data by interval
      const aggregated = this.aggregateByInterval(data, intervalMinutes);

      return {
        range: query.range,
        interval: query.interval || this.getIntervalString(intervalMinutes),
        data: aggregated,
      };
    } catch (error) {
      console.error("[FAILED] Get chart data", error);
      throw new Error(`[ERROR] Get chart data ${(error as Error).message}`);
    }
  }

  private getIntervalString(minutes: number): string {
    if (minutes === 60) return '1h';
    if (minutes === 240) return '4h';
    if (minutes === 1440) return '1d';
    return '1h';
  }

  private aggregateByInterval(data: DataWQ[], intervalMinutes: number) {
    const grouped: { [key: string]: DataWQ[] } = {};

    data.forEach((sensor: DataWQ) => {
      const timestamp = moment(sensor.createdAt);
      const intervalKey = timestamp.startOf('hour').format('YYYY-MM-DD HH:00:00');

      if (!grouped[intervalKey]) {
        grouped[intervalKey] = [];
      }
      grouped[intervalKey].push(sensor);
    });

    return Object.keys(grouped).map((key: string) => {
      const sensors = grouped[key];
      const avgPh = sensors.reduce((sum: number, s: DataWQ) => sum + parseFloat(s.ph || '0'), 0) / sensors.length;
      const avgSuhu = sensors.reduce((sum: number, s: DataWQ) => sum + parseFloat(s.suhu || '0'), 0) / sensors.length;
      const avgEc = sensors.reduce((sum: number, s: DataWQ) => sum + parseFloat(s.ec || '0'), 0) / sensors.length;
      const avgTds = sensors.reduce((sum: number, s: DataWQ) => sum + parseFloat(s.tds || '0'), 0) / sensors.length;
      const avgTurbidity = sensors.reduce((sum: number, s: DataWQ) => sum + parseFloat(s.turbidity || '0'), 0) / sensors.length;

      return {
        timestamp: key,
        ph: Math.round(avgPh * 10) / 10,
        suhu: Math.round(avgSuhu * 10) / 10,
        ec: Math.round(avgEc * 10) / 10,
        tds: Math.round(avgTds * 10) / 10,
        turbidity: Math.round(avgTurbidity * 10) / 10,
        status: this.calculateStatus(avgPh.toString()),
      };
    });
  }

  async getStatistics(query: StatsQueryDto) {
    try {
      const data = await this.crudRepository.getStatistics(query.startDate, query.endDate);

      if (data.length === 0) {
        return {
          count: 0,
          ph: { min: 0, max: 0, avg: 0 },
          suhu: { min: 0, max: 0, avg: 0 },
          ec: { min: 0, max: 0, avg: 0 },
          tds: { min: 0, max: 0, avg: 0 },
          turbidity: { min: 0, max: 0, avg: 0 },
          statusDistribution: { safe: 0, warning: 0, danger: 0 },
        };
      }

      const phValues = data.map((s: DataWQ) => parseFloat(s.ph || '0')).filter((v: number) => !isNaN(v));
      const suhuValues = data.map((s: DataWQ) => parseFloat(s.suhu || '0')).filter((v: number) => !isNaN(v));
      const ecValues = data.map((s: DataWQ) => parseFloat(s.ec || '0')).filter((v: number) => !isNaN(v));
      const tdsValues = data.map((s: DataWQ) => parseFloat(s.tds || '0')).filter((v: number) => !isNaN(v));
      const turbidityValues = data.map((s: DataWQ) => parseFloat(s.turbidity || '0')).filter((v: number) => !isNaN(v));

      const statusDistribution = { safe: 0, warning: 0, danger: 0 };
      data.forEach((sensor: DataWQ) => {
        const status = this.calculateStatus(sensor.ph);
        statusDistribution[status]++;
      });

      return {
        count: data.length,
        ph: {
          min: Math.min(...phValues),
          max: Math.max(...phValues),
          avg: Math.round((phValues.reduce((a: number, b: number) => a + b, 0) / phValues.length) * 10) / 10,
        },
        suhu: {
          min: Math.min(...suhuValues),
          max: Math.max(...suhuValues),
          avg: Math.round((suhuValues.reduce((a: number, b: number) => a + b, 0) / suhuValues.length) * 10) / 10,
        },
        ec: {
          min: Math.min(...ecValues),
          max: Math.max(...ecValues),
          avg: Math.round((ecValues.reduce((a: number, b: number) => a + b, 0) / ecValues.length) * 10) / 10,
        },
        tds: {
          min: Math.min(...tdsValues),
          max: Math.max(...tdsValues),
          avg: Math.round((tdsValues.reduce((a: number, b: number) => a + b, 0) / tdsValues.length) * 10) / 10,
        },
        turbidity: {
          min: Math.min(...turbidityValues),
          max: Math.max(...turbidityValues),
          avg: Math.round((turbidityValues.reduce((a: number, b: number) => a + b, 0) / turbidityValues.length) * 10) / 10,
        },
        statusDistribution,
      };
    } catch (error) {
      console.error("[FAILED] Get statistics", error);
      throw new Error(`[ERROR] Get statistics ${(error as Error).message}`);
    }
  }

  async exportHistory(query: ExportQueryDto) {
    try {
      const data = await this.crudRepository.getHistoryForExport(query.startDate, query.endDate);
      const formattedData = data.map((sensor: DataWQ) => this.formatSensorData(sensor));

      if (query.format === 'csv') {
        return this.convertToCSV(formattedData);
      } else {
        return formattedData;
      }
    } catch (error) {
      console.error("[FAILED] Export history", error);
      throw new Error(`[ERROR] Export history ${(error as Error).message}`);
    }
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = ['Sensor ID', 'Timestamp', 'pH', 'Suhu (°C)', 'EC', 'TDS', 'Turbidity', 'Status'];
    const rows = data.map(item => [
      item.sensorId,
      item.timestamp,
      item.ph,
      item.suhu,
      item.ec,
      item.tds,
      item.turbidity,
      item.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(',')),
    ].join('\n');

    return csvContent;
  }
}
