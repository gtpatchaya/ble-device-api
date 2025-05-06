"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
function successResponse(statusCode, message, data) {
    return { statusCode, message, data };
}
