import { ConnectListener } from './connect-listener';
import * as sharedcommon from '../src/app/common/sharedcommon';
import { OptionsManager } from '../src/app/common/options.manager';
import { ReflectiveInjector } from '@angular/core';
import * as $ from 'jquery';

class Boot {
    // tslint:disable-next-line:max-line-length
    captchaHtml = `<input id="${sharedcommon.Utils.captchaElementId_input}" type="button"  class="super normal button" value="识别验证码" style="margin-left:15px">
    <div class="cssload-loader" id="${sharedcommon.Utils.captchaElementId_spinner}">
        <div class="cssload-inner cssload-one"></div>
        <div class="cssload-inner cssload-two"></div>
        <div class="cssload-inner cssload-three"></div>
    </div>`;
    captchaProblemHtml = `<div class="problem" id=${sharedcommon.Utils.captchaElementId_problem}><span></span><ul><li></li></ul></div>`;
    connectlistener: ConnectListener;
    optionManager: OptionsManager;
    constructor() {
        this.connectlistener = new ConnectListener(this.onConnectMessage.bind(this));
        // this.resolve_captcha();
        const injector = ReflectiveInjector.resolveAndCreate([OptionsManager]);
        this.optionManager = injector.get(OptionsManager);
        this.optionManager.onload = () => {
            if (this.optionManager.options.enable) {
                this.enableExtension();
            } else {
                this.removeExtension();
            }
        };
    }

    private enableExtension() {
        // remove previous elements
        this.removeExtension();
        const placeTd = $('td>:submit').closest('td');
        const captchaElement = $(this.captchaHtml);
        placeTd.append(captchaElement);
        const captchaProblem = $(this.captchaProblemHtml);
        $('td>:submit').closest('div.box').append(captchaProblem);

        // hide spinner and error box
        $(`#${sharedcommon.Utils.captchaElementId_spinner}`).hide();
        $(`#${sharedcommon.Utils.captchaElementId_problem}`).hide();

        // listen click event
        $(`#${sharedcommon.Utils.captchaElementId_input}`).click(async () => {
            $(`#${sharedcommon.Utils.captchaElementId_problem}`).hide();
            $(`#${sharedcommon.Utils.captchaElementId_input}`).prop('disabled', true);
            $(`#${sharedcommon.Utils.captchaElementId_spinner}`).show();
            await this.resolve_captcha();
        });
    }

    private removeExtension() {
        $(`#${sharedcommon.Utils.captchaElementId_input}`).remove();
        $(`#${sharedcommon.Utils.captchaElementId_spinner}`).remove();
        $(`#${sharedcommon.Utils.captchaElementId_problem}`).remove();
    }

    private setProblem(content: string, title: string = '识别验证码失败') {
        $(`#${sharedcommon.Utils.captchaElementId_problem}`).find('span').text(title);
        $(`#${sharedcommon.Utils.captchaElementId_problem}`).find('li').text(content);
        $(`#${sharedcommon.Utils.captchaElementId_problem}`).show();
    }

    private onConnectMessage(message: Object) {
        console.log('message', message);
        if (message as sharedcommon.RuntimeMessageRecognizeCaptcha) {
            $(`#${sharedcommon.Utils.captchaElementId_input}`).prop('disabled', false);
            $(`#${sharedcommon.Utils.captchaElementId_spinner}`).hide();
            const recognizedCaptcha = message as sharedcommon.RuntimeMessageRecognizeCaptcha;
            console.log('recognizedCaptcha', recognizedCaptcha);
            if (!recognizedCaptcha.recognize_captcha.ok) {
                if (recognizedCaptcha.recognize_captcha.error) {
                    this.setProblem(recognizedCaptcha.recognize_captcha.error);
                } else {
                    this.setProblem('服务没有给出错误原因，可能是网络问题');
                }
            } else {
                const captchaInput = sharedcommon.Utils
                    .getElementByXpath<HTMLInputElement>(`//div[contains(@style,"background-image: url(\'/_captcha")]/parent::td/input`);
                if (recognizedCaptcha.recognize_captcha.ok) {
                    captchaInput.value = recognizedCaptcha.recognize_captcha.result;
                    if (!recognizedCaptcha.recognize_captcha.result || recognizedCaptcha.recognize_captcha.result.trim() === '') {
                        this.setProblem('识别失败，可能是图片识别数太低，可以适当增大后重试');
                    }
                }
            }
        }
    }

    private async resolve_captcha() {
        const captcha = sharedcommon.Utils.getElementByXpath(`//div[contains(@style,"background-image: url(\'/_captcha")]`);
        const background_image = captcha.style.getPropertyValue('background-image');
        const image_url_regex = /url\("(.+)"\)/i;
        const matches = background_image.match(image_url_regex);
        if (matches.length !== 2) {
            return;
        }

        const image_url = matches[1];
        const image_base64s: string[] = [];
        for (let index = 0; index < this.optionManager.options.picnum; index++) {
            const base64data = await sharedcommon.Utils.getbase64async(location.origin + image_url);
            if (base64data && base64data.valid) {
                image_base64s.push(base64data.base64);
            }
        }

        const merged_dataurl = await this.merge_images(image_base64s);
        console.log('merged_dataurl', merged_dataurl);
        const merged_dataurl_base64 = merged_dataurl.replace('data:image/png;base64,', '');

        const runtimemsg: sharedcommon.RuntimeMessageImageBase64s = new sharedcommon.RuntimeMessageImageBase64s();
        runtimemsg.image_base64s = [merged_dataurl_base64];
        this.connectlistener.post(runtimemsg);
    }

    private async merge_images(base64s: string[]) {
        let width = 0;
        let height = 0;
        const allimgs = await new Promise<HTMLImageElement[]>((resolve) => {
            let count = base64s.length;
            const imgs = base64s.map(base64 => {
                const img = new Image();
                img.src = `data:image/png;base64,${base64}`;
                img.onload = () => {
                    if (width < img.width) {
                        width = img.width;
                    }

                    height = height + img.height;
                    count--;
                    if (count === 0) {
                        resolve(imgs);
                    }
                };
                return img;
            });
        });

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        console.log(`create canvas with ${width} * ${height}`);
        const context = canvas.getContext('2d');
        let verticalOffset = 0;
        allimgs.forEach(img => {
            context.drawImage(img, 0, verticalOffset);
            verticalOffset = verticalOffset + img.height;
        });
        return canvas.toDataURL();
    }
}

const boot = new Boot();

