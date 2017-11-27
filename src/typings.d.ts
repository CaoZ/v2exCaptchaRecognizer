/* SystemJS module definition */
/// <reference path="..\node_modules\@types\gapi.client\index.d.ts" />
/// <reference path="..\node_modules\@types\gapi.client.vision\index.d.ts" />
declare var module: NodeModule;
interface NodeModule {
    id: string;
}

declare namespace bdaip {
    export class ocr {
        devAuth: devAuth;
        constructor(APP_ID: string, API_KEY: string, SECRET_KEY: string)
        generalBasic(base64Img: string, option?: options): Promise<GeneralBasicResponse>
        generalBasicUrl(imgUrl: string, option?: options): Promise<GeneralBasicResponse>
    }

    export interface options {
        language_type?: 'CHN_ENG' | 'ENG' | 'POR' | 'FRE' | 'GER' | 'ITA' | 'SPA' | 'RUS' | 'JAP',
        detect_direction?: boolean,
        detect_language?: boolean,
        probability?: boolean
    }

    export interface GeneralBasicResponse {
        direction?: number,
        log_id: number,
        words_result_num: number,
        words_result: words_result[],
        error_code: number;
        error_msg?: string;
    }

    export interface words_result {
        words: string
    }

    export interface devAuth {
        _events: events;
    }

    export interface events {
        event_gettoken_success: (o: authInfo) => void;
        event_gettoken_error: (error: authError) => void;
    }

    export interface authInfo {
        authDate?: Date;
        expireTime?: number;
        hasScopeFlag?: boolean;
        scope?: string;
        token?: string;
    }

    export interface authError {
        errorType?: number;
        error?: string;
    }
}