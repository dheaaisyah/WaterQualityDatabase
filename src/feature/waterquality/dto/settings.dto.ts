export class SettingsResponseDto {
    notifications: {
        enabled: boolean;
        pushEnabled: boolean;
    } = {
        enabled: true,
        pushEnabled: true
    };
    thresholds: {
        warning: number;
        danger: number;
    } = {
        warning: 600,
        danger: 1000
    };
    theme: string = 'dark';
}

export class UpdateSettingsDto {
    notifications?: {
        enabled?: boolean;
        pushEnabled?: boolean;
    };
    thresholds?: {
        warning?: number;
        danger?: number;
    };
    theme?: string;
}
