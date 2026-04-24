import prisma from "../../../config/database";
import { UpdateSettingsDto } from "../dto/settings.dto";

export class SettingsRepository {
  async getSettings(userId: string = "default") {
    try {
      let settings = await prisma.settings.findUnique({
        where: {
          userId,
        },
      });

      // Create default settings if not exists
      if (!settings) {
        settings = await this.createDefaultSettings(userId);
      }

      return settings;
    } catch (error) {
      console.error("[FAILED] Fetch settings", error);
      throw new Error(`[ERROR] Fetch settings ${(error as Error).message}`);
    }
  }

  async updateSettings(userId: string = "default", data: UpdateSettingsDto) {
    try {
      // Ensure settings exist
      await this.getSettings(userId);

      const updateData: any = {};

      if (data.notifications) {
        updateData.notificationsEnabled = data.notifications.enabled;
        updateData.pushEnabled = data.notifications.pushEnabled;
      }

      if (data.thresholds) {
        if (data.thresholds.warning !== undefined) {
          updateData.warningThreshold = data.thresholds.warning;
        }
        if (data.thresholds.danger !== undefined) {
          updateData.dangerThreshold = data.thresholds.danger;
        }
      }

      if (data.theme) {
        updateData.theme = data.theme;
      }

      const settings = await prisma.settings.update({
        where: {
          userId,
        },
        data: updateData,
      });

      return settings;
    } catch (error) {
      console.error("[FAILED] Update settings", error);
      throw new Error(`[ERROR] Update settings ${(error as Error).message}`);
    }
  }

  async createDefaultSettings(userId: string = "default") {
    try {
      const settings = await prisma.settings.create({
        data: {
          userId,
          notificationsEnabled: true,
          pushEnabled: true,
          warningThreshold: 600,
          dangerThreshold: 1000,
          theme: "dark",
        },
      });

      return settings;
    } catch (error) {
      console.error("[FAILED] Create default settings", error);
      throw new Error(`[ERROR] Create default settings ${(error as Error).message}`);
    }
  }
}
