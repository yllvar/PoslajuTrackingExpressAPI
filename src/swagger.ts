import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Poslaju Tracking API',
      version: '1.0.0',
      description: 'A simple API to track Poslaju parcels',
    },
    servers: [
      {
        url: 'https://your-rapidapi-url.com',
        description: 'RapidAPI server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const specs = swaggerJsdoc(options);

