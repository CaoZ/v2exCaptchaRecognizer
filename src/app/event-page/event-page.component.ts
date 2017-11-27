import { Component, OnInit } from '@angular/core';


import * as sharedcommon from '../common/sharedcommon';
import { CoreOptions } from 'request';
import { OptionsManager } from '../common/options.manager';
import { Recognize } from '../common/recognize.tools';

@Component({
    selector: 'app-event-page',
    templateUrl: './event-page.component.html',
    styleUrls: ['./event-page.component.css']
})

export class EventPageComponent implements OnInit {
    constructor(private optionsmanager: OptionsManager) {
    }
    ngOnInit() {
        chrome.runtime.onConnect.addListener(port => {
            port.onMessage.addListener(async request => {
                console.log('request', request);
                if (request as sharedcommon.RuntimeMessageImageBase64s) {
                    if (!this.optionsmanager.options.enable) {
                        return;
                    }

                    const recognizeFunc = this.optionsmanager.options.apitype === sharedcommon.ApiType.baiduocr
                        ? Recognize.resolveMessageImagebase64sWithBaidu(
                            request as sharedcommon.RuntimeMessageImageBase64s,
                            this.optionsmanager.options.baidu_appid,
                            this.optionsmanager.options.baidu_appkey,
                            this.optionsmanager.options.baidu_appsecret)
                        : Recognize.resolveMessageImageBase64sWithGapi(
                            request as sharedcommon.RuntimeMessageImageBase64s,
                            this.optionsmanager.options.google_appsecret);
                    const final = await recognizeFunc;
                    const finalmessage = new sharedcommon.RuntimeMessageRecognizeCaptcha();
                    console.log(final);
                    finalmessage.recognize_captcha = final;
                    port.postMessage(finalmessage);
                }
            });
        });
    }
}
