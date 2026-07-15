"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const promises_1 = require("fs/promises");
const path = require("path");
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;
let UploadService = class UploadService {
    async uploadImage(file) {
        if (!file)
            throw new common_1.BadRequestException('No file provided');
        if (!ALLOWED_TYPES.includes(file.mimetype))
            throw new common_1.BadRequestException('Only PNG, JPEG, GIF, and WEBP are allowed');
        if (file.size > MAX_SIZE)
            throw new common_1.BadRequestException('File must be 5MB or smaller');
        const ext = path.extname(file.originalname).toLowerCase();
        const safeExt = /^\.[a-z0-9]+$/.test(ext) ? ext : '';
        const filename = `${(0, crypto_1.randomUUID)()}${safeExt}`;
        const uploadsDir = path.join(process.cwd(), '..', 'public', 'uploads');
        await (0, promises_1.mkdir)(uploadsDir, { recursive: true });
        await (0, promises_1.writeFile)(path.join(uploadsDir, filename), file.buffer);
        return { url: `/uploads/${filename}` };
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)()
], UploadService);
//# sourceMappingURL=upload.service.js.map