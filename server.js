/**
 前端代码调试器 v1.0
 code by treemonster
 mailto: admin@xdelve.com
 */
 
'use strict';


class RemoteDebuger{

  constructor(config){
    config.wincb='_'+(new Date).getTime().toString(16);

    this.queue={};
    this.config=config;

    let fs=require('fs');

    // 不做容错处理了，本地一般不会报错
    this.front_script=new Promise((resolve)=>fs.readFile('./local.js','utf-8',(e,data)=>resolve(data)));
    this.jquery=new Promise((resolve)=>fs.readFile('./jquery.js','utf-8',(e,data)=>resolve(data)));

  }

  // 远程推送代码
  pushCode(key,code){
  	let queue=this.queue;
    queue[key]=queue[key]||[];
    queue[key].push({time:(new Date).getTime(),code:code});
  }
  // 远程拉取代码
  pullCode(key,lasttime){
  	let queue=this.queue;
    var list=queue[key]||[];
    list=JSON.parse(JSON.stringify(list));
    for(var i=list.length;i--;){
      if(lasttime<new Date(list[i].time).getTime())continue;
      list.splice(0,i+1);
      break;
    }
    return list;
  }
  // 解析路由和参数
  resolve(request){
  	let defer=Promise.defer();
  	let request_url=request.url;
    let url=require('url');
    let querystring=require('querystring');
    let req=url.parse(request_url);

    let action=this[req.pathname.replace(/\//g,'_')+'Action'];
    let params=querystring.decode(req.query);

    if(action===undefined)throw '接口不存在';
    let trycb=(cb)=>(a,b,c,d)=>{
      try{return cb(a,b,c,d);}
      catch(e){defer.reject(e.message);}
    };
    let body=new Buffer([]);
    request
      .on('data',trycb((chunk)=>body=Buffer.concat([body,chunk])))
      .on('end',trycb(()=>{
        let postdata=querystring.decode(decodeURI(body.toString('utf-8')));
        for(let key in postdata)
          params[key]=postdata[key];
        Promise.resolve(action(this,params)).then(defer.resolve,defer.reject);
      }))
      .on('error',trycb(()=>defer.reject('解析数据错误')));

    return defer.promise;
  }

  static run(config){
    var debuger=new this(config);
    let queue=debuger.queue;
    let key,msg;
    setInterval(()=>{
      for(key in queue){
        msg=queue[key];
        for(let i=msg.length;i--;){
          if((new Date).getTime()-parseInt(msg[i].time)<1000*60)continue;
          msg.splice(0,i);
          break;
        }
        if(msg.length>20)msg.splice(0,msg.length-20);
        if(!msg.length)delete(queue[key]);
      }
    },2000);
    require('http').createServer((request,response)=>{
      new Promise((resolve)=>resolve(debuger.resolve(request)))
      .then((result)=>{
      	result=result||{};
      	response.writeHead(200,{'Content-Type':result.isJs?'application/javascript; charset=utf-8':'text/html; charset=utf-8'});
        response.end(result.data);
      },(reason)=>{
      	response.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
        response.end(reason);
      });
    }).listen(config.port);

  }

  /** 接口 */

  // 提交代码
  _code_pushAction(debuger,params){
    debuger.pushCode(params.key,params.code);
  }

  // 拉取代码
  _code_pullAction(debuger,params){
    return {
      isJs: true,
      data: debuger.config.wincb+'('+JSON.stringify(debuger.pullCode(params.key,params.lasttime||0))+')' ,
    };
  }

  // 前端代码工具，通过script标签引入页面
  _front_toolAction(debuger,params){
    return debuger.front_script.then(function(script){
      return {
        isJs: true,
        data: script.replace(/\{\{config\}\}/,JSON.stringify({
          pull_url: debuger.config.host+'/code/pull?key='+params.key,
          push_url: debuger.config.host+'/code/push?key='+params.key,
          win_cb: debuger.config.wincb,
        })),
      };
    });
  }

  // 前端引用jquery，通过script标签引入页面
  _jqueryAction(debuger,params){
    return debuger.jquery.then(function(script){
      return {
        isJs: true,
        data: script,
      };
    });
  }

  _testAction(){
    return {
      data:'<meta charset=utf-8 /><form method=POST action="/code/push?key=aa&code=alert(2)"><input type=submit><textarea name=aaa>xxx</textarea></form>',
    };
  }



}

RemoteDebuger.run({
  port: 890,
  host: 'http://localhost:890',

});

