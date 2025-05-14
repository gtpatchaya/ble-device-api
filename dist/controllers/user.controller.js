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
exports.userController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prismaClient_1 = __importDefault(require("../prismaClient"));
const response_1 = require("../utils/response");
exports.userController = {
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { name, email, password } = req.body;
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const user = yield prismaClient_1.default.user.create({
                data: { name, email, password: hashedPassword },
            });
            res.status(201).json((0, response_1.successResponse)(201, 'User created', user));
        }
        catch (error) {
            res.status(500).json({ error: 'Error creating user' });
        }
    }),
    getAll: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const users = yield prismaClient_1.default.user.findMany();
            res.status(200).json((0, response_1.successResponse)(200, 'Success', users));
        }
        catch (error) {
            res.status(500).json({ error: 'Error fetching users' });
        }
    }),
    getById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield prismaClient_1.default.user.findUnique({ where: { id: req.params.id } });
            if (user) {
                res.status(200).json((0, response_1.successResponse)(200, 'Success', user));
            }
            else {
                res.status(404).json((0, response_1.successResponse)(404, 'User not found', null));
            }
        }
        catch (error) {
            res.status(500).json((0, response_1.successResponse)(500, 'Internal server error', null));
        }
    }),
    update: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { name, email } = req.body;
            const user = yield prismaClient_1.default.user.update({
                where: { id: req.params.id },
                data: { name, email },
            });
            res.status(200).json((0, response_1.successResponse)(200, 'User updated', user));
        }
        catch (error) {
            res.status(500).json({ error: 'Error updating user' });
        }
    }),
    remove: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield prismaClient_1.default.user.delete({
                where: { id: req.params.id },
            });
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: 'Error deleting user' });
        }
    }),
};
