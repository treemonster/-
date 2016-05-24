/**
 前端代码调试器 v1.0.2
 code by treemonster
 mailto: admin@xdelve.com
 */
setTimeout(function(){
  var conf={{config}};
  var time=new Date;
  time.setTime(conf.server_time);
  var iframe=document.createElement('iframe');
  iframe.name=iframe.id='sdanviorhevberbvebrv';
  var div=document.createElement('div');
  div.id='wendiufndiu3fiub3gv';
  div.style.display=iframe.style.display='none';
  document.body.appendChild(div);
  document.getElementById(div.id).appendChild(iframe);

  function getuid(){
    return (new Date()).getTime().toString(36)+'_'+conf.server_uid;
  }

  var document_root=document.body.parentNode;

  function getquery(dom,result){
    result=result||[];
    if(dom===document_root)return result;
    var parent=dom.parentNode;
    if(!parent)return null;
    for(var i=0;i<parent.children.length;i++){
      if(parent.children[i]!==dom)continue;
      result.unshift(i);
      if(parent===document_root)return result;
      else return arguments.callee(parent,result);
    }
  }
  var query=function(q){
    var dom=document_root;
    try{
      while(q.length)
        dom=dom.children[q.shift()];
      return dom;
    }catch(e){
      return null;
    }
  };

  function pull(){
    $.getScript(conf.pull_url+'&lasttime='+time.getTime());
  }
  function push(js){
    var push_uid=getuid();
    var form=$('<form target="'+iframe.name+'" style="display:none;" method="POST" push_uid="'+push_uid+'" action="'+conf.push_url+'&push_uid='+push_uid+'"></form>');
    form.appendTo(div);
    form.append($('<input name="code" value="'+escape(js)+'" />'));
    form.submit();
  }

  var locked;
  window[conf.win_cb]=function(data){
    locked=true;
    for(var i=0;i<data.length;i++)eval(data[i].code);
    setTimeout(function(){locked=false;pull();},10);
    if(!data.length)return;
    time=new Date;
    time.setTime(data.pop().time);
  };
  pull();

  window.RemoteDebuger={
    reload: function(){
      push('location.reload();');
    },
    pushCode: function(code){
      push(code);
    }
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
        q && push('~function(){var fy='+query.toString()+',fx='+JSON.stringify([q,attr,t.getAttribute(attr)])+';$(fy(fx[0])).attr(fx[1],fx[2]);}()');
        break;
        case 'characterData':
        var q=getquery(t.parentNode);
        q && push('~function(){var fy='+query.toString()+',fx='+JSON.stringify([q,t.parentNode.innerHTML])+';$(fy(fx[0])).html(fx[1]||"");}()');
        break;
      }
    });
  }).observe(document_root,{
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true,
    attributeOldValue: true,
    characterDataOldValue:true
  });
},0);
