---
title: Reason Apollo Cache Update Patterns
---

`refetchQueries` are great when you need to refetch data that's not easy to handle with cache updates. Updating the cache using an optimistic response reduces the amount of requests and lets you handle the whole operation on the client and updating / removing from a list of resources.

`optimisticResponse` will immediately return back a fake object that mimics the response the server would return on success. The update function therefore is called twice. Once for the optimisticResponse (instant) and the second time when the server responds successfully.

**Relevant reading:**

- [https://www.apollographql.com/docs/react/performance/optimistic-ui/](https://www.apollographql.com/docs/react/performance/optimistic-ui/)

`update` will allow you to access the cached update on the client and add or remove items from a list. This automatically happens with `update` requests but you do need to update the cache manually for creating and deleting requests.

You should model your optimistic response exactly the same, except for the `uuid` we should include something random and temporarily. If we had the `id` value we'd use -1 but since `uuid` is a string you can use `xyz123`. The value is arbitrary and is immediately replaced.

**More Relevant reading:**

- [https://www.apollographql.com/docs/react/caching/cache-interaction/](https://www.apollographql.com/docs/react/caching/cache-interaction/)

This is an example of what an optimistic response looks like:

```reason
module OptimisticRemove = {
  type t = {
    .
    "__typename": string,
    "removeAsset": string,
  };

  external cast: t => Js.Json.t = "%identity";

  let make = (~uuid) => {
    {"__typename": "Mutation", "removeAsset": uuid}->cast;
  };
};

module RemoveAsset = [%graphql
  {|
    mutation RemoveAsset($uuid: ID!) {
      removeAsset(uuid: $uuid)
    }
  |}
];
```

### ** Note: You'll need to add `__typename: string` to your GraphQL response type!

This is how we call the creation of the optimistic response. We pass in a uuid because its what we pass into the real request. In this case its `uuid` but it could be `asset` or `screen` or any other resource.

```reason
`let variables = AssetQueries.RemoveAsset.makeVariables(~uuid, ());
    removeAssetMutation(
      ~variables,
/* --- */
      ~optimisticResponse=AssetQueries.OptimisticRemove.make(~uuid),
/* --- */
      (),
    )
    |> ignore;
```

You can now use optimisticResponse with an update which immediately removes an item from the list (same instructions for adding):

```reason
let (mutateRemoveAsset, _, _) =
    ApolloHooks.useMutation(
      AssetQueries.RemoveAsset.definition,
      ~update={AssetQueries.removeFromCache(appUuid, assetType)}
)
```

`removeFromCache`:

```reason
let removeFromCache = (appUuid, assetType, client, mutationResult) => {
	/* mutationResult gives you access to the result of the fake and real mutation*/
	switch(mutationResult##data) {
	| None => ()
  | Some(data) =>
		let assetUuid = data##removeAsset;
	  
	  /* build the query the same way you would in your request */
	  let query =
	    AssetQueries.GetAssets.make(
	      ~filter={"appUuid": appUuid, "fileType": Some(assetType)},
	      (),
	    );
	  let readQueryOptions = toReadQueryOptions(query);

	  /* read the query and get the local, cached data */
	  switch (AssetReadQuery.readQuery(client, readQueryOptions)) {
	  /* if there is no cached data, apollo throws so this just catches the throw */
	  | exception _ => ()
	  | cachedResponse =>
	    switch (cachedResponse |> Js.Nullable.toOption) {
	    /* if there is no cached data because its nullable, just move on */
	    | None => ()
	    | Some(cachedAssets) =>
	      /* BS7 feature that wraps Json and gives you record access */
	      let cachedData = cast(cachedAssets);

	      let data = {
	        "assets":
	          /* for a remove, filter out the assetUuid from the list * /
	          Belt.Array.keep(cachedData##assets, asset => {
	            asset.uuid !== assetUuid
	          }),
	      };

	      /* write the query back to cache. You're done! */
	      AssetWriteQuery.make(~client, ~variables=query##variables, ~data, ());
    }
  };
  };
};
```

There are three lines you need to add to the top of the file to access the cache requests.

```reason
external cast: Js.Json.t => AssetQueries.GetAssets.t = "%identity";

module AssetReadQuery = ApolloClient.ReadQuery(AssetQueries.GetAssets);
module AssetWriteQuery = ApolloClient.WriteQuery(AssetQueries.GetAssets);
```

[External cast](https://bucklescript.github.io/docs/en/intro-to-external#special-identity-external) is bs7's way of handling casting the raw array of objects as a record:

```reason
external cast: Js.Json.t => AssetQueries.GetAssets.t = "%identity";
```

Full file:

```reason
module GetAssets = [%graphql
  {|
    query GetAssets($filter: AssetFilter!) {
      assets(filter: $filter) @bsRecord {
        __typename
        uuid
        fileName
        fileType
        mimeType
        url
        slug
        snackUrl
     }
    }
  |}
];

external cast: Js.Json.t => GetAssets.t = "%identity";

module AssetReadQuery = ApolloClient.ReadQuery(GetAssets);
module AssetWriteQuery = ApolloClient.WriteQuery(GetAssets);

module OptimisticCreate = {
  type t = {
    .
    "__typename": string,
    "createAsset": {
      .
      "__typename": string,
      "uuid": string,
      "fileName": string,
      "fileType": string,
      "mimeType": string,
      "url": string,
      "slug": string,
      "snackUrl": option(string),
    },
  };

  external cast: t => Js.Json.t = "%identity";

  let make = (~asset) => {
    {
      "__typename": "Mutation",
      "createAsset": {
        "__typename": asset.__typename,
        "uuid": asset.uuid,
        "fileName": asset.fileName,
        "fileType": asset.fileType,
        "mimeType": asset.mimeType,
        "url": asset.url,
        "slug": asset.slug,
        "snackUrl": asset.snackUrl,
      },
    }
    ->cast;
  };
};

module CreateAsset = [%graphql
  {|
    mutation CreateAsset($input: CreateAssetInput!) {
      createAsset(input: $input) {
        uuid
        fileName
        fileType
        mimeType
        url
        slug
        snackUrl
      }
    }
  |}
];

module OptimisticRemove = {
  type t = {
    .
    "__typename": string,
    "removeAsset": string,
  };

  external cast: t => Js.Json.t = "%identity";

  let make = (~uuid) => {
    {"__typename": "Mutation", "removeAsset": uuid}->cast;
  };
};

module RemoveAsset = [%graphql
  {|
    mutation RemoveAsset($uuid: ID!) {
      removeAsset(uuid: $uuid)
    }
  |}
];

let removeFromCache = (appUuid, assetType, client, mutationResult) => {
  switch (mutationResult##data) {
  | None => ()
  | Some(data) =>
    let assetUuid = data##removeAsset;
    let query =
      GetAssets.make(
        ~filter={"appUuid": appUuid, "fileType": Some(assetType)},
        (),
      );
    let readQueryOptions = toReadQueryOptions(query);
    switch (AssetReadQuery.readQuery(client, readQueryOptions)) {
    | exception _ => ()
    | cachedResponse =>
      switch (cachedResponse |> Js.Nullable.toOption) {
      | None => ()
      | Some(cachedAssets) =>
        let cachedData = cast(cachedAssets);

        let data = {
          "assets":
            Belt.Array.keep(cachedData##assets, asset => {
              asset.uuid !== assetUuid
            }),
        };

        AssetWriteQuery.make(~client, ~variables=query##variables, ~data, ());
      }
    };
  };
};
```

## Other

- Interesting GH issue: [https://github.com/Astrocoders/reason-apollo-hooks/issues/61](https://github.com/Astrocoders/reason-apollo-hooks/issues/61)
