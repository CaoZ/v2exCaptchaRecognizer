const ocr: typeof bdaip.ocr = require('baidu-aip-sdk').ocr;
import g_vision = gapi.client.vision;
import * as sharedcommon from '../common/sharedcommon';
import * as noderequest from 'request';

export class Recognize {
    static resolveMessageImageBase64sWithGapi(base64s: sharedcommon.RuntimeMessageImageBase64s, google_appsecret: string) {
        return new Promise<sharedcommon.CommonResult<string>>((resolve) => {
            gapi.load('client', () => {
                gapi.client.load('vision', 'v1', () => {
                    const gapiAgent: any = gapi;
                    const vision_images: g_vision.ImagesResource = gapiAgent.client.vision.images;
                    const payload: any = {
                        key: google_appsecret,
                        requests: [],
                        fields: 'responses/textAnnotations/description'
                    };
                    base64s.image_base64s.forEach(element => {
                        const rq: g_vision.AnnotateImageRequest = {
                            features: [{ type: 'TEXT_DETECTION' }],
                            image: { content: element }
                        };
                        payload.requests.push(rq);
                    });
                    vision_images.annotate(payload).execute(o => {
                        if (o['code'] || !o.result || !o.result.responses) {
                            resolve({ ok: false, error: o['message'] });
                        } else {
                            console.log('image_result', o.result.responses);
                            const recognizevalues = sharedcommon.Utils
                                .mapMany(
                                o.result.responses,
                                rs => rs && rs.textAnnotations
                                    ? rs.textAnnotations.slice(1).map(t => t.description)
                                    : []) as Array<string>;
                            console.log('orig recognize values', recognizevalues);
                            const final = this.getMaxFrequenceCharacters(recognizevalues);
                            resolve({ ok: true, result: final });
                        }
                    });
                });
            });
        });
    }

    static resolveMessageImagebase64sWithBaidu(
        base64s: sharedcommon.RuntimeMessageImageBase64s,
        baidu_appid: string,
        baidu_appkey: string,
        baidu_appsecret: string) {
        return new Promise<sharedcommon.CommonResult<string>>((resolve) => {
            const ocrclient = new ocr(
                baidu_appid,
                baidu_appkey,
                baidu_appsecret);
            ocrclient.generalBasic(base64s.image_base64s[0], { language_type: 'ENG' })
                .then(response => {
                    console.log('response', response);
                    if (response && response.words_result) {
                        const recognizevalues = response.words_result.map(w => w.words.trim());
                        console.log('orig recognize values', recognizevalues);
                        const final = this.getMaxFrequenceCharacters(recognizevalues);
                        resolve({ ok: true, result: final });
                    }
                    resolve({ ok: false, error: response.error_msg });
                })
                .catch(error => {
                    resolve({ ok: false, error: error.error });
                });
        });
    }

    static checkGoogleSecretkey(secretkey: string) {
        return new Promise<sharedcommon.CommonResult<any>>((resolve) => {
            gapi.load('client', () => {
                gapi.client.load('vision', 'v1', () => {
                    const gapiAgent: any = gapi;
                    const vision_images: g_vision.ImagesResource = gapiAgent.client.vision.images;
                    const payload: any = {
                        key: secretkey,
                        requests: [],
                        fields: 'responses/textAnnotations/description'
                    };
                    vision_images.annotate(payload).execute(o => {
                        if (o['code']) {
                            resolve({ ok: false, error: o['message'] });
                        } else {
                            resolve({ ok: true });
                        }
                    });
                });
            });
        });
    }

    static checkBaiduInfo(APP_ID: string, API_KEY: string, SECRET_KEY: string) {
        return new Promise<sharedcommon.CommonResult<any>>((resolve) => {
            const baipClient = new ocr(APP_ID, API_KEY, SECRET_KEY);
            baipClient.devAuth._events.event_gettoken_success = o => resolve({ ok: true });
            baipClient.devAuth._events.event_gettoken_error = e => resolve({ ok: false, error: e.error });
        });
    }

    private static getMaxFrequenceCharacters(recognizevalues: string[]) {
        recognizevalues = recognizevalues
            .filter(c => c.match(/^[0-9a-zA-Z]{8}$/i))
            .map(c => c.toUpperCase());
        console.log('filtered recognize values', recognizevalues);
        const maxcharacters = [0, 1, 2, 3, 4, 5, 6, 7].map(offset => {
            const tmp: CharacterCount[] = [];
            recognizevalues.forEach(recognizev => {
                const character = recognizev[offset];
                const matchone = tmp.find(t => t.character === character);
                if (matchone) {
                    matchone.count = matchone.count + 1;
                } else {
                    tmp.push({ character: character, count: 0 });
                }
            });
            if (tmp.length > 0) {
                return tmp.sort((o1, o2) => o2.count - o1.count)[0].character;
            } else {
                return ' ';
            }
        });

        const final = maxcharacters.join('');
        console.log('[final]', final);
        return final;
    }
}

interface CharacterCount {
    character: string;
    count: number;
}
