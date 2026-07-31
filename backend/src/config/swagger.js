const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Vitto MSME Lending Decision System API',
            version: '1.0.0',
            description: 'API documentation for the MSME Lending Decision Engine, featuring async polling, Joi validation, and rate limiting.',
        },
        servers: [{
                url: 'http://localhost:5000',
                description: 'Local Development Server',
            },
            {
                url: 'https://vitto-lending-backend.onrender.com',
                description: 'Live Render Production Server',
            },
        ],
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('📄 Swagger API Documentation available at http://localhost:5000/api-docs');
};

module.exports = setupSwagger;