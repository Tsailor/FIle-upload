import React, { useState } from 'react';

function Example() {
  // 声明一个叫 "count" 的 state 变量
  const [count, setCount] = useState(0);
  const test = () => {
    console.log("---",count)
  }
  const handleClick = ()=> {
    setCount(count+1)
    test()
    console.log(count)
  }
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={handleClick}>
        Click me
      </button>
    </div>
  );
}
export default  Example;