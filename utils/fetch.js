import 'whatwg-fetch'
import Util from './utils'

function _fetch(fetch_promise, timeout) {
  var abort_promise = new Promise(function(resolve, reject) {
        setTimeout(function() {
          reject('');
        }, timeout);
  });
   return Promise.race([fetch_promise,abort_promise])
}

/*
* fetch简单封装
* url: 请求的URL
* successCallback: 请求成功回调
* failCallback: 请求失败回调
* 
* */
function timeout(ms, promise){
  return new Promise((resolve, reject)=>{
      setTimeout(()=>{
          reject('超时')
      }, ms)
      promise.then(resolve, reject)
  })
}

/*
method [POST]
*/
export function post(url, paramsObj, timeout=1e4) {
    return _fetch(
      fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: obj2params(paramsObj)
    })
    ,timeout)
    .then(checkStatus)
    .then(response=>response.json())
}

/*
method [GET]
*/
export function get(url, paramsObj, timeout=1e4) {
    url += Util.params(paramsObj);
    return _fetch(
      fetch(url, {
        headers: {
            'Accept': 'application/json, text/plain, */*',
        }
    })
    ,timeout)
    .then(checkStatus)
    .then(response=>response.json())
}


/*
method [FORM]
*/
export function form(url, paramsObj) {
    return fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            'Accept': 'application/json, text/plain, */*'
        },
        body: paramsObj
    })
    .then(checkStatus)
    .then(parseJSON)
}


//兼容xml形式
export let ajax = {
  get:( url )=>{
      var promise = new Promise((resolve, reject)=>{
          var request = GetXmlHttpObject();
          request.onreadystatechange = (e) => {
              if (request.readyState !== 4) { return; } 
              if (request.status === 200) { resolve(parseXml(request.responseText)) } 
              else { reject('') }
          }; 
          request.open('GET', url); 
          request.send();
      })
      return promise
  },
  getJson:( url )=>{//返回json格式的
      var promise = new Promise((resolve, reject)=>{
          var request = GetXmlHttpObject();
          request.onreadystatechange = (e) => {
              if (request.readyState !== 4) { return; }
              if (request.status === 200) { resolve(JSON.parse(request.responseText)) }
              else { reject('') }
          };
          request.open('GET', url);
          request.send();
      })
      return promise
  },
  post:( url, data )=>{//返回json格式的
      var promise = new Promise((resolve, reject)=>{
          var request = GetXmlHttpObject();
          request.overrideMimeType("text/xml");//设置数据返回格式
          request.onreadystatechange = (e) => {
              if (request.readyState !== 4) { return; } 
              if (request.status === 200) { resolve(parseXml(request.responseText)) }
              else { reject('') }
          }; 
          request.open("POST",url,false);
          request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
          request.send(obj2params(data))

      })
      return promise
  },
  postJson:( url, data )=>{
      var promise = new Promise((resolve, reject)=>{
          var request = GetXmlHttpObject();
          request.overrideMimeType("text/xml");//设置数据返回格式
          request.onreadystatechange = (e) => {
              if (request.readyState !== 4) { return; }
              if (request.status === 200) { resolve(JSON.parse(request.responseText)) }
              else { reject('') }
          };
          request.open("POST",url,false);
          request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
          request.send(obj2params(data))

      })
      return promise
  }
}



function GetXmlHttpObject(){ 
  let xmlHttp = ''; 
  if (window.XMLHttpRequest){ 
    // code for IE7+, Firefox, Chrome, Opera, Safari 
    xmlHttp=new XMLHttpRequest(); 
  }else{// code for IE6, IE5 
    xmlHttp=new ActiveXObject("Microsoft.XMLHTTP"); 
  } 
  return xmlHttp; 
} 

function parseXml(xml) {
  var xmldom =  null;
  if (typeof DOMParser != "undefined") {
      xmldom = (new DOMParser()).parseFromString(xml, "text/xml");
      var errors = xmldom.getElementsByTagName("parsererror");
      if(errors.length) {
          throw new Error("XML parsing error:" + errors[0].textContent);
      }
  } else if(document.implementation.hasFeature("LS", "3.0")) {
      var implementation =  document.implementation;
      var parser = implementaion.createLSParser(implementation.MODE_SYNCHRONOUS, null);
      var input = implementation.createLSInput();
      input.stringData = xml;
      xmldom = parser.parse(input);
  } else if(typeof ActiveXObject != "undefined") {
      xmldom = createDocument();
      xmldom.loadXML(xml);
      if (xmldom.parseError != 0) {
          throw new Error("XML parsing error:" + xmldom.parseError.reason);
      }
  } else {
      throw new Error("No XML parser available.");
  }
  return xmldom;
}


function obj2params(obj) {
    var result = '';
    var item;
    for (item in obj) {
        result += '&' + item + '=' + encodeURIComponent(obj[item]);
    }
    return result?result.slice(1):result;
}
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}