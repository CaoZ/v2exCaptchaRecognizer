# V2ex Captcha Recognizer Extension  
自动识别并填写 V2EX **[注册](https://www.v2ex.com/signup)** / **[登录](https://www.v2ex.com/signin)** / **[重设密码](https://www.v2ex.com/forgot)** 等页面的验证码

![image](https://raw.githubusercontent.com/gragrance/v2exCaptchaRecognizer/master/screenshot.gif)

# 实现原理  
1. V2EX的验证码的设计在 **阻挠肉眼识别** 和 **便于模式识别** 两方面都达到了很高的水准。前者无需赘言，后者用之前项目做过的本地模式识别库简单测试，识别率非常高。

1. 前者使这个功能成为一个迫切的需求，后者使自动识别成为技术上的可能，但还仅仅是可能。

1. 但最重要的一点是，当验证码地址 __*https://www.v2ex.com/_captcha?once={number}*__ 和 **Cookie** 不变的情况下，可以反复获取文字相同，但是重绘过的图片。  

![image](https://user-images.githubusercontent.com/34030605/33271369-ffd3ada0-d3c1-11e7-800c-be32b1b62729.png)  

4. 所以可以进行多次识别进行比较来增加准确度。图片数在10张左右时，准确率已经可以接受；当图片数超过20张时，几乎达到了100%的准确度，完全可以用作自动登录。 

# 实现步骤 
1. 获取 N 张验证码图片
1. 使用 Canvas 将多张图片组合成一张
1. 使用 **[百度 OCR](https://cloud.baidu.com/doc/OCR/index.html)** 或者 **[GOOGLE CLOUD VISION](https://cloud.google.com/vision/?hl=zh_CN)** API 进行在线识别
1. 比较返回的结果列表，获取每个位置出现频次最高的字符

# 关于百度 OCR 和 GOOGLE CLOUD VISION
1. 前者容错高，后者精度高。通俗点来说，前者给多么混乱的图片，都会尝试识别并返回出点什么结果来，后者则更容易返回空结果；但是同样条件下，后者返回的结果更精确。
1. 前者**每天**有 500 条免费额度，所以扩展里自带了一个百度 OCR 的 AppId ，可以开包即用。而后者**每个月**只有 1000 条免费额度，没有包含，可以在 Popup 里自己设置。

# Thanks to
1. Angular 4 
1. Gulp
1. Clarity
1. baidu-aip-sdk
1. GOOGLE CLOUD VISION

# Build
To build the project you need to run the following node commands:
* `npm install -g @angular/cli gulp`
* `npm install`
* `gulp`

因为有 **[node-sass](https://github.com/sass/node-sass)** 的依赖，而 node-sass 又需要 **[node-gyp](https://github.com/nodejs/node-gyp#on-windows)**  
node-gyp 在 Windows 上 Build 需要 **[Python 2.7](https://www.python.org/downloads/)** 和 **[Visual C++ Build Tools](https://download.microsoft.com/download/E/E/D/EEDF18A8-4AED-4CE0-BEBE-70A83094FC5A/BuildTools_Full.exe)**

# Release  
不想安装环境或者不想 Build 的，可以直接到 Release 下载扩展包，在 [扩展页面 chrome://extensions/](chrome://extensions/) 加载已解压的扩展程序即可。
