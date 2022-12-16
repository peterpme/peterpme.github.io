---
title: React Native SectionList Expand & Collapse Guide
date: 2022-12-016T06:00:00.000Z
categories: [React Native]
---

A SectionList in React Native allows you to render sectioned lists efficiently.

The one thing that might trip you up is the ability to be able to expand/collapse the sections. The guides out there are lackluster.

Getting it working is straight forward. The key is using the `extraData` prop for a SectionList. 

`extraData` just re-renders the list when you have to pass in new data somewhere (like changing the expand/collapse toggle state.

After searching the internet for this demo, I wasn't able to find one so I put one together. Getting this working is straight forward:

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
