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
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
// Local authentication routes
router.post('/login', auth_controller_1.login);
router.post('/refresh-token', auth_controller_1.refreshToken);
router.post('/logout', auth_controller_1.logout);
// Google OAuth routes
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport_1.default.authenticate('google', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        // Generate JWT tokens
        const tokens = (0, auth_controller_1.generateTokens)({
            userId: user.id,
            email: user.email,
        });
        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        // Redirect to frontend with access token
        res.send(tokens.accessToken);
        //res.redirect(
        // `${process.env.FRONTEND_URL}/auth/google/success?token=${}`
        // );
    }
    catch (error) {
        console.error('Google auth error:', error);
        // res.redirect(`${process.env.FRONTEND_URL}/auth/google/error`);
    }
}));
exports.default = router;
