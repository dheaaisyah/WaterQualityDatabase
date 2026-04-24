import { SettingsService } from "../services/settings.service";
import { Request, Response } from "express";
import { UpdateSettingsDto } from "../dto/settings.dto";

export class SettingsHandler {
  private settingsService: SettingsService;

  constructor() {
    this.settingsService = new SettingsService();
  }

  async getSettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string || "default";
      const settings = await this.settingsService.getSettings(userId);

      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      console.error("[Error] getting settings:", error);
      res.status(500).json({
        success: false,
        message: "[Failed] to get settings",
        error: `${(error as Error).message}`,
      });
    }
  }

  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string || "default";
      const data: UpdateSettingsDto = req.body;

      const settings = await this.settingsService.updateSettings(userId, data);

      res.status(200).json({
        success: true,
        message: "[SUCCESS] Settings updated",
        data: settings,
      });
    } catch (error) {
      console.error("[Error] updating settings:", error);
      res.status(500).json({
        success: false,
        message: "[Failed] to update settings",
        error: `${(error as Error).message}`,
      });
    }
  }
}
