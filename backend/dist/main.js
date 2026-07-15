"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const cookieParser = require("cookie-parser");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('StudyNest API')
        .setDescription('REST API for the StudyNest interview prep app. Protected routes require an `auth_token` cookie set via login.')
        .setVersion('1.0')
        .addCookieAuth('auth_token')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        customSiteTitle: 'StudyNest API Docs',
        swaggerOptions: {
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
            docExpansion: 'none',
            deepLinking: true,
            persistAuthorization: true,
            filter: true,
        },
        customCss: `
      * { box-sizing: border-box; }
      html, body { background: #0b0f1a !important; margin: 0; }
      .swagger-ui { background: #0b0f1a; font-family: 'Inter', system-ui, sans-serif; color: #e2e8f0; }

      /* ── Topbar ── */
      .swagger-ui .topbar { background: #0b0f1a; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 10px 0; }
      .swagger-ui .topbar .topbar-wrapper { padding: 0 24px; }
      .swagger-ui .topbar a.link span { color: #e2e8f0; font-weight: 600; font-size: 1.05rem; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }

      /* ── Info ── */
      .swagger-ui .info { margin: 24px 0 12px; }
      .swagger-ui .info .title { color: #e2e8f0; font-size: 1.5rem; }
      .swagger-ui .info p, .swagger-ui .info li, .swagger-ui .info td { color: #94a3b8; }
      .swagger-ui .info a { color: #818cf8; }
      .swagger-ui .info code { background: #1e293b; color: #a5b4fc; padding: 1px 5px; border-radius: 4px; }
      .swagger-ui .info .base-url { color: #475569; }

      /* ── Scheme bar ── */
      .swagger-ui .scheme-container { background: #0b0f1a; box-shadow: none; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 10px 0; }
      .swagger-ui .servers-title, .swagger-ui .schemes-title { color: #475569; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em; }
      .swagger-ui .servers select { background: #161d2e; color: #e2e8f0; border: 1px solid #2d3748; border-radius: 6px; }

      /* ── Tag group headings ── */
      .swagger-ui .opblock-tag { color: #e2e8f0 !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; font-size: 0.9rem; font-weight: 600; padding: 10px 4px; }
      .swagger-ui .opblock-tag:hover { background: rgba(99,102,241,0.07) !important; border-radius: 6px; }
      .swagger-ui .opblock-tag small { color: #475569; font-weight: 400; font-size: 0.78rem; }
      .swagger-ui .opblock-tag-section { margin-bottom: 2px; }
      .swagger-ui .opblock-tag svg { fill: #475569; }

      /* ── Operation rows ── */
      .swagger-ui .opblock { border-radius: 8px !important; border: 1px solid rgba(255,255,255,0.07) !important; background: #161d2e !important; margin-bottom: 5px !important; box-shadow: none !important; }
      .swagger-ui .opblock.opblock-get    { border-left: 3px solid #3b82f6 !important; }
      .swagger-ui .opblock.opblock-post   { border-left: 3px solid #10b981 !important; }
      .swagger-ui .opblock.opblock-put    { border-left: 3px solid #f59e0b !important; }
      .swagger-ui .opblock.opblock-patch  { border-left: 3px solid #8b5cf6 !important; }
      .swagger-ui .opblock.opblock-delete { border-left: 3px solid #ef4444 !important; }
      .swagger-ui .opblock .opblock-summary { background: transparent !important; border-bottom: none !important; padding: 8px 12px; }
      .swagger-ui .opblock.is-open .opblock-summary { border-bottom: 1px solid rgba(255,255,255,0.07) !important; }
      .swagger-ui .opblock .opblock-summary-path,
      .swagger-ui .opblock .opblock-summary-path__deprecated { color: #e2e8f0 !important; font-size: 0.84rem; }
      .swagger-ui .opblock .opblock-summary-description { color: #64748b !important; font-size: 0.78rem; }
      .swagger-ui .opblock-summary-control { background: transparent !important; }

      /* ── Expanded body ── */
      .swagger-ui .opblock-body { background: #0f1624 !important; border-radius: 0 0 8px 8px; }
      .swagger-ui .opblock-section-header { background: #0f1624 !important; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 8px 16px; }
      .swagger-ui .opblock-section-header h4,
      .swagger-ui .opblock-section-header label { color: #64748b !important; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
      .swagger-ui .opblock-description-wrapper p { color: #94a3b8; }

      /* ── Method badges ── */
      .swagger-ui .opblock-summary-method { border-radius: 5px !important; font-size: 0.64rem !important; font-weight: 700 !important; min-width: 60px !important; text-align: center !important; letter-spacing: 0.05em; }

      /* ── Tables ── */
      .swagger-ui table { background: transparent !important; }
      .swagger-ui table thead tr { background: transparent !important; }
      .swagger-ui table thead tr td, .swagger-ui table thead tr th { color: #475569 !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.07em; background: transparent !important; }
      .swagger-ui table tbody tr { background: transparent !important; }
      .swagger-ui table tbody tr:hover { background: rgba(255,255,255,0.02) !important; }
      .swagger-ui table tbody tr td { color: #94a3b8 !important; border-bottom: 1px solid rgba(255,255,255,0.04) !important; background: transparent !important; }
      .swagger-ui .parameter__name { color: #e2e8f0 !important; font-size: 0.83rem; }
      .swagger-ui .parameter__type { color: #818cf8 !important; font-size: 0.74rem; }
      .swagger-ui .parameter__in { color: #475569 !important; font-size: 0.7rem; font-style: italic; }
      .swagger-ui .parameter__deprecated { color: #ef4444 !important; }
      .swagger-ui .parameters-col_description p { color: #94a3b8; margin: 0; font-size: 0.82rem; }
      .swagger-ui .parameters-col_description input { width: 100%; }
      .swagger-ui label { color: #94a3b8 !important; font-size: 0.8rem; }
      .swagger-ui .markdown p { color: #94a3b8; font-size: 0.83rem; }

      /* ── Code blocks / responses ── */
      .swagger-ui pre, .swagger-ui .microlight { background: #070b14 !important; color: #c4d3e8 !important; border: 1px solid rgba(255,255,255,0.06) !important; border-radius: 6px; font-size: 0.79rem; line-height: 1.6; }
      .swagger-ui .highlight-code { background: #070b14 !important; border-radius: 6px; }
      .swagger-ui .highlight-code > .microlight { border: none !important; }
      .swagger-ui .responses-wrapper { background: transparent !important; }
      .swagger-ui .responses-inner { background: transparent !important; }
      .swagger-ui .response { background: transparent !important; }
      .swagger-ui .response-col_status { color: #e2e8f0 !important; font-weight: 600; font-size: 0.85rem; }
      .swagger-ui .response-col_description { color: #94a3b8 !important; }
      .swagger-ui .response-col_links { color: #64748b !important; }
      .swagger-ui .response .response-col_description .markdown { color: #94a3b8; }
      .swagger-ui .renderedMarkdown p { color: #94a3b8; font-size: 0.82rem; }

      /* ── Tab buttons (Example Value / Schema) ── */
      .swagger-ui .tab { background: transparent !important; }
      .swagger-ui .tab li { color: #64748b !important; border-bottom: 2px solid transparent; font-size: 0.78rem; font-weight: 500; }
      .swagger-ui .tab li.active { color: #818cf8 !important; border-bottom-color: #6366f1 !important; }
      .swagger-ui .tab li button { color: inherit !important; background: transparent !important; }

      /* ── Content-type selector ── */
      .swagger-ui .content-type { background: #161d2e !important; color: #e2e8f0 !important; border: 1px solid #2d3748 !important; border-radius: 6px !important; font-size: 0.8rem; }

      /* ── Request body ── */
      .swagger-ui .body-param { background: transparent !important; }
      .swagger-ui .body-param__text { background: #070b14 !important; color: #c4d3e8 !important; border: 1px solid rgba(255,255,255,0.07) !important; border-radius: 6px !important; font-size: 0.8rem; }

      /* ── Live response (after Execute) ── */
      .swagger-ui .live-responses-container { background: transparent !important; }
      .swagger-ui .request-url { background: #070b14 !important; border: 1px solid rgba(255,255,255,0.06) !important; border-radius: 6px; padding: 8px 12px; }
      .swagger-ui .request-url pre { background: transparent !important; border: none !important; color: #a5b4fc !important; }
      .swagger-ui .curl-command { background: #070b14 !important; border: 1px solid rgba(255,255,255,0.06) !important; border-radius: 6px; }
      .swagger-ui .curl-command .curl { color: #c4d3e8 !important; }
      .swagger-ui .request-snippet-container { background: transparent !important; }
      .swagger-ui .response-loading-status { color: #94a3b8; }

      /* ── Inputs (try-it-out mode) ── */
      .swagger-ui input[type=text], .swagger-ui input[type=password],
      .swagger-ui input[type=search], .swagger-ui input[type=email],
      .swagger-ui textarea, .swagger-ui select {
        background: #0f1624 !important; color: #e2e8f0 !important;
        border: 1px solid #2d3748 !important; border-radius: 6px !important;
        font-size: 0.82rem; outline: none;
      }
      .swagger-ui input:focus, .swagger-ui textarea:focus, .swagger-ui select:focus {
        border-color: #6366f1 !important; box-shadow: 0 0 0 2px rgba(99,102,241,0.15) !important;
      }
      .swagger-ui input[disabled], .swagger-ui textarea[disabled] { opacity: 0.4; }

      /* ── Buttons ── */
      .swagger-ui .btn { border-radius: 6px !important; font-size: 0.8rem !important; font-weight: 600 !important; transition: opacity 0.15s; }
      .swagger-ui .btn.execute { background: #6366f1 !important; border-color: #6366f1 !important; color: #fff !important; }
      .swagger-ui .btn.execute:hover { opacity: 0.88; }
      .swagger-ui .btn.cancel  { background: transparent !important; border-color: #ef4444 !important; color: #ef4444 !important; }
      .swagger-ui .btn.try-out__btn { background: transparent !important; border: 1px solid #2d3748 !important; color: #94a3b8 !important; }
      .swagger-ui .btn.try-out__btn:hover { border-color: #6366f1 !important; color: #818cf8 !important; }
      .swagger-ui .btn.try-out__btn.cancel { border-color: #ef4444 !important; color: #ef4444 !important; }
      .swagger-ui .btn.clear { background: transparent !important; border: 1px solid #2d3748 !important; color: #64748b !important; }
      .swagger-ui .authorization__btn { background: transparent; border: 1px solid #6366f1; border-radius: 6px; padding: 4px 10px; }
      .swagger-ui .authorization__btn svg { fill: #818cf8; }
      .swagger-ui .copy-to-clipboard { background: #1e293b !important; border: 1px solid #2d3748 !important; border-radius: 4px; }
      .swagger-ui .copy-to-clipboard button { background: transparent; }
      .swagger-ui .copy-to-clipboard svg { fill: #64748b; }

      /* ── Models (schema section at bottom) ── */
      .swagger-ui section.models { background: #161d2e; border: 1px solid rgba(255,255,255,0.07) !important; border-radius: 8px; margin-top: 20px; }
      .swagger-ui section.models.is-open { background: #161d2e; }
      .swagger-ui section.models h4 { color: #e2e8f0 !important; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 12px 16px; font-size: 0.82rem; letter-spacing: 0.05em; }
      .swagger-ui section.models h4 svg { fill: #64748b; }
      .swagger-ui .model-container { background: #0f1624 !important; border-radius: 6px; margin: 8px 0; border: 1px solid rgba(255,255,255,0.05) !important; }
      .swagger-ui .model-box { background: #070b14 !important; border-radius: 6px; }
      .swagger-ui .model { color: #e2e8f0 !important; font-size: 0.82rem; }
      .swagger-ui .model-title { color: #e2e8f0 !important; font-weight: 600; }
      .swagger-ui .model span { color: #94a3b8; }
      .swagger-ui .model .property { color: #e2e8f0; }
      .swagger-ui .model .property.primitive { color: #818cf8; }
      .swagger-ui .prop-type { color: #818cf8 !important; }
      .swagger-ui .prop-format { color: #475569 !important; }
      .swagger-ui .model-toggle { background: transparent !important; }
      .swagger-ui .model-toggle svg { fill: #64748b; }

      /* ── Auth modal ── */
      .swagger-ui .dialog-ux .modal-ux-overlay { background: rgba(0,0,0,0.75); }
      .swagger-ui .dialog-ux .modal-ux { background: #161d2e !important; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; }
      .swagger-ui .dialog-ux .modal-ux-header { background: #161d2e !important; border-bottom: 1px solid rgba(255,255,255,0.07); border-radius: 12px 12px 0 0; padding: 16px 20px; }
      .swagger-ui .dialog-ux .modal-ux-header h3 { color: #e2e8f0 !important; font-size: 1rem; }
      .swagger-ui .dialog-ux .modal-ux-header .close-modal { background: transparent; }
      .swagger-ui .dialog-ux .modal-ux-header .close-modal svg { fill: #64748b; }
      .swagger-ui .dialog-ux .modal-ux-content { background: #161d2e !important; padding: 16px 20px; border-radius: 0 0 12px 12px; }
      .swagger-ui .dialog-ux .modal-ux-content p { color: #94a3b8 !important; font-size: 0.82rem; }
      .swagger-ui .dialog-ux .modal-ux-content h4 { color: #e2e8f0 !important; font-size: 0.85rem; }
      .swagger-ui .auth-container { background: transparent !important; }
      .swagger-ui .scopes h2 { color: #94a3b8; font-size: 0.8rem; }
      .swagger-ui .scope-def { color: #94a3b8; }

      /* ── Filter bar ── */
      .swagger-ui .filter { background: #0b0f1a; padding: 8px 0; }
      .swagger-ui .filter .operation-filter-input { background: #161d2e !important; border: 1px solid #2d3748 !important; color: #e2e8f0 !important; border-radius: 6px !important; font-size: 0.83rem; padding: 6px 10px; width: 100%; }

      /* ── SVG / icons ── */
      .swagger-ui svg { fill: #64748b; }
      .swagger-ui .expand-operation svg { fill: #475569; }
      .swagger-ui .unlocked svg, .swagger-ui .locked svg { fill: #818cf8; }
      .swagger-ui .chevron-up svg, .swagger-ui .arrow { fill: #475569; }

      /* ── No-response placeholder ── */
      .swagger-ui .no-response { color: #475569; }

      /* ── Scrollbar ── */
      ::-webkit-scrollbar { width: 5px; height: 5px; }
      ::-webkit-scrollbar-track { background: #0b0f1a; }
      ::-webkit-scrollbar-thumb { background: #2d3748; border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: #475569; }
    `,
    });
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`NestJS backend running on http://localhost:${port}/api`);
    console.log(`API docs available at http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map