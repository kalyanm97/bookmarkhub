"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(HttpExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const req = ctx.getRequest();
        const status = exception instanceof common_1.HttpException ? exception.getStatus() : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const response = exception instanceof common_1.HttpException ? exception.getResponse() : { message: String(exception) };
        if (status >= 500) {
            this.logger.error('Unhandled exception: ' + String(exception), { url: req.url, method: req.method, body: req.body });
        }
        else {
            this.logger.warn('Handled exception', JSON.stringify(response));
        }
        const payload = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: req.url,
            error: typeof response === 'string' ? response : response.message ?? response,
        };
        const r = res;
        try {
            if (typeof r.status === 'function') {
                const candidate = r.status(status);
                if (candidate && typeof candidate.json === 'function') {
                    candidate.json(payload);
                }
                else if (candidate && typeof candidate.send === 'function') {
                    candidate.send(payload);
                }
                else if (typeof r.send === 'function') {
                    r.send(payload);
                }
                else if (typeof r.json === 'function') {
                    r.json(payload);
                }
            }
            else if (typeof r.send === 'function') {
                r.send(payload);
            }
            else if (typeof r.json === 'function') {
                r.json(payload);
            }
        }
        catch (err) {
            this.logger.error('Failed to send error response', String(err));
        }
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
