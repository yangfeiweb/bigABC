<template>
    <div class="crop-picture" v-show="isShow">
        <div class="crop-header">
            <i @click="closeCropPicture" class="close-crop iconfont icon-arrow-left"></i>
            <div class="save-crop" @click="saveCropPicture">
                <i class="iconfont icon-duihao"></i>
                保存
            </div>
        </div>
        <div class="crop-body">
            <vue-croppa class="my-croppa"
                 v-if="isShow" 
                 ref="crop"
                :width="canvasWidth" 
                :height="canvasHeight" 
                :quality="1"
                :zoom-speed="6"
                :canvas-color="'#e6e6e6'" 
                :placeholder="'请选择一张图片'" 
                :initial-image="imgUrl" 
                :show-remove-button="false" 
                @move="imgMove" 
                @zoom="handleCroppaZoom"></vue-croppa>

            <!-- <button @click="rotate">rotate</button> -->
            <div class="rotate-icon" @click="rotate">
                <i class="iconfont icon-rotate1"></i>
            </div>
        </div>

    </div>
</template>

<script>
    import Croppa from 'vue-croppa'
    import dataService from "@/service/index";
    import reqUrl from "@/service/urlConfig";
    import { getRequestSign } from '@/utility/http'

    import { API_VERSION,VERSION_CODE} from '@/utility/dict'
    import utility from '@/utility/utility'

    const vueCroppa = Croppa.component
    export default {
        name: "corpPicture",
        props: {
            show: {
                type: Boolean,
                default: true
            },
            url: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                canvasWidth: 300,
                canvasHeight: 300,
                isShow: false,
                imgUrl: '',
            }
        },
        watch: {
            show(val) {
                this.isShow = false
                this.isShow = val
                let crop = this.$refs.crop;
                if(val && crop){
                    crop.refresh()
                }
            },
            url(val) {
                if (val) {
                    this.imgUrl = val
                }
            }
        },
        computed: {
            token: function () {
                return this.$store.getters.token;
            },
        },
        mounted() {
            this.imgUrl = this.url;
            this.isShow = this.show;
        },
        methods: {
            rotate() {
                this.rotateCount++;
                let crop = this.$refs.crop;
                let data = crop.imgData;
                let x = 0;
                let y = 0;
                if (data.startX < 0) {
                    x = -data.startX;
                }
                if (data.startY < 0) {
                    y = -data.startY
                }
                crop.rotate()
                crop.move({ x: x, y: y })
            },
            closeCropPicture() { //关闭裁剪页面
                this.$emit("update:show", false)
                this.isShow = false
            },
            saveCropPicture() {
                plus.nativeUI.showWaiting()
                let store = this.$store;
                let router = this.$router;
                let crop =  this.$refs.crop;
                    crop.generateBlob( (blob) => {
                        let uploadData = new window.FormData();
                        uploadData.append("file", blob, "image.jpeg");
                        let ts = utility.dateToTimeStr(new Date());
                        let params = {
                            token: this.token,
                            version: API_VERSION,
                            versionCode: VERSION_CODE,
                            ts: ts
                        };
                        let sign = getRequestSign(params);
                        for (let key in params) {
                            uploadData.append(key, params[key]);
                        }
                        uploadData.append("sign", sign)
                        this.$http.post(reqUrl.POST_USER_IMG, uploadData).then(res => {
                            console.log('--------upload success', res)
                            let resultData = res.data;
                            let code = resultData.code;
                            let data = resultData.data
                            if(code===200){
                                let icon = data.icon;
                                this.$store.dispatch("showTipsMsg", "上传成功");
                                this.$store.commit("updateUserIcon", icon);
                            }else if (code === 401) {
                                store.commit('loading', false)
                                // 重新登陆， 重新请求
                                store.commit('clearToken')
                                let userInfo = store.getters.userInfo
                                if (userInfo && userInfo.username && userInfo.pwd) {
                                store
                                    .dispatch('login', {
                                    username: userInfo.username,
                                    pwd: userInfo.pwd,
                                    isTourist: userInfo.isTourist
                                    })
                                    .then(res => {
                                    return setRequest(url, params, type)
                                    })
                                } else {
                                router.replace({ name: 'login' })
                                }
                            } else if (code === 402) {
                                store.commit('loading', false)
                                // 退出登录
                                store.dispatch('showTipsMsg', '账号在其他地方登录，请重新登录！')
                                store.commit('clearToken')
                                store.commit('clearUserInfo')
                                router.replace({ name: 'login' })
                            } else if (code === 600) {
                                store.commit('loading', false)
                                if (store.getters.isTourist) {
                                store.dispatch('showTipsDialog', '游客体验已过期，请注册账号！')
                                } else {
                                store.commit('setVipTipDialog', true)
                                }
                            } else if (code === 202) {
                                store.dispatch('showTipsDialog', '系统升级中，请稍后！')
                            } else if (code !== 200) {
                                store.commit('loading', false)
                                let msg = resultData.msg
                                store.dispatch('showTipsMsg', msg || '请求失败，请重试！')
                            }
                            crop.remove()
                            // crop.refresh()
                            this.closeCropPicture()
                            plus.nativeUI.closeWaiting();
                        }, err => {
                            this.$store.dispatch("showTipsMsg", "上传失败，请稍候重试！");
                            console.log('--------upload success', err)
                            plus.nativeUI.closeWaiting();
                        });
                    },"image/jpeg",1);
            },
            imgMove() { //为了不让图片超出边界，每次移动的时候，做一次判断
                let crop = this.$refs.crop;
                if (crop) {
                    let imgData = crop.imgData;
                    let width = imgData.width;
                    let height = imgData.height;
                    let absX = Math.abs(imgData.startX) + 300
                    let absY = Math.abs(imgData.startY) + 300
                    if (imgData.startY > 0 || imgData.startX > 0 || absX > width || absY > height) {
                        let x = 0
                        let y = 0
                        if (imgData.startX > 0) {
                            x = -imgData.startX
                        } else if (absX > width) {
                            x = absX - width;
                        }
                        if (imgData.startY > 0) {
                            y = -imgData.startY
                        } else if (absY > height) {
                            y = absY - height
                        }
                        crop.move({ x: x, y: y })
                    }
                }
            },
            handleCroppaZoom(){
                let crop = this.$refs.crop;
                let width = crop.imgData.width;
                let height = crop.imgData.height;
                if(width<300 ||height<300 ){
                    crop.zoomIn()
                    // crop.refresh()
                }
            }
        },
        components: {
            vueCroppa
        }
    }
</script>

<style lang="scss" scoped>
    @import '~@/assets/css/variables';
    .crop-picture {
    	position: fixed;
    	top: 0;
    	left: 0;
    	bottom: 0;
    	right: 0;
    	margin: 0;
    	padding: 0;
    	background-color: #ffffff;
    	z-index: 9999;
    	.crop-header {
    		position: relative;
    		width: 100%;
    		height: $nav-line-height;
    		line-height: $nav-line-height;
    		background-color: $main-color;
    		color: #fff;
    		.close-crop {
    			display: inline-block;
    			width: 10%;
    			height: $nav-line-height;
    			font-size: $normal-font-size;
    			margin-left: 20px;
    		}
    		.save-crop {
    			position: absolute;
    			top: 10px;
    			right: 20px;
    			width: 150px;
    			height: 80px;
    			line-height: 80px;
    			text-align: center;
    			font-size: $normal-font-size;
    			color: #ffffff;
    		}
    	}
    	.crop-body {
    		width: 600px;
    		height: 600px;
    		margin: 100px auto;
    		.my-croppa {
    			width: 100%;
    			height: 100%;
    			border-radius: 50%;
    			// margin-left:30px;
    		}
    		.rotate-icon {
    			width: 80px;
    			height: 80px;
    			margin: 80px auto;
    			i {
    				font-size: $max-font-size;
    			}
    		}
    	}
    }
</style>
