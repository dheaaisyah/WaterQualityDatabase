import { Router } from 'express';
import { CrudHandler } from '../handler/crud_handler';
import { SensorHandler } from '../handler/sensor.handler';
import { SettingsHandler } from '../handler/settings.handler';
import { createLimiter, queryLimiter } from '../../../middleware/rateLimiter';
import { validateAqmsInput, logRequest, validateRequestSize } from '../../../middleware/security';

const router = Router();
const crudHandler = new CrudHandler();
const sensorHandler = new SensorHandler();
const settingsHandler = new SettingsHandler();

// Original CRUD routes
router.post(
    '/create',
    logRequest,
    createLimiter,
    validateRequestSize,
    validateAqmsInput,
    (req, res) => crudHandler.createData(req, res)
);

router.get(
    '/latest',
    logRequest,
    queryLimiter,
    (req, res) => crudHandler.queryNewData(req, res)
);

// Sensor monitoring routes
router.get(
    '/sensors/current',
    logRequest,
    queryLimiter,
    (req, res) => sensorHandler.getCurrentSensor(req, res)
);

router.get(
    '/sensors/range',
    logRequest,
    queryLimiter,
    (req, res) => sensorHandler.getSensorsByRange(req, res)
);

router.get(
    '/history',
    logRequest,
    queryLimiter,
    (req, res) => sensorHandler.getHistory(req, res)
);

router.get(
    '/history/chart',
    logRequest,
    queryLimiter,
    (req, res) => sensorHandler.getHistoryChart(req, res)
);

router.get(
    '/history/stats',
    logRequest,
    queryLimiter,
    (req, res) => sensorHandler.getHistoryStats(req, res)
);

router.get(
    '/history/export',
    logRequest,
    queryLimiter,
    (req, res) => sensorHandler.exportHistory(req, res)
);

// Settings routes
router.get(
    '/settings',
    logRequest,
    queryLimiter,
    (req, res) => settingsHandler.getSettings(req, res)
);

router.put(
    '/settings',
    logRequest,
    createLimiter,
    validateRequestSize,
    (req, res) => settingsHandler.updateSettings(req, res)
);

export default router;

