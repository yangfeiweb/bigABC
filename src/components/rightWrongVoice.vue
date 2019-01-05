<template>
    <div class="audio">
        <audio :src="successAudioUrl" ref="successAudio"></audio>
        <audio :src="failedAudioUrl" ref="failedAudio"></audio>
    </div>
</template>

<script>
export default {
    data(){
        return {
            successAudioUrl:'static/audio/addScore.mp3',
            failedAudioUrl:'static/audio/failed-ao.mp3'
        }
    },
    methods:{
        playSuccess(){
            if(this.$refs.successAudio){
                let audio = this.$refs.successAudio;
                if(!audio.paused){
                    console.log("--------------successAudio 暂停了")
                    audio.pause()
                }
                audio.currentTime = 0;
                audio.play()
            }
        },
        playFailed(){
            if(this.$refs.failedAudio){
                let audio = this.$refs.failedAudio;
                if(!audio.paused){
                    console.log("--------------failedAudio 暂停了")
                    audio.pause()
                }
                audio.play()
            }
        }
    },
    beforDestroy(){
        this.$refs.failedAudio.paused && this.$refs.failedAudio.pause()
        this.$refs.successAudio.paused && this.$refs.successAudio.pause()
    }
}
</script>

<style>

</style>
