module.exports = {
  'onboarding-api': {
    output: {
      mode: 'split',
      target: 'src/lib/api/endpoints.ts',
      schemas: 'src/lib/api/schemas',
      client: 'axios',
      mock: false,
      override: {
        mutator: {
          path: './src/lib/api/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
    input: {
      target: 'http://127.0.0.1:8000/openapi.json',
    },
  },
};