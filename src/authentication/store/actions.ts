import { ActionContext } from "vuex"
import { AuthenticationState } from "./states"
import { AxiosResponse } from "axios"
import axiosInst from "@/utility/axiosInstance"

export type AuthenticationActions = {
    requestKakaoOauthRedirectionToDjango(): Promise<void>
    requestAccessTokenToDjangoRedirection(
        context: ActionContext<AuthenticationState, any>,
        payload: { code: string }): Promise<void>
    requestUserInfoToDjango(
        context: ActionContext<AuthenticationState, any>): Promise<any>
    requestAddRedisAccessTokenToDjango(
        context: ActionContext<AuthenticationState, any>,
        { email, accessToken }: { email: string, accessToken: string}
    ): Promise<any>
}

const actions: AuthenticationActions = {
    async requestKakaoOauthRedirectionToDjango(): Promise<void> {
        return axiosInst.djangoAxiosInst.get('/oauth/kakao').then((res) => {
            window.location.href = res.data.url
        })
    },
    async requestAccessTokenToDjangoRedirection(
                context: ActionContext<AuthenticationState, any>,
                payload: { code: string }): Promise<void> {

        try {
            console.log('requestAccessTokenToDjangoRedirection()')
            const { code } = payload

            const response = await axiosInst.djangoAxiosInst.post(
                '/oauth/kakao/access-token', { code })
            localStorage.setItem("accessToken", response.data.accessToken.access_token)
        } catch (error) {
            console.log('Access Token 요청 중 문제 발생:', error)
            throw error
        }
    },
    async requestUserInfoToDjango(
        context: ActionContext<AuthenticationState, any>): Promise<any> {

        try {
            const accessToken = localStorage.getItem("accessToken");
            const userInfoResponse: AxiosResponse<any> =
                await axiosInst.djangoAxiosInst.post(
                    '/oauth/kakao/user-info',
                    { access_token: accessToken});

            const userInfo = userInfoResponse.data.user_info
            return userInfo 
        } catch (error) {
            alert('사용자 정보 가져오기 실패!')
            throw error;
        }
    },
    async requestAddRedisAccessTokenToDjango(
        { commit, state }: ActionContext<AuthenticationState, any>,
        { email, accessToken }: { email: string, accessToken: string } 
    ): Promise<any> {
        try {
            console.log("requestAddRedisAccessTokenToDjango -> email:", email)
            console.log("requestAddRedisAccessTokenToDjango -> accessToken:", accessToken)
            const response: AxiosResponse<any> = await axiosInst.djangoAxiosInst.post(
                '/oauth/redis-access-token/', {
                    email: email,
                    accessToken: accessToken
                });

            console.log('userToken:', response.data)

            localStorage.setItem("userToken", response.data)
            return response.data;
        } catch (error) {
            console.error('Error adding redis access token:', error);
            throw error;
        }
    },
}; 
    
export default actions;