import express, { Request, Response } from "express";
// AQMS
import aqmsRoutes from "../feature/aqms/routes/aqms.routes";
// Water Quality
import wqRoutes from "../feature/waterquality/routes/wq.routes";

const Router = express.Router();
Router.use("/aqms", aqmsRoutes);
Router.use("/waterquality", wqRoutes);

export default Router;
