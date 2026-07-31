const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Vitto MSME Lending Decision System API',
            version: '1.0.0',
            description: 'API documentation for the MSME Lending Decision Engine, featuring async polling, Joi validation, and rate limiting.',
        },
        servers: [{
                url: 'https://vitto-lending-system-81ee.onrender.com',
                description: 'Live Render Production Server',
            },
            {
                url: 'http://localhost:5000',
                description: 'Local Development Server',
            },
        ],
    },
    // Use absolute path resolution to guarantee swagger-jsdoc finds your routes on Render
    apis: [path.join(__dirname, '../routes/*.js')],
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('📄 Swagger API Documentation available at /api-docs');
};

module.exports = setupSwagger;