"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const passport_1 = __importDefault(require("passport"));
require("./config/passport"); // Import passport config
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const device_route_1 = __importDefault(require("./routes/device.route"));
const deviceUserRoutes_1 = __importDefault(require("./routes/deviceUserRoutes"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const app = (0, express_1.default)();
// Middleware
app.use((0, morgan_1.default)('dev'));
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
// Initialize Passport
app.use(passport_1.default.initialize());
// Routes
app.use('/api/v1/auth', auth_route_1.default);
app.use('/api/v1/device', device_route_1.default);
app.use('/api/v1/user', user_route_1.default);
app.use('/api/v1/device-user', deviceUserRoutes_1.default);
exports.default = app;
