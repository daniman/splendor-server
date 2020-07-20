const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    graphVariant: 'local',
    apiKey: 'service:splendor:SaDSZzGf0avhRcSqD8z_Mg',
    graphVariant: process.env.NODE_ENV || 'local',
    reportSchema: true,
    sendHeaders: { all: true },
    sendVariableValues: { all: true },

    // URLs for reporting to Studio staging instead of Studio prod.
    // tracesEndpointUrl: 'https://engine-staging-report.apollodata.com',
    // schemaReportingUrl:
    // 'https://engine-staging-graphql.apollographql.com/api/graphql',
  },
  playground: true,
});

server
  .listen({
    port: process.env.PORT || 4000,
  })
  .then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
