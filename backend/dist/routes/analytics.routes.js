"use strict";
/**
 * Analytics Routes
 * Routes for analytics and insights
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_js_1 = require("../controllers/analytics.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// All analytics routes require authentication
router.use(auth_middleware_js_1.authenticate);
// Analytics endpoints
router.get('/trends', analytics_controller_js_1.analyticsController.getTrends);
router.get('/priorities', analytics_controller_js_1.analyticsController.getPriorities);
router.get('/productivity', analytics_controller_js_1.analyticsController.getProductivity);
router.get('/insights', analytics_controller_js_1.analyticsController.getInsights);
router.get('/dashboard', analytics_controller_js_1.analyticsController.getDashboardData);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map