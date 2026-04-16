import { CrudRepository } from "../repository/crud";
import { HistoryQueryDto, ChartQueryDto, StatsQueryDto, ExportQueryDto } from "../dto/sensor.dto";
import { Aqms } from "@prisma/client";
import moment from "moment-timezone";

export class SensorService {
  private crudRepository: CrudRepository;

  constructor() {
    this.crudRepository = new CrudRepository();
  }

  // Calculate status based on CO2 levels
  private calculateStatus(co2Value: string | null): 'safe' | 'warning' | 'danger' {
    if (!co2Value) return 'safe';
    
    const co2 = parseFloat(co2Value);
    
    if (isNaN(co2)) return 'safe';
    if (co2 < 600) return 'safe';
    if (co2 >= 600 && co2 <= 1000) return 'warning';
    return 'danger';
  }

  // Format sensor data with status
  private formatSensorData(sensor: Aqms | null) {
    if (!sensor) {
      return null;
    }

    return {
      sensorId: sensor.id,
      timestamp: sensor.createdAt.toISOString(),
      co2: parseFloat(sensor.co2 || '0'),
      temperature: parseFloat(sensor.suhu || '0'),
      humidity: parseFloat(sensor.humidity || '0'),
      status: this.calculateStatus(sensor.co2),
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
      return sensors.map((sensor: Aqms) => this.formatSensorData(sensor));
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
        filteredData = data.filter((sensor: Aqms) => {
          const status = this.calculateStatus(sensor.co2);
          return status === filters.status;
        });
      }

      const formattedData = filteredData.map((sensor: Aqms) => this.formatSensorData(sensor));

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

  private aggregateByInterval(data: Aqms[], intervalMinutes: number) {
    const grouped: { [key: string]: Aqms[] } = {};

    data.forEach((sensor: Aqms) => {
      const timestamp = moment(sensor.createdAt);
      const intervalKey = timestamp.startOf('hour').format('YYYY-MM-DD HH:00:00');
      
      if (!grouped[intervalKey]) {
        grouped[intervalKey] = [];
      }
      grouped[intervalKey].push(sensor);
    });

    return Object.keys(grouped).map((key: string) => {
      const sensors = grouped[key];
      const avgCo2 = sensors.reduce((sum: number, s: Aqms) => sum + parseFloat(s.co2 || '0'), 0) / sensors.length;
      const avgTemp = sensors.reduce((sum: number, s: Aqms) => sum + parseFloat(s.suhu || '0'), 0) / sensors.length;
      const avgHum = sensors.reduce((sum: number, s: Aqms) => sum + parseFloat(s.humidity || '0'), 0) / sensors.length;

      return {
        timestamp: key,
        co2: Math.round(avgCo2 * 10) / 10,
        temperature: Math.round(avgTemp * 10) / 10,
        humidity: Math.round(avgHum * 10) / 10,
        status: this.calculateStatus(avgCo2.toString()),
      };
    });
  }

  async getStatistics(query: StatsQueryDto) {
    try {
      const data = await this.crudRepository.getStatistics(query.startDate, query.endDate);

      if (data.length === 0) {
        return {
          count: 0,
          co2: { min: 0, max: 0, avg: 0 },
          temperature: { min: 0, max: 0, avg: 0 },
          humidity: { min: 0, max: 0, avg: 0 },
          statusDistribution: { safe: 0, warning: 0, danger: 0 },
        };
      }

      const co2Values = data.map((s: Aqms) => parseFloat(s.co2 || '0')).filter((v: number) => !isNaN(v));
      const tempValues = data.map((s: Aqms) => parseFloat(s.suhu || '0')).filter((v: number) => !isNaN(v));
      const humValues = data.map((s: Aqms) => parseFloat(s.humidity || '0')).filter((v: number) => !isNaN(v));

      const statusDistribution = { safe: 0, warning: 0, danger: 0 };
      data.forEach((sensor: Aqms) => {
        const status = this.calculateStatus(sensor.co2);
        statusDistribution[status]++;
      });

      return {
        count: data.length,
        co2: {
          min: Math.min(...co2Values),
          max: Math.max(...co2Values),
          avg: Math.round((co2Values.reduce((a: number, b: number) => a + b, 0) / co2Values.length) * 10) / 10,
        },
        temperature: {
          min: Math.min(...tempValues),
          max: Math.max(...tempValues),
          avg: Math.round((tempValues.reduce((a: number, b: number) => a + b, 0) / tempValues.length) * 10) / 10,
        },
        humidity: {
          min: Math.min(...humValues),
          max: Math.max(...humValues),
          avg: Math.round((humValues.reduce((a: number, b: number) => a + b, 0) / humValues.length) * 10) / 10,
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
      const formattedData = data.map((sensor: Aqms) => this.formatSensorData(sensor));

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

    const headers = ['Sensor ID', 'Timestamp', 'CO2 (ppm)', 'Temperature (°C)', 'Humidity (%)', 'Status'];
    const rows = data.map(item => [
      item.sensorId,
      item.timestamp,
      item.co2,
      item.temperature,
      item.humidity,
      item.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(',')),
    ].join('\n');

    return csvContent;
  }
}
