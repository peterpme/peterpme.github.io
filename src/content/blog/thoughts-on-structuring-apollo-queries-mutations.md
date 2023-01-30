---
title: Thoughts on Structuring your Apollo Queries & Mutations
date: 2017-10-20T14:56:48.951Z
description: After using Apollo for the last few months, I've picked up some great patterns
categories: []
---

![Photo by [Patryk Grądys](https://unsplash.com/photos/4pPzKfd6BEg?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)](https://cdn-images-1.medium.com/max/800/1*X3AZL38e8zWBeXpZXxW0lQ.jpeg)
Photo by [Patryk Grądys](https://unsplash.com/photos/4pPzKfd6BEg?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

> [Rezz - Synthesia on Spotify](https://open.spotify.com/track/3Dfy5u28HChURIwcCL4Rto):
> This is what I listen to when I code. I wrote this article while listening to the entire album. Listen at your own risk _😃_

After using Apollo for the last few months, I’ve picked up some great patterns we’ve adopted at [Orchard](https://www.orchard.ai), where we’ve re-implemented an experience for our beta testers just about every week

> The faster we can build something, the sooner we can get feedback from our beta testers and the better chance we have of building an amazing product.

#### **Folder Structure:**

I don’t inline my queries. Maybe I’m cray cray, but I strongly believe in being able to search and reuse something as quickly as possible. [ag](https://github.com/ggreer/the_silver_searcher), [fzf](https://github.com/junegunn/fzf), [Alfred Workflows](https://www.alfredapp.com/workflows/) and [Nuclide search](https://nuclide.io/docs/features/quick-open/#code-search) are my best friends IRL. I try to be as descriptive as possible, even if that means a 40 character filename.

#### Here’s what that folder structure looks like:

```
/containers
/components
/utilities
/modals
/graphql
/queries
/mutations
```

I typically like to keep my folder structure flat. I’m ok with nesting GraphQL because I’ve realized over time that I can figure out if something is a query or a mutation without appending `mutation` or `query` to the end of the file.

#### Naming Conventions:

Mutations will always start with an action:

- `saveUserPushToken`
- `updateOnboardingProfile`
- `createUser`

Queries just describe what I’m looking for:

- `userProfile`
- `userConnections`
- `reminders`

Sometimes they’ll even look like this:

- `remindersWithNewFeatureOfSomeKind`
- `userProfileWithUserSettings`
- `userPrioritiesWithRemindersAtTheTop`

I don’t prefix them with anything because I already know they live under the `queries` folder no matter what I do. Besides, prefixing them with something like `get` may make it seem like an API action. Also, I tried it and didn’t like it.

#### File Structure:

I don’t like to keep them in the same file either because I literally spend more time scrolling than I do typing! What does each file look like? The way you’d expect:

```javascript
import gql from "graphql-tag";

const updateUsername = gql`
  mutation UpdateUsername($id: ID!, $username: String!) {
    updateUsername(id: $id, username: $username) {
      id
    }
  }
`;

export default updateUsername;
```

`updateUserProfile` will have its own file too!

This way no matter what, I can continue to move quickly, implement our new features from design and have an exact description of what each and every file is doing.

### Final Thoughts

I’ve fallen in love with this setup for my queries and mutations. I’ve rewritten our mutations and queries ~50 times and haven’t like I’ve been going against the grain yet.

That being said, this folder / file structure is not for everyone. Consult with your manager and co-worker and make sure that this folder structure is right for you.

Side effects include yelling at me online so don’t yell at me!

If you have a better way, I’m always open to new ideas: [Hit me up on Twitter](https://www.twitter.com/peterpme)

Ciao!

