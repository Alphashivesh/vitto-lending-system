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
                url: 'https://vitto-lending-system-81ee.onrender.com',
                description: 'Live Render Production Server',
            },
            {
                url: 'http://localhost:5000',
                description: 'Local Development Server',
            },
        ],
        paths: {
            '/api/business/profile': {
                post: {
                    summary: 'Create a new business profile',
                    tags: ['Business'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['owner_name', 'pan', 'business_type', 'monthly_revenue'],
                                    properties: {
                                        owner_name: { type: 'string', example: 'Rajesh Kumar' },
                                        pan: { type: 'string', example: 'ABCDE1234F' },
                                        business_type: { type: 'string', example: 'Retail' },
                                        monthly_revenue: { type: 'number', example: 150000 }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': { description: 'Business profile created successfully' },
                        '400': { description: 'Validation error' }
                    }
                }
            },
            '/api/loan/apply': {
                post: {
                    summary: 'Submit a loan application for an existing business',
                    tags: ['Loan'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['business_id', 'requested_amount', 'tenure_months', 'purpose'],
                                    properties: {
                                        business_id: { type: 'integer', example: 1 },
                                        requested_amount: { type: 'number', example: 500000 },
                                        tenure_months: { type: 'integer', example: 12 },
                                        purpose: { type: 'string', example: 'Working Capital Expansion' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': { description: 'Loan application submitted with Pending status' },
                        '400': { description: 'Validation error' }
                    }
                }
            },
            '/api/decision/{loanId}/evaluate': {
                post: {
                    summary: 'Trigger async background credit evaluation for a loan',
                    tags: ['Decision Engine'],
                    parameters: [{ in: 'path',
                        name: 'loanId',
                        required: true,
                        schema: { type: 'integer' },
                        description: 'The loan application ID'
                    }],
                    responses: {
                        '202': { description: 'Evaluation request accepted and processing started in background' },
                        '404': { description: 'Loan application not found' }
                    }
                }
            },
            '/api/decision/{loanId}/status': {
                get: {
                    summary: 'Poll the current status of a loan credit evaluation',
                    tags: ['Decision Engine'],
                    parameters: [{ in: 'path',
                        name: 'loanId',
                        required: true,
                        schema: { type: 'integer' },
                        description: 'The loan application ID'
                    }],
                    responses: {
                        '200': { description: 'Returns current status along with score and reasons' },
                        '404': { description: 'Loan or decision record not found' }
                    }
                }
            }
        }
    },
    apis: [], // No file scanning needed; paths are defined inline above!
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('📄 Swagger API Documentation available at /api-docs');
};

module.exports = setupSwagger;