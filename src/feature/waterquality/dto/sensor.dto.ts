export class CreateDto {
    ph: string = 'null';
    suhu: string = 'null';
    ec: string = 'null';
    tds: string = 'null';
    turbidity: string = 'null';
}

export class SensorRangeQueryDto {
    range: '1h' | '8h' | '24h' = '1h';
}

export class HistoryQueryDto {
    startDate?: string;
    endDate?: string;
    status?: 'all' | 'safe' | 'warning' | 'danger' = 'all';
    limit: number = 1500;
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
    sensorId: number = 0;
    timestamp: string = '';
    ph: number = 0;
    suhu: number = 0;
    ec: number = 0;
    tds: number = 0;
    turbidity: number = 0;
    status: 'safe' | 'warning' | 'danger' = 'safe';
}
