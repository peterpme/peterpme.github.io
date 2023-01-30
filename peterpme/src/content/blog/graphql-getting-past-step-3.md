---
title: GraphQL Getting Past Step 3
date: 2020-02-19T06:00:00.000Z
---

GraphQL is becoming one of the most popular data query libraries in the world. This is a talk that I've converted into an article. Enjoy!

# First Version of Draftbit

- Node
- React
- Postgres
- Raw SQL Queries & knex (for the most part)
- GraphQL

[https://media.giphy.com/media/mIvrv5Qe0kHlu/giphy.mp4](https://media.giphy.com/media/mIvrv5Qe0kHlu/giphy.mp4)

Throwing stuff at the wall and hoping it sticks (it didn't)

> We quickly realized we weren't doing things the right way so we started rewriting new features

*Draftbit 1.1*
- ReasonML on the client ✅

*Draftbit 1.2*
- TypeORM ✅
- TypeScript on the Server ✅
- Prisma ✅

*Draftbit 1.3*
- Dataloader ✅
- Thinking about structuring our GraphQL queries more efficiently ✅✅✅
- Writing Tests ✅✅✅

### Good but not great

GraphQL field resolvers aren't being used correctly. The SQL is fast but because of how we're handling this in a nested data structure, its not necessarily taking full advantage of GraphQL.

This also meant that we were writing custom queries for every type of request we wanted, instead of being able to traverse the tree.

There are pros & cons to this (but mainly cons).

```jsx
const getAppById = async (
  _,
  { uuid },
  { db, user: { uuid: userId } },
  info
) => {
  let app;
  const result = await db.raw(
    `
        SELECT a.*,
        (
          SELECT COUNT(*)
          FROM app_screens a_s
          INNER JOIN screens s
          ON a_s.screen_id = s.id
          WHERE app_id = a.id
          AND s.is_deleted IS FALSE
        ) as num_screens
        FROM apps a
        WHERE a.uuid = ? AND a.is_deleted IS FALSE
      `,
    [uuid]
  );
```

## Much better

We're utilizing GraphQL's field resolver pattern correctly. Instead of having to re-write the same query, we were able to utilize `Dataloader` to fetch the id from cache on every tick

```jsx
t.list.field("app", {
  type: AppType,
  resolve: async ({ uuid }, _, { loaders }) => {
    return loaders.appsByWorkspaceUuid.load(uuid);
  },
});
```

# Dataloader

[https://github.com/graphql/dataloader](https://github.com/graphql/dataloader)

> DataLoader is a generic utility to be used as part of your application's data fetching layer to provide a simplified and consistent API over various remote data sources such as databases or web services via batching and caching.

*Dataloader works by taking an array of ids and returning an array of promises that fulfill that data

```jsx
function getComponents(arrayOfIds) {
  const components = getComponentsById(arrayofIds)
  return components
}

// ...

const componentLoader = new DataLoader(getComponents)

componentLoader.load("xyz-abc")
componentloader.loadMany([1, 2, 3])
```

I struggled getting this right for awhile and avoided dataloader. That was partially because we weren't using field resolvers correctly so I wasn't thinking about using it the right way.

# GraphQL Nexus

[https://github.com/prisma-labs/nexus](https://github.com/prisma-labs/nexus)

> Declarative, code-first and strongly typed GraphQL schema construction for TypeScript & JavaScript

GraphQL Nexus helps you write your graphql schema with typescript by generating definitions alongside of your code. It's allowed us to identify errors in the way that we return data very easily.

```jsx
import { queryType, stringArg, makeSchema } from "nexus";
import { GraphQLServer } from "graphql-yoga";

const Query = queryType({
  definition(t) {
    t.string("hello", {
      args: { name: stringArg({ nullable: true }) },
      resolve: (parent, { name }) => `Hello ${name || "World"}!`,
    });
  },
});

const schema = makeSchema({
  types: [Query],
  outputs: {
    schema: __dirname + "/generated/schema.graphql",
    typegen: __dirname + "/generated/typings.ts",
  },
});

const server = new GraphQLServer({
  schema,
});

server.start(() => `Server is running on http://localhost:4000`);
```

GraphQL Nexus doesn't do anything else besides constructing your graphql schema (code-first), which means that you don't have to use their stack or servers or whatever. All it will do is generate a `schema.graphql` file that you can include.

# TypeORM

[https://github.com/typeorm/typeorm](https://github.com/typeorm/typeorm)

> ORM for TypeScript and JavaScript (ES7, ES6, ES5). Supports MySQL, PostgreSQL, MariaDB, SQLite, MS SQL Server, Oracle, SAP Hana, WebSQL databases. Works in NodeJS, Browser, Ionic, Cordova and Electron platforms. [http://typeorm.io](http://typeorm.io/)

TypeORM is the ORM we use with our Postgres database. Instead of writing raw sql queries we're able to build and join entities easily that are typed.

```jsx
import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    age: number;
}
```

You create an entity file like this. It supports any type of database schema that you've got. Then all you have to do is write functions like:

```jsx
const allUsers = await User.find();
const firstUser = await User.findOne(1);
const peter = await User.findOne({ firstName: "Peter", lastName: "P" });
```

# Caching

- Database level
- ORM level
- Apollo Server level
- Apollo Client level

It's easy to forget about all the caching solutions we've had in the past that have been working great. At least I've forgotten about lower level tools that used to be a lot more popular: Nginx, HA Proxy, etc. 

These days there are modern solutions for caching that let you handle it through your application rather than outside of it.

## Caching in TypeORM

[https://typeorm.io/#/caching](https://typeorm.io/#/caching)

Once you set `cache:true` in your ormconfig, it will generate a `query-results-cache` table in your databae that'll cache operations for 1 second by default.

Caching is controlled by individual queries:

```jsx
const users = await connection
    .createQueryBuilder(User, "user")
    .where("user.isAdmin = :isAdmin", { isAdmin: true })
    .cache(true)
    .getMany();
```

If you want to change the amount of time spent caching you can also do `cache(5000)` or some arbitrary number to make that happen.

If you're using a multi database setup then you can also cache using a cluster or redis.

## Caching in Apollo

[https://www.apollographql.com/docs/apollo-server/performance/caching/](https://www.apollographql.com/docs/apollo-server/performance/caching/)

### Cache Hints

Cache hints are convenient to Apollo but apparently don't conform to the GraphQL spec. Use at your own risk (we decided against it)

```jsx
type Comment @cacheControl(maxAge: 1000) {
  post: Post!
}
```

### Full Response Cache

It uses memory LRU cache by default so if you're using multiple server instances (like Kubernetes or some crazier shit) it might make sense to use Redis (again)

You can utilize this to save your session headers instead of constantly trying to unravel on every request.

### Redis or MemCached Response Caching

If you'd prefer to save your cache in Redis (which is what we do) Apollo also offers caching using MemCached or Redis and its really simple to setup:

```jsx
const { RedisCache } = require('apollo-server-cache-redis');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cache: new RedisCache({
    host: 'redis-server',
  }),
});
```

## Persisted Queries

[https://www.apollographql.com/docs/apollo-server/performance/apq/](https://www.apollographql.com/docs/apollo-server/performance/apq/)

Persisted queries work by reducing the size of your query to a hash, saving bandwidth and improving network performance.

*You need to switch away from Apollo Boost for this to work. There is no server setup required

```jsx
import { createPersistedQueryLink } from "apollo-link-persisted-queries";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";

const link = createPersistedQueryLink().concat(createHttpLink({ uri: "/graphql" }));

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: link,
});
```

## Using GET requests for GraphQL

[https://www.apollographql.com/docs/apollo-server/performance/apq/#using-get-requests-with-apq-on-a-cdn](https://www.apollographql.com/docs/apollo-server/performance/apq/#using-get-requests-with-apq-on-a-cdn)

GraphQL queries are usually too long for a GET request which is why we use POST, but if you use APQ you can change that and have the request cached at the CDN level.

*This doesn't work with batching

# Fly.io

[https://fly.io/](https://fly.io/)

> Fly makes Heroku apps 50-80% faster. It's like a CDN but for server processes & app data

Fly sets our servers up at the edge so they load a lot faster. I don't necessarily understand all the specifics, but working with Kurt to make this a reality at Draftbit has been a great experience.

Fly also includes a redis for every server you deploy and that's exciting on its own

# GraphQL Cost Analysis

[https://github.com/pa-bru/graphql-cost-analysis](https://github.com/pa-bru/graphql-cost-analysis)

> This can be used to protect your GraphQL servers against DoS attacks, compute the data consumption per user and limit it.

It's very easy to set up and add it into your middleware. It's supported by everything from `express-graphql` to `apollo-server`

```jsx
import costAnalysis from 'graphql-cost-analysis'

const costAnalyzer = costAnalysis({
  maximumCost: 1000,
})
```

You can customize different costs for different queries so you understand what the data consumption is per user or per request. 

It's easy to track down situations where somebody is hijacking your GraphQL server and trying to access information that maybe they shouldn't be.

# GraphQL Depth Limit

[https://github.com/stems/graphql-depth-limit](https://github.com/stems/graphql-depth-limit)

> Dead-simple defense against unbounded GraphQL queries. Limit the complexity of the queries solely by their depth.

Since GraphQL can recursively build a tree of your data, it's really simple to write a query that breaks your server. By setting the depth limit you limit the risk of someone being able to do something like this:

```graphql
query BreakTheServer {
  users {
    apps {
      users {
        apps {
          users {
            apps {
             users {
               apps {
               }
             }
           }
          }
        }
      }
    }
  }
}
```

# GraphQL Rate Limit

[https://github.com/teamplanes/graphql-rate-limit](https://github.com/teamplanes/graphql-rate-limit)

> A GraphQL Rate Limiter to add basic but granular rate limiting to your Queries or Mutations.

You can rate limit the amount of requests that are happening on the GraphQL level to prevent from random shit from hitting the fan 😅

We already use GraphQL Shield at Draftbit so this pattern is really easy to setup:

```jsx
import { createRateLimitRule } from 'graphql-rate-limit';

const rateLimitRule = createRateLimitRule({ identifyContext: (ctx) => ctx.id });

const permissions = shield({
  Query: {
    // Step 2: Apply the rate limit rule instance to the field with config
    getItems: rateLimitRule({ window: "1s", max: 5 })
  }
});
```

The nice part about this is that everything lives inside the Javascript world and not the GraphQL world. It makes it easy for us to fine tune it (and it can be type-checked).

# Other Useful Tools

- toobusy-js
    - [https://github.com/STRML/node-toobusy](https://github.com/STRML/node-toobusy)
    - Stay responsive under extreme load
- rate-limiter
    - [https://github.com/microlinkhq/async-ratelimiter](https://github.com/microlinkhq/async-ratelimiter)
    - limit the number of calls that are taking place, backed by redis
    - A tip is to use your user's session variables but if that's not available, you can limit it by the ip using the additional `request-ip` package
- reason
    - [https://reasonml.github.io/](https://reasonml.github.io/)
- OneGraph
    - https://onegraph.io

- token refresh
    - [https://github.com/newsiberian/apollo-link-token-refresh](https://github.com/newsiberian/apollo-link-token-refresh)

# Thanks!

Thanks to Tracy, Ann, Pato and This Dot Labs for hosting. It's been an honor speaking alongside of Shawn too who is a very well known figure in the community.

# Questions / Answers
