"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.login = exports.generateTokens = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const auth_1 = require("../utils/auth");
const response_1 = require("../utils/response");
// Environment variables validation
const requiredEnvs = {
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
};
// Validation schema for login request
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
// Generate JWT tokens
const generateTokens = (payload) => {
    const accessToken = jsonwebtoken_1.default.sign(payload, requiredEnvs.JWT_ACCESS_SECRET, { expiresIn: '10 Years' });
    const refreshToken = jsonwebtoken_1.default.sign(payload, requiredEnvs.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request body
        // const validatedData = loginSchema.parse(req.body);
        const { email, password } = req.body;
        console.log('Login request:', email);
        // Find user
        const user = yield prismaClient_1.default.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                name: true,
                dateOfBirth: true,
            },
        });
        if (!user) {
            res.status(401).json((0, response_1.successResponse)(401, 'error', null));
            return;
        }
        // Verify password
        const isValidPassword = yield bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json((0, response_1.successResponse)(401, 'error', 'รหัสผ่านผิด'));
            return;
        }
        // Generate tokens
        const tokens = (0, exports.generateTokens)({
            userId: user.id,
            email: user.email,
        });
        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', tokens.refreshToken, auth_1.cookieOptions);
        // Return success response with access token and user data
        res.status(200).json((0, response_1.successResponse)(200, 'success', {
            accessToken: tokens.accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                dateOfBirth: user.dateOfBirth,
            },
        }));
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: error.message,
            });
            return;
        }
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
});
exports.login = login;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(401).json({
                status: 'error',
                message: 'Refresh token not found',
            });
            return;
        }
        // Verify refresh token
        const decoded = jsonwebtoken_1.default.verify(refreshToken, requiredEnvs.JWT_REFRESH_SECRET);
        // Generate new tokens
        const tokens = (0, exports.generateTokens)({
            userId: decoded.userId,
            email: decoded.email,
        });
        // Set new refresh token
        res.cookie('refreshToken', tokens.refreshToken, auth_1.cookieOptions);
        res.status(200).json({
            status: 'success',
            data: {
                accessToken: tokens.accessToken,
            },
        });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid refresh token',
            });
            return;
        }
        console.error('Refresh token error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
});
exports.refreshToken = refreshToken;
const logout = (req, res) => {
    // Clear refresh token cookie
    res.clearCookie('refreshToken', auth_1.cookieOptions);
    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
    });
};
exports.logout = logout;
