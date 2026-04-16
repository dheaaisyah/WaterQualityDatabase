export class CreateDto {
    co2: string = 'null';
    suhu: string = 'null';
    humidity: string = 'null';
}

export class SensorRangeQueryDto {
    range: '1h' | '8h' | '24h' = '1h';
}

export class HistoryQueryDto {
    startDate?: string;
    endDate?: string;
    status?: 'all' | 'safe' | 'warning' | 'danger' = 'all';
    limit: number = 50;
    offset: number = 0;
}

export class ChartQueryDto {
    range: '24h' | '7d' | '30d' = '24h';
    interval?: '1h' | '4h' | '1d';
}

export class StatsQueryDto {
    startDate?: string;
    endDate?: string;
}

export class ExportQueryDto {
    format: 'csv' | 'json' = 'json';
    startDate: string = '';
    endDate: string = '';
}

export class SensorCurrentResponseDto {
    sensorId: string = '';
    timestamp: string = '';
    co2: number = 0;
    temperature: number = 0;
    humidity: number = 0;
    status: 'safe' | 'warning' | 'danger' = 'safe';
}
