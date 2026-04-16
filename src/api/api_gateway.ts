import express, { Request, Response } from "express";
//PM2.5 IMPORT >.<
import Pm25Controller from "../feature/kalibrasi_pm25/controller/pm25_controller";
import Pm25Repository from "../feature/kalibrasi_pm25/repository/pm25";
import Pm25Usecase from "../feature/kalibrasi_pm25/usecase/pm25_usecase";
// CO2 IMPORT _-
import Co2Controller from "../feature/kalibrasi_co2/controller/co2_controller";
import Co2Repository from "../feature/kalibrasi_co2/repository/co2";
import Co2Usecase from "../feature/kalibrasi_co2/usecase/co2_usecase";
// NO2 Import
import No2Controller from "../feature/no2/controller/crud";
import No2Repository from "../feature/no2/repository/crud";
import No2Usecase from "../feature/no2/usecase/crud";
// SHT
import ShtController from "../feature/sht/controller/crud_controller";
import ShtUseCase from "../feature/sht/usecase/crud";
import ShtRepo from "../feature/sht/repository/crud_sht";
// AQMS
import aqmsRoutes from "../feature/aqms/routes/aqms.routes";

const Router = express.Router();
//Declaration PM2.5
const pm25Repository = new Pm25Repository();
const pm25Usecase = new Pm25Usecase(pm25Repository);
const pm25Controller = new Pm25Controller(pm25Usecase);
//Declaration CO2
const co2Repository = new Co2Repository();
const co2Usecase = new Co2Usecase(co2Repository);
const co2Controller = new Co2Controller(co2Usecase);
//Declaration No2
const no2Repository = new No2Repository();
const no2Usecase = new No2Usecase(no2Repository);
const no2Controller = new No2Controller(no2Usecase);
//SHT
const shtRepo = new ShtRepo();
const shtUsecase = new ShtUseCase(shtRepo);
const shtController = new ShtController(shtUsecase);
//Route Deklaration PM2.5
Router.post("/pm25", (req: Request, res: Response) =>
  pm25Controller.createPm25(req, res)
);
Router.get("/pm25", (req: Request, res: Response) =>
  pm25Controller.getAllPm25(req, res)
);
//route Deklaration for CO2
Router.post("/co2", (req: Request, res: Response) =>
  co2Controller.createCo2(req, res)
);
Router.get("/co2", (req: Request, res: Response) =>
  co2Controller.getAllCo2(req, res)
);
// NO2 Declaration
Router.post("/no2", (req: Request, res: Response) =>
  no2Controller.createNo2(req, res)
);
Router.get("/no2", (req: Request, res: Response) =>
  no2Controller.getAllNo2(req, res)
);
//sht
Router.post("/sht", (req: Request, res: Response) =>
  shtController.createSht(req, res)
);
Router.get("/sht", (req: Request, res: Response) =>
  shtController.getAllSht(req, res)
);
//AQMS - dengan rate limiting dan security middleware
Router.use("/aqms", aqmsRoutes);

export default Router;
