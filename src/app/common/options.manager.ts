import { Injectable } from '@angular/core';
import * as sharedcommon from './sharedcommon';

@Injectable()
export class OptionsManager {
    options: sharedcommon.Options;
    onload?: () => void;
    constructor() {
        this.reloadOptions();
        chrome.storage.onChanged.addListener(changes => this.reloadOptions());
    }

    async reloadOptions() {
        this.options = await this.getOptionsAsync();
        if (this.onload) {
            this.onload();
        }
    }

    async save(option?: sharedcommon.Options) {
        return new Promise((resolve) => {
            if (option) {
                this.options = option;
            }
            const storage = {};
            storage[sharedcommon.Utils.StorageKey] = this.options;
            chrome.storage.local.set(storage, () => resolve());
        });
    }

    private getOptionsAsync() {
        return new Promise<sharedcommon.Options>(resolve => {
            chrome.storage.local.get(sharedcommon.Utils.StorageKey, async items => {
                let options = items[sharedcommon.Utils.StorageKey] as sharedcommon.Options;
                if (typeof options === 'undefined'
                    || typeof options.enable === 'undefined'
                    || typeof options.picnum === 'undefined'
                    || typeof options.apitype === 'undefined') {
                    /// no options
                    options = {
                        enable: true,
                        picnum: 10,
                        apitype: sharedcommon.ApiType.baiduocr,
                        baidu_appid: '10438145',
                        baidu_appkey: 'N7GWF63CRc2RM8iYHih6GBjZ',
                        baidu_appsecret: 'McqgCdBOprgOjdiysA7U18FTouX1iwDz'
                    };
                }
                resolve(options);
            });
        });
    }
}
