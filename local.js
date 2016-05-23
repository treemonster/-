/**
 前端代码调试器 v1.0
 code by treemonster
 mailto: admin@xdelve.com
 */
setTimeout(function(){
  var conf={{config}};
  var time=new Date;
  var iframe=document.createElement('iframe');
  iframe.name=iframe.id='sdanviorhevberbvebrv';
  var div=document.createElement('div');
  div.id="wendiufndiu3fiub3gv";
  div.style.display=iframe.style.display='none';
  document.body.appendChild(div);
  document.getElementById(div.id).appendChild(iframe);
  var locked;

  function add(node){
    div.appendChild(node);
  }

  function getquery(dom,result){
    result=result||[];
    var parent=dom.parentNode;
    for(var i=0;i<parent.children.length;i++){
      if(parent.children[i]!==dom)continue;
      result.unshift(i);
      if(parent===document.body)return result;
      else return arguments.callee(parent,result);
    }
  }
  var query=function(q){
    var dom=document.body;
    try{
      while(q.length)
        dom=dom.children[q.shift()];
      return dom;
    }catch(e){
      return null;
    }
  };

  function pull(){
    var script=document.createElement('script');
    script.type='text/javascript';
    script.src=conf.pull_url+'&lasttime='+time.getTime()+'&'+(new Date).getTime();
    add(script);
  }
  function push(js){
    var form=document.createElement('form');
    form.action=conf.push_url;
    form.method='POST';
    var code=form.appendChild(document.createElement('input'));
    code.name='code';
    code.value=js;
    form.target=iframe.name;
    form.style.display='none';
    add(form);
    form.submit();
  }
  window[conf.win_cb]=function(data){
    locked=true;
    for(var i=0;i<data.length;i++)
      eval(data[i].code);
    setTimeout(function(){
      locked=false;
    },10);
    setTimeout(pull,500);
    if(!data.length)return;
    time=new Date,t=data.pop().time;
    time.setTime(t);
  };
  pull();

  window.ReloadDevices=function(){
    push('location.reload();');
  };

  if(!window.MutationObserver)return;
  new MutationObserver(function(mutations){
    locked || mutations.forEach(function(mutation){
      var i=0;
      var attr;
      var t=mutation.target;
      switch(mutation.type){
        case 'attributes':
        attr=mutation.attributeName;
        var q=getquery(t);
        push('~function(){var fy='+query.toString()+',fx='+JSON.stringify([q,attr,t.getAttribute(attr)])+';$(fy(fx[0])).attr(fx[1],fx[2]);}()');
        break;
        case 'characterData':
        var q=getquery(t.parentNode);
        push('~function(){var fy='+query.toString()+',fx='+JSON.stringify([q,t.parentNode.innerHTML])+';$(fy(fx[0])).html(fx[1]||"");}()');
        break;
      }
    });
  }).observe(document.body,{
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true,
    attributeOldValue: true,
    characterDataOldValue:true
  });
},0);
