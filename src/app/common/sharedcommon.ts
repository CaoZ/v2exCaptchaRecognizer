import * as request from 'request';
export class Utils {
    static StorageKey = 'V2-captcha-options';
    static captchaElementId_input = 'V2-captcha-element-input';
    static captchaElementId_spinner = 'V2-captcha-element-spinner';
    static captchaElementId_problem = 'V2-captcha-element-problem';
    static getElementByXpath<T extends HTMLElement>(path: string, containerElement: any = document) {
        return document.evaluate(path, containerElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as T;
    }

    static getbase64async(path: string) {
        return new Promise<Base64Data>((resolve) => request(path)
            .on('response', response => {
                if (response.statusCode < 200 || response.statusCode >= 300) {
                    resolve({ valid: false });
                } else {
                    response.on('data', (data) => {
                        if (data instanceof Buffer) {
                            resolve({ valid: true, base64: data.toString('base64') });
                        }
                    });
                }
            }));
    }

    static mapMany(arr, mapper) {
        return arr.reduce(function (prev, curr, i) {
            return prev.concat(mapper(curr));
        }, []);
    }

    public static delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export enum ApiType {
    baiduocr,
    googlevision
}

export interface Options {
    enable: boolean;
    picnum: number;
    apitype: ApiType;
    baidu_appid?: string;
    baidu_appkey?: string;
    baidu_appsecret?: string;
    google_appsecret?: string;
}

export interface CommonResult<T> {
    ok: boolean;
    error?: string;
    result?: T;
}

export interface Base64Data {
    valid: boolean;
    base64?: string;
}

export class RuntimeMessage { }

export class RuntimeMessageImageBase64s implements RuntimeMessage {
    image_base64s: string[];
}

export class RuntimeMessageRecognizeCaptcha implements RuntimeMessage {
    recognize_captcha: CommonResult<string>;
}
