function createMarkup() {
    return {__html: `var _hmt = _hmt || [];
    (function() {
      var hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?3f2963af3ee66cb1b59ed499ef8fb516";
      var s = document.getElementsByTagName("script")[0]; 
      s.parentNode.insertBefore(hm, s);
    })();`};
   }
   function MyComponent() {
    return <script dangerouslySetInnerHTML={createMarkup()} ></script>
   }
   export default MyComponent