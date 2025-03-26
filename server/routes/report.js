import express from "express";
import { ReportController } from "../controllers/report.js";
import { mdAuth } from "../middlewares/authenticated.js";

const router = express.Router();

router.post("/report/:user", [mdAuth.asureAuth], ReportController.createReport);
router.get("/report/getreport",[mdAuth.asureAuth], ReportController.getReports); // puedes proteger con rol admin
router.put("/report/:id/reviewed",[mdAuth.asureAuth], ReportController.markAsReviewed);

export const reportRoutes = router;
