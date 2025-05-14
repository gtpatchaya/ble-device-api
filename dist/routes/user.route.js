"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// ✅ Public route
router.post('/', user_controller_1.userController.create);
// ✅ Protected routes
router.use(auth_middleware_1.authenticateToken);
router.get('/', user_controller_1.userController.getAll);
router.get('/:id', user_controller_1.userController.getById);
router.put('/:id', user_controller_1.userController.update);
router.delete('/:id', user_controller_1.userController.remove);
exports.default = router;
