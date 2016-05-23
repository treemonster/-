开发前端页面有时候会遇到特殊bug只在某些设备上出现，例如iphone上出现元素错位，而其他浏览器都正常。在iphone真机上调试的过程，以往都是把手机连上本地共享的wifi，然后修改本地代码，刷新页面，直到解决问题。

后来有一次别人跟我推荐了一个叫`gulp browser-sync`的node工具，原理是监控文件变化，实现了每次修改文件后，自动添加样式或者刷新页面，省去了多个设备同时调试时候手动刷新的麻烦。这是一个好办法，而且确实省去一些额外的重复劳动时间，但试用下来感觉不算顺手，操作步骤略微繁琐。

主要不适应的地方是`browser-sync`必须要指定监控哪些文件，就算支持通配符还是很麻烦的，每次都写一遍不同的东西是很蛋疼的事情，为什么不能复制粘贴那样无脑操作？

吐槽完毕，索性自己写了一个同步测试工具。

我基于ajax轮询来实现代码同步（没必要websocket，这种数量级的调试不需要考虑服务器压力），用MutationObserver实现对页面上元素的样式和html内容改动的监视，并实时推送到服务器，再由其他设备从服务器拉取改动的代码。默认应该在pc端上，且带完整调试控制台的浏览器上实现代码调试，例如chrome浏览器，因为这样可以最方便的使用调试用具来选中要调节的元素，并访问javascript命令控制台。调试完成后，修改内容再保存到对应的文件里，然后再统一刷新一次所有设备的浏览器查看效果，正常情况应该bug修复完成了。

使用的方式分两步，第一步是打开同步服务器，可以在修改server.js的配置之后，运行node命令：

```javascript
node server.js
```

第二步是在页面中添加用于同步的代码（可以添加在页面任何位置）：

```xhtml
<script type="text/javascript">
(function(host,key){
  document.write('<script type="text/javascript" src="'+host+'/jquery?v1"></scri'+'pt>'); // 引用jq，因为同步工具使用jquery的一些方法
  document.write('<script type="text/javascript" src="'+host+'/front/tool?key='+key+'"></scri'+'pt>'); // 主要同步代码
})('http://localhost:890',escape(location.href)); // 参数1 为同步服务器的域名，需要带端口。参数2 为当前页面同步的标记，用于确保当前页面上调试代码只会被其他设备上的这个页面执行
</script>
```


接下来就可以在不同设备上打开这些页面进行调试了。

