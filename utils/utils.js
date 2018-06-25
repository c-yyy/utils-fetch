import { Toast } from 'antd-mobile';
import CryptoJS from "../constant/aes"
import {post, ajax} from './fetch'
import API from '../constant/api'
import {TOKEN} from '../constant/localKey'
import Config from '../constant/config'


export default  {
  checkSystem(type){
    var ua = navigator.userAgent.toLowerCase();
    var obj = {wx:false, }
    if(ua.match(/MicroMessenger/i)=="micromessenger") {  
      obj.wx = true;
    }
    return !!obj[type]
    utils.checkSystem = (type) => !!obj[type];
  },
  params( obj={} ){
    var result = '';
    var item;
    for (item in obj) {
        result += '&' + item + '=' + encodeURIComponent(obj[item]);
    }
    return result? `?${result.slice(1)}`:'';
  },

  getParam(name) { 
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
    var r = window.location.search.substr(1).match(reg); 
    if (r != null) return decodeURIComponent(r[2]); 
    return null; 
  },

  goAuth(url){
    location.replace(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${Config.appId}&redirect_uri=${url}&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect`)
  },
  async goLogin(fn, _url){
    var token = localStorage[TOKEN] || '';
    var code = this.getParam('code') || '';
    if(!token){
      if(!code){
        var url = `${Config.authorizationUrl}/activity/world-cup${_url}`; // 分享链接
        this.goAuth(url)
        return false;
      }else{
        const res = await post(API.auth, {code, focusType: 3})
        const {code:code1, data:{result}, desc} = res;
        if(code1 != '0')return Toast.info(desc, 1);;
        localStorage[TOKEN] = result;
      }
    }
    // localStorage[TOKEN] = "2HmPCUBcjbekKNS9QlVXxO/6uyS/8QTyAIQjYOZ6V6tRXa6eBr+oce7RvmkOVdt8CEeVMaBF/54TP8ETMCXEXg==";//测试 王炜
    // localStorage[TOKEN] = "ngItZAGFCAynbNuVilEZIBfVuRcEpeV41rCuh/GUtPNRJY4Ht46cTk9QKJVJ4cJU";//测试 曹萌
    // localStorage[TOKEN] = "TIwUoARxMiHRxsS1SFKrgPXtZCPvfu6rkF3Byxn6xoBb60J1wU8syvAFbpFHYF4z9vpwtQJQhgcTIqvaYgC6Lw==";//线上曹萌
    
    return typeof fn === 'function' && fn();
  },


  //取窗口滚动条高度
  getScrollTop(){
    var scrollTop=0;
    if(document.documentElement&&document.documentElement.scrollTop){
        scrollTop=document.documentElement.scrollTop;
    }else if(document.body){
        scrollTop=document.body.scrollTop;
    }
    return scrollTop;
  },

  //禁止滑动
  notDrag(flag){
    var body = document.body;
    var st = this.getScrollTop();
    flag && document.getElementsByTagName('html')[0].setAttribute('h', st)
    document.getElementsByTagName('html')[0].setAttribute('class', flag? 'noScroll':'')
    !flag && window.scrollTo(0, document.getElementsByTagName('html')[0].getAttribute('h'))
  },
  pad( n ){
    return n<10? `0${n}`: n;
  },

  formatDate(date) {
    date = date / 1000;
    let day = parseInt(date / 3600 / 24) > 0 ? parseInt(date / 3600 / 24) : 0
    let hour = parseInt((date - day * 24 * 3600) / 3600) < 60 ? parseInt(parseInt(date - day * 24 * 3600) / 3600) : 0
    let minute = parseInt((date - day * 24 * 3600 - hour * 3600) / 60) < 60 ? parseInt(parseInt(date - day * 24 * 3600 - hour * 3600) / 60) : 0
    let second = parseInt(date - day * 24 * 3600 - hour * 3600 - minute * 60)
    let d = day;
    let h = this.pad(hour);
    let f = this.pad(minute);
    let s = this.pad(second)
    let keep = {
      d,h,f,s
    }
    return keep;
  },
  //防抖
  debounce(){
    var count = 1;
    return (fn) => {
      if(count == '1'){
        count++;
        typeof fn === 'function' && fn();
        setTimeout(()=>(count = 1), 500)
      }
    }
  },
  /**
   * aes加密
   * @param word
   * @returns {*}
   */
  aesEnCode(word) {
    let srcs = CryptoJS.enc.Utf8.parse(word)
    let key = CryptoJS.enc.Utf8.parse('9188123123123345');
    let iv = CryptoJS.enc.Utf8.parse('9188123123123345');
    let encrypted = CryptoJS.AES.encrypt(word, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    let val = CryptoJS.enc.Base64.stringify(
      CryptoJS.enc.Hex.parse(encrypted.ciphertext.toString())
    );
    // console.log('字符',encrypted,val)
    return val;
  },

  /**
   * 
   * @param {String} url 分享出去的链接
   * @param {String} main 主队名
   * @param {String} guest 客队名
   */
  async share(url, main, guest){
    let res = await ajax.post('/requestService.go', {action : 'getShareParam',shareurl : location.href})
    var R = res.getElementsByTagName("Resp")[0]
    var code = R.getAttribute('code')
    if(code !== "0")return false;
    let row = R.getElementsByTagName('row')[0];
    let appId = row.getAttribute('appId');
    let timestamp = row.getAttribute('timestamp');
    let nonceStr = row.getAttribute('nonceStr');
    let signature = row.getAttribute('signature');
    wx.config({
      debug : false,
      appId : appId, 
      timestamp : timestamp, 
      nonceStr : nonceStr, 
      signature : signature,
      jsApiList : [ 'onMenuShareTimeline',
              'onMenuShareAppMessage',
              'onMenuShareQQ', 'onMenuShareWeibo' ]
    });
      wx.ready(function() {
        
        var title = main ?`预测【${main}vs${guest}】，送你5元红包`: '免费预测赢5元包'; // 分享标题
        var desc = '新用户福利，错过这次再等四年～'; // 分享描述
        var link = url; // 分享链接
        var imgUrl = `${Config.authorizationUrl}/activity/lib/img/share-logo.png`; // 分享图标
        var dataUrl = '';// 如果type是music或video，则要提供数据链接，默认为空
        wx.onMenuShareAppMessage({//分享给朋友
            title : title,
            desc : desc,
            link : link, // 分享链接
            imgUrl : imgUrl, // 分享图标
            type : 'link', // 分享类型,music、video或link，不填默认为link
            dataUrl : dataUrl, // 如果type是music或video，则要提供数据链接，默认为空
            success : function() {
                // 用户确认分享后执行的回调函数
                _czc && _czc.push(["_trackEvent", '世界杯', '好友', '', '分享', '']);
            },
            cancel : function() {
                // 用户取消分享后执行的回调函数
                
            }
        });
        wx.onMenuShareTimeline({//分享到朋友圈
            title : title, // 分享标题
            link : link, // 分享链接
            imgUrl : imgUrl, // 分享图标
            success : function() {
                // 用户确认分享后执行的回调函数
                _czc &&_czc.push(["_trackEvent", '世界杯', '朋友圈', '', '分享', '']);
            },
            cancel : function() {
                // 用户取消分享后执行的回调函数
            }
        });

        wx.onMenuShareQQ({//分享到QQ
            title : title, // 分享标题
            desc : desc, // 分享描述
            link : link, // 分享链接
            imgUrl : imgUrl, // 分享图标
            success : function() {
                // 用户确认分享后执行的回调函数
                _czc && _czc.push(["_trackEvent", '世界杯', 'QQ', '', '分享', '']);
            },
            cancel : function() {
                // 用户取消分享后执行的回调函数
            }
        });
      });
  },
  //-------------- 校验表单 -------------
  checkPhone(v){
    if(v == ''){
      Toast.info('请输入手机号', 1);
      return false;
    }
    if(/^1[3|4|5|6|7|8]\d{9}$/.test(v)){
      return true;
    }
    Toast.info('手机号格式不对', 1);
    return false;
  }

}