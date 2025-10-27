import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class HttpApiService {
    private muleConfig;
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.muleConfig = this.configService.get('mule');
    }

    prepareHeaderAndUrl(dynamicUrl: string, szType?: string) {
        let url = this.muleConfig.muleBaseUrl + dynamicUrl;
        const headers = {
            'content-type': 'application/json',
            'client_id': this.muleConfig.clientId,
            'client_secret': this.muleConfig.clientSecret,
            token: ''
        };
        if (szType === 'Schedule') {
            url = this.muleConfig.erpBaseUrl;
            headers.token = this.muleConfig.erpToken
        }
        return {
            url: url,
            headers: headers
        }
    }


    prepareHeaderAndUrlForPT(dynamicUrl: string) {
        let url = this.muleConfig.ptBaseUrl + dynamicUrl;
        const headers = {
            'content-type': 'application/json',
            'client_id': this.muleConfig.ptClientId,
            'client_secret': this.muleConfig.ptClientSecret,
        };
        return {
            url: url,
            headers: headers
        }
    }
    async HttpDataGet(dynamicUrl: string, szType: string) {
        const { url, headers } = this.prepareHeaderAndUrl(dynamicUrl, szType);
        const response = await this.httpService.get(url, { headers });
        // Convert Observable to a promise and return the resolved data
        const responseData = await lastValueFrom(response);
        return responseData;
    }

    async HttpDataPost<T>(dynamicUrl: string, data: T, szType?: string) {
        let url: string;
        let headers: Record<string, string>;
        if (szType === 'PT') {
            ({ url, headers } = this.prepareHeaderAndUrlForPT(dynamicUrl));
        } else {
            ({ url, headers } = this.prepareHeaderAndUrl(dynamicUrl, szType));
        }
        const response = await this.httpService.post(url, data, { headers });
        // Convert Observable to a promise and return the resolved data
        const responseData = await lastValueFrom(response);

        return responseData


    }
}