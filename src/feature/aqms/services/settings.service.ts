import { SettingsRepository } from "../repository/settings.repository";
import { UpdateSettingsDto, SettingsResponseDto } from "../dto/settings.dto";

export class SettingsService {
  private settingsRepository: SettingsRepository;

  constructor() {
    this.settingsRepository = new SettingsRepository();
  }

  async getSettings(userId: string = "default"): Promise<SettingsResponseDto> {
    try {
      const settings = await this.settingsRepository.getSettings(userId);

      return {
        notifications: {
          enabled: settings.notificationsEnabled,
          pushEnabled: settings.pushEnabled,
        },
        thresholds: {
          warning: settings.warningThreshold,
          danger: settings.dangerThreshold,
        },
        theme: settings.theme,
      };
    } catch (error) {
      console.error("[FAILED] Get settings", error);
      throw new Error(`[ERROR] Get settings ${(error as Error).message}`);
    }
  }

  async updateSettings(userId: string = "default", data: UpdateSettingsDto): Promise<SettingsResponseDto> {
    try {
      // Validate thresholds
      if (data.thresholds) {
        if (data.thresholds.warning !== undefined && data.thresholds.warning < 0) {
          throw new Error("Warning threshold must be positive");
        }
        if (data.thresholds.danger !== undefined && data.thresholds.danger < 0) {
          throw new Error("Danger threshold must be positive");
        }
        if (
          data.thresholds.warning !== undefined &&
          data.thresholds.danger !== undefined &&
          data.thresholds.warning >= data.thresholds.danger
        ) {
          throw new Error("Warning threshold must be less than danger threshold");
        }
      }

      const settings = await this.settingsRepository.updateSettings(userId, data);

      return {
        notifications: {
          enabled: settings.notificationsEnabled,
          pushEnabled: settings.pushEnabled,
        },
        thresholds: {
          warning: settings.warningThreshold,
          danger: settings.dangerThreshold,
        },
        theme: settings.theme,
      };
    } catch (error) {
      console.error("[FAILED] Update settings", error);
      throw new Error(`[ERROR] Update settings ${(error as Error).message}`);
    }
  }
}
