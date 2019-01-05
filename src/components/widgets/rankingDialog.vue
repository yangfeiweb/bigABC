<template>
	<div class="ranking-dialog cnfont">
		<div class='mask' v-show="isShow" @click="maskClick"></div>
		<transition name="ranking-fade" v-on:after-enter="afterEnter" v-on:leave="leaving">
			<div class='dialog' :class='{centerCls:centerDialog}' v-show='showDialog'>
				<div class="dialog-body">
					<img class="floor-plate" src="static/images/game/public/ranking-plate.png" alt="">
					<img class="cancle-img" src="static/images/game/public/right-cancle.png" alt="">
					<div class="cancle-click" @click="hideDialog"></div>
					<div class="main-container">
						<div class="self-ranking">
							<div class="ranking-list-text">
								<p class="ranking-text" v-if="!selfRankingData.rankingImg">{{selfRankingData.index}}</p>
								<img class="crown-list" :src="selfRankingData.rankingImg" alt="" v-else>
							</div>
							<img :src="selfRankingData.icon" class="list-head" alt="">
							<p class="list-name">{{selfRankingData.nickname}}</p>
							<!-- <img class="cion" src="static/images/game/public/cion.png" alt=""> -->
							<p class="list-coin">{{selfRankingData.score}}分</p>
						</div>
						<div class="scroll-content">
							<vue-better-scroll class="wrapper" ref="scroll" direction='horizontal'>
								<ul class="ranking-list">
									<li v-for="(item,index) in lists" :key="index" class="list-item" ref="item">
										<img src="static/images/game/public/other-ranking-plate.png" class="other-plate" alt="">
										<div class="ranking-list-text">
											<img class="crown-list" :src="item.rankingImg" v-if="item.rankingImg" alt="">
											<p class="ranking-text" v-else>{{item.index}}</p>
										</div>
										<img :src="item.icon" class="list-head" alt="">
										<div class="nickname">{{item.nickname}}</div>
										<!-- <img class="cion" src="static/images/game/public/cion.png" alt=""> -->
										<p class="list-score">{{item.score}}分</p>
									</li>
								</ul>
							</vue-better-scroll>
						</div>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>

<script>
	import _ from 'lodash'
	export default {
		name: "rankingDialog",
		props: {
			show: {
				type: Boolean,
				default: false
			},
			closeOnClickModal: {
				type: Boolean,
				default: true
			},
			rankingList: {
				type: Array,
				required: true
			}
		},
		data() {
			return {
				isShow: false,
				showDialog: false,
				centerDialog: false,
				// myData: {},
				rootPath: 'static/images/game/public/',
				//模拟数据
				// items: [
				// 	{ operatorId: 1, icon: "static/images/game/public/userAvatar-default.png", nickname: '张1', score: '1001' },
				// 	{ operatorId: 2, icon: "static/images/game/public/userAvatar-default.png", nickname: '张2', score: '1002' },
				// 	{ operatorId: 3, icon: "static/images/game/public/userAvatar-default.png", nickname: '张3', score: '1003' },
				// 	{ operatorId: 4, icon: "static/images/game/public/userAvatar-default.png", nickname: '张4', score: '1004' },
				// 	{ operatorId: 5, icon: "static/images/game/public/userAvatar-default.png", nickname: '张5', score: '1005' },
				// 	{ operatorId: 7, icon: "static/images/game/public/userAvatar-default.png", nickname: '张6', score: '1006' },
				// 	{ operatorId: 8, icon: "static/images/game/public/userAvatar-default.png", nickname: '张7', score: '1007' },
				// 	{ operatorId: 9, icon: "static/images/game/public/userAvatar-default.png", nickname: '张8', score: '1008' }
				// ]
			};
		},
		watch: {
			show: function (nowStage) {
				this.isShow = nowStage;
				this.showDialog = this.isShow;
			}
		},
		computed: {
			userName() {
				let userInfo = this.$store.getters.userInfo;
				return userInfo.userName;
			},
			lists() {
				if (this.rankingList) {
					let list = _.cloneDeep(this.rankingList)
					list.forEach((item, index) => {
						item.index = index+1;
						item.nickname = item.nickname || '匿名用户'
						if (item.nickname.indexOf('游客') !== -1) {
							item.nickname = item.nickname.slice(0, 7);
						}
						if (!item.icon) {
							if (item.gender === 'MALE') {
								item.icon = this.rootPath + "userAvatar-male.png"
							} else if (item.gender === 'FEMALE') {
								item.icon = this.rootPath + "userAvatar-female.png"
							} else {
								item.icon = this.rootPath + "userAvatar-default.png"
							}
						}
						if (index === 0) {
							item.rankingImg = this.rootPath + "first.png"
						} else if (index === 1) {
							item.rankingImg = this.rootPath + "second.png"
						} else if (index === 2) {
							item.rankingImg = this.rootPath + "third.png"
						} else {
							item.rankingImg = ''
						}
					})
					return list;
				}
			},
			selfRankingData() { //查找自己的
				if (this.lists) {
					let index = this.lists.findIndex(item => item.username == this.userName);
					if (index !== -1) {
						let data = this.lists[index];
						this.lists.splice(index,1);
						return data
					}
				}
				return {}
			}
		},
		mounted() {
			this.isShow = this.show;
			this.showDialog = this.isShow;
			console.log("-----------rankingDialog", this)
		},
		methods: {
			maskClick: function () {
				console.log("--------- musk click");
				if (this.closeOnClickModal) {
					this.hideDialog();
				}
			},
			closeDialog: function () {
				this.hideDialog();
			},
			hideDialog: function () {
				console.log("-----------hide dialog")
				this.showDialog = false;
				setTimeout(() => {
					this.$emit("update:show", false);
				}, 400);
			},
			afterEnter: function () {
				this.centerDialog = true;
				// this.$refs.scroll.forceUpdate(true);
			},
			leaving: function () {
				this.centerDialog = false;
			}
		},
		updated() {
			let items = this.$refs.item;
			if (items) {
				let firstChild = items[0];
				this.$refs.scroll.refresh();
				this.$refs.scroll.scrollToElement(firstChild, 100);
			}
		}
	};
</script>

<style lang="scss" scoped>
	@import '~@/assets/css/variables';
	.ranking-dialog {
		margin: 0;
		padding: 0;
		.mask {
			position: fixed;
			z-index: 1000;
			top: 0;
			right: 0;
			left: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.6);
		}
		.dialog {
			position: fixed;
			top: 50%;
			left: 50%;
			width: 900px;
			height: 1220px;
			transform: translate(-50%, -50%);
			z-index: 5000;
			.dialog-body {
				position: relative;
				.floor-plate {
					position: absolute;
					top: 50%;
					left: 50%;
					width: 1080px;
					height: 607px;
					transform: translate(-50%, 50%) rotate(90deg);
				}
				.cancle-img {
					position: absolute;
					bottom: -1145px;
					right: 180px;
					width: 70px;
					height: 70px;
				}
				.cancle-click {
					position: absolute;
					bottom: -1160px;
					right: 170px;
					width: 100px;
					height: 100px;
					z-index: 9999;
					background-color: transparent;
				}
				.main-container {
					position: absolute;
					top: 50%;
					left: 50%;
					width: 607px;
					height: 1080px;
					padding: 5%;
					transform: translate(-50%, 5%);
					box-sizing: border-box;
				}
				.self-ranking {
					position: absolute;
					top: 50%;
					right: 170px;
					width: 935px;
					height: 79px;
					padding: 0 30px;
					border-radius: 20px;
					// border-bottom: 2px solid $stroke-color;
					border: 2px solid #f4d795;
					background-color: #ffffff;
					transform: translate(50%, -51%) rotate(90deg);
					box-sizing: border-box;
					display: flex;
					align-items: center;
				}
				.ranking-list-text {
					display: inline-block;
					height: 79px;
					margin: 0 30px;
				}
				.ranking-text {
					display: inline-block;
					width: 50px;
					height: 79px;
					line-height: 79px;
					text-align: center;
					font-size: $large-font-size;
					text-shadow: $main-color 1px 0 0, $main-color 0 1px 0,
						$main-color -1px 0 0, $main-color 0 -1px 0;
					color: #ffffff;
				}
				.crown-list {
					width: 50px;
					height: 50px;
					margin-top: 15px;
				}

				.list-head {
					width: 69px;
					height: 69px;
					margin-left: 50px;
				}
				.list-name {
					width: 340px;
					font-size: $normal-font-size;
					color: $main-color;
					margin-left: 40px;
					white-space: nowrap;
					text-overflow: '…';
					overflow: hidden;
				}
				// .cion {
				// 	width: 50px;
				// 	// margin-left: 150px;
				// }
				.list-coin {
					margin-left: 150px;
					color: $main-color;
					font-size: $normal-font-size;
					font-weight: bold;
				}
				.scroll-content {
					position: absolute;
					top: 5%;
					right: 222px;
					width: 360px;
					height: 980px;
					overflow: hidden;
					display: flex;
				}
				.wrapper {
					width: 100%;
					height: 100%;
					border-radius: 20px;
					overflow: hidden;
					display: flex;
				}
				.ranking-list {
					position: relative;
					list-style: none;
					display: flex;
					flex-direction: row-reverse;
				}
				.list-item {
					transform: rotate(90deg);
					display: flex;
					align-items: center;
					width: 89px;
					height: 89px;
					.other-plate {
						position: absolute;
						width: 980px;
						height: 109px;
					}
					& > div,
					& > p,
					& > img {
						z-index: 999;
					}
					.ranking-text,
					.crown-list {
						margin-left: 50px;
					}
					.nickname {
						width: 340px;
						height: 79px;
						position: absolute;
						top: 20px;
						left: 320px;
						font-size: $normal-font-size;
						color: $main-color;
						white-space: nowrap;
						text-overflow: '…';
						overflow: hidden;
					}
					// .cion {
					// 	margin-left: 390px;
					// }
					.list-score {
						width: 80px;
						margin-left: 530px;
						color: $main-color;
						font-size: $normal-font-size;
						font-weight: bold;
						white-space: nowrap;
					}
				}
			}
		}

		// .dialog.centerCls {
		// transform: translate(-50%, -50%) rotate(90deg);
		// }
		.ranking-fade-enter-active {
			transition-duration: 0.5s;
			transform: translate(-50%, -50%);
			transition-property: transform;
		}
		.ranking-fade-leave-active {
			transition-duration: 0.5s;
			transform: translate(-50%, -2000px);
			transition-property: transform;
		}
		.ranking-fade-enter {
			transform: translate(-50%, -2000px);
		}
		.ranking-fade-enter-to {
			transform: translate(-50%, -50%);
		}
	}
</style>