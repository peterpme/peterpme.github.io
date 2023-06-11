---
title: Working with an array of refs in React
date: 2023-06-11T06:00:00.000Z
categories: react
---

This is how you'd tap "next" to select the next TextInput when you have an arbitrary amount of inputs

```js
function Container({ items }) {
  const inputRef = useRef<TextInput[]>([]);
  return (
    <View>
      {items.map((item, index) => (
        <TextInput
          key={item.id}
          ref={(node) => {
            if (node) {
              inputRef.current[index] = node;
            }
          }}
          onSubmitEditing={() => {
            const next = inputRef.current[index + 1];
            if (next) {
              next.focus();
            }
          }}
        />
      ))}
    </View>
  );
}
```

Say that you create a custom TextInput called MyCustomTextInput, you'll have to forward the ref:

```js
const CustomTextInput = forwardRef((props, ref) => {
  return <TextInput ref={ref} {...props} />;
});

function Container({ items }) {
  const inputRef = useRef<TextInput[]>([]);
  return (
    <View>
      {items.map((item, index) => (
        <CustomTextInput
          key={item.id}
          ref={(node) => {
            if (node) {
              inputRef.current[index] = node;
            }
          }}
          onSubmitEditing={() => {
            const next = inputRef.current[index + 1];
            if (next) {
              next.focus();
            }
          }}
        />
      ))}
    </View>
  );
}
```

That should do it!
