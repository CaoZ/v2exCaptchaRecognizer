import { Component, OnInit, DoCheck } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import g_vision = gapi.client.vision;
import { OptionsManager } from '../common/options.manager';
import * as sharedcommon from '../common/sharedcommon';
const ocr: typeof bdaip.ocr = require('baidu-aip-sdk').ocr;
import { Recognize } from '../common/recognize.tools';

@Component({
    selector: 'app-popup',
    templateUrl: './popup.component.html',
    styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit, DoCheck {
    ApiType = sharedcommon.ApiType;
    optionForm: FormGroup;
    loading = false;
    msg_closed = true;
    _msg: string;
    get msg() { return this._msg; }
    set msg(s: string) { this._msg = s; this.msg_closed = this._msg === ''; }

    get isenable() { return this.optionForm.get('isenable') as FormControl; }
    get apitype() { return this.optionForm.get('apitype') as FormControl; }
    get picnum() { return this.optionForm.get('picnum') as FormControl; }
    get baidu_appid() { return this.optionForm.get('baidu_appid') as FormControl; }
    get baidu_appkey() { return this.optionForm.get('baidu_appkey') as FormControl; }
    get baidu_appsecret() { return this.optionForm.get('baidu_appsecret') as FormControl; }
    get google_appsecret() { return this.optionForm.get('google_appsecret') as FormControl; }
    constructor(private optionsmanager: OptionsManager) {
        this.optionForm = new FormGroup({
            isenable: new FormControl({ value: true, disabled: false }),
            apitype: new FormControl({ value: sharedcommon.ApiType.baiduocr, disabled: false }),
            picnum: new FormControl({ value: 10, disabled: false }, [
                Validators.required, Validators.max(20), Validators.min(3)
            ]),
            baidu_appid: new FormControl({ value: '', disabled: false }, [Validators.required]),
            baidu_appkey: new FormControl({ value: '', disabled: false }, [Validators.required]),
            baidu_appsecret: new FormControl({ value: '', disabled: false }, [Validators.required]),
            google_appsecret: new FormControl({ value: '', disabled: false }, [Validators.required])
        });

        this.optionsmanager.onload = () => {
            console.log(this.optionsmanager.options);
            this.isenable.setValue(this.optionsmanager.options.enable);
            this.picnum.setValue(this.optionsmanager.options.picnum);
            this.baidu_appid.setValue(this.optionsmanager.options.baidu_appid);
            this.baidu_appkey.setValue(this.optionsmanager.options.baidu_appkey);
            this.baidu_appsecret.setValue(this.optionsmanager.options.baidu_appsecret);
            this.google_appsecret.setValue(this.optionsmanager.options.google_appsecret);
            this.apitype.setValue(this.optionsmanager.options.apitype);
        };
    }
    ngOnInit() {
    }

    ngDoCheck() {
        this.optionForm[this.loading ? 'disable' : 'enable']();
    }
    async confirmsetting() {
        this.msg = '';
        const checkfunction = this.apitype.value === sharedcommon.ApiType.baiduocr
            ? Recognize.checkBaiduInfo(this.baidu_appid.value, this.baidu_appkey.value, this.baidu_appsecret.value)
            : Recognize.checkGoogleSecretkey(this.google_appsecret.value);
        this.loading = true;
        const check = await checkfunction;
        this.loading = false;
        if (!check.ok) {
            if (check.error) {
                this.msg = check.error;
            }
            return;
        }

        const options: sharedcommon.Options = {
            enable: this.isenable.value,
            picnum: this.picnum.value,
            apitype: this.apitype.value,
            baidu_appid: this.baidu_appid.value,
            baidu_appkey: this.baidu_appkey.value,
            baidu_appsecret: this.baidu_appsecret.value,
            google_appsecret: this.google_appsecret.value
        };
        await this.optionsmanager.save(options);
        window.close();
    }

    outlink(index: number) {
        const url = index === 0
            ? 'https://console.bce.baidu.com/ai/#/ai/ocr/overview/index'
            : 'https://console.cloud.google.com/apis/api/vision.googleapis.com/';
        window.open(url, '');
    }
}

