/// <reference types="vite/client" />

// 声明CSS模块
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
