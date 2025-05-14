"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const initMockData_1 = require("./initMockData");
const PORT = process.env.PORT || 3000;
(0, initMockData_1.initMockData)().then(() => {
    index_1.default.listen(PORT, () => {
        console.log(`🚀 Server ready on http://localhost:${PORT}`);
    });
});
