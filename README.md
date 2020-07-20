# splendor-server
A node GraphQL server that provides the mechanics of the [Splendor board game](https://en.wikipedia.org/wiki/Splendor_(game)).

Game state is persisted using *redis*. If you are developing locally, you'll need to
install redis and have it running.

On MacOS:
```
$ brew install redis
$ redis-server
```

Run the server for general development:
```
node index.js
```

**Note:** If you would like to use Apollo Studio to query `localhost:4000` and view metrics from your server, rather than GraphQL Playground, visit the [`splendor` graph's settings page](https://engine.apollographql.com/graph/splendor/settings) to get an API Key, then run your server with an `APOLLO_KEY`, like so:
```
APOLLO_KEY=service:splendor:XXXX_YYYY_ZZZZ node index.js
```

You'll be able to view the graph at https://studio.apollographql.com/graph/splendor.
