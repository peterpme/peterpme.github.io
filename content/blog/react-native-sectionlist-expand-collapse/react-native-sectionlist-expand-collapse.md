---
title: React Native SectionList Expand & Collapse Guide
description: Getting a SectionList working with expand/collapse using the extraData prop and a Set data structure.
date: 2022-12-16T18:01:28.487Z
categories: [React Native]
---

React Native has a component called `SectionList` that will render things in sections. Think favorite foods:

- Deserts: ice cream, cheesecake
- Drinks: water, coke, beer

[!sectionlist-example](./sectionlist-example.png)

The not-so-obvious part is how you can create a collapsible version of this. By collapsible I mean, being able to hide the individual items upon tapping the header:

[!sectionlist-collapsed](./sectionlist-collapsed.png)


Luckily for you, getting it working is straight forward. The key is using the `extraData` prop for a SectionList. 

`extraData` just re-renders the list when you have to pass in new data somewhere (like changing the expand/collapse toggle state.

Then you can use `useState` and an array or a set to get it working. I use a `Set` here b/c it's easy, but in its purest form, here's all you need to know:

```javascript
 <SectionList
    sections={DATA}
    extraData={expandedSections} // extraData is required to re-render the list when expandedSections changes
    keyExtractor={(item, index) => item + index}
    renderItem={({ section: { title }, item }) => {
      // check to see if the section is expanded
      const isExpanded = expandedSections.has(title);

      //return null if it is
      if (!isExpanded) return null;

      return <Item title={item} />;
    }}
    renderSectionHeader={({ section: { title } }) => (
      <Pressable onPress={() => handleToggle(title)}>
        <Text style={styles.header}>{title}</Text>
      </Pressable>
    )}
/>
```

To see a working version of this, check out this [Snack](https://snack.expo.dev/@peterpme/sectionlist-expand-and-collapse-example).
In the event the Snack stops working, here's a [gist](https://gist.github.com/peterpme/b818eca2b7faf0e06f2466ab3e84db62) you can copy/paste somewhere with the same code.
