# useDimensions

Be notified when the client rect of an element changes. There are many implementations of this function on the internet but most of them aren't written for React and none of the other ones (that I know of) work all the time regardless of the reason for the change.

## usage

Just call the hook and then write whatever logic you want within your component. Note that `dimensions` maintains reference identity so you can safely use it in dependency arrays. Remeber that if you end up changing the dimensions of the target in this handler you can create an undetectable loop. Such loops aren't prevented by a rate limiter because it's normal for systems that depend on element sizes to rerender a few times before settling into a stable state.

```tsx
const [ref, dimensions, isVisible] = useDimensions<HTMLDivElement>()
React.useEffect(() => {
  if (!isVisible) console.log('div not visible')
  else console.log(`div appeared or changed size or position: ${dimensions}`)
}, [dimensions])
return <div ref={ref}>
  ...
</div>