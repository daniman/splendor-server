# splendor-server
A node GraphQL server that provides the mechanics of the Splendor board game.

Game state is persisted using *redis*. If you are developing locally you need to
install redis and have it running.

On MacOS:
```
$ brew install redis
$ redis-server
```
Run the server with:
```
node index.js
```
