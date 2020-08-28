import * as React from 'react'

import { MojangStatus, MojangStatusColor } from 'common/mojang/rest/internal/MojangStatus'
import { MojangResponse } from 'common/mojang/rest/internal/MojangResponse'
import { MojangRestAPI } from 'common/mojang/rest/MojangRestAPI'
import { RestResponseStatus } from 'common/got/RestResponse'
import { LoggerUtil } from 'common/logging/loggerutil'

import './Landing.css'

interface LandingState {
    mojangStatuses: MojangStatus[]
}

export default class Landing extends React.Component<unknown, LandingState> {

    private static readonly logger = LoggerUtil.getLogger('Landing')

    private mojangStatusInterval!: NodeJS.Timeout

    constructor(props: unknown) {
        super(props)
        this.state = {
            mojangStatuses: []
        }
    }

    async componentDidMount(): Promise<void> {

        // Load Mojang statuses and setup refresh interval.
        Landing.logger.info('Loading mojang statuses..')
        await this.loadMojangStatuses()
        this.mojangStatusInterval = setInterval(async () => {
            Landing.logger.info('Refreshing Mojang Statuses..')
            await this.loadMojangStatuses()
        }, 300000)

    }

    componentWillUnmount(): void {

        // Clean up intervals.
        clearInterval(this.mojangStatusInterval)

    }

    private loadMojangStatuses = async (): Promise<void> => {
        const response: MojangResponse<MojangStatus[]> = await MojangRestAPI.status()

        if(response.responseStatus !== RestResponseStatus.SUCCESS) {
            Landing.logger.warn('Failed to retrieve Mojang Statuses.')
        }

        // TODO Temp workaround because their status checker always shows
        // this as red. https://bugs.mojang.com/browse/WEB-2303
        const statuses = response.data
        for(const status of statuses) {
            if(status.service === 'sessionserver.mojang.com' || status.service === 'minecraft.net') {
                status.status = MojangStatusColor.GREEN
            }
        }

        this.setState({
            ...this.state,
            mojangStatuses: response.data
        })

    }

    private getMainMojangStatusColor = (): string => {
        const essential = this.state.mojangStatuses.filter(s => s.essential)

        if(this.state.mojangStatuses.length === 0) {
            return MojangRestAPI.statusToHex(MojangStatusColor.GREY)
        }

        // If any essential are red, it's red.
        if(essential.filter(s => s.status === MojangStatusColor.RED).length > 0) {
            return MojangRestAPI.statusToHex(MojangStatusColor.RED)
        }
        // If any essential are yellow, it's yellow.
        if(essential.filter(s => s.status === MojangStatusColor.YELLOW).length > 0) {
            return MojangRestAPI.statusToHex(MojangStatusColor.YELLOW)
        }
        // If any non-essential are not green, return yellow.
        if(this.state.mojangStatuses.filter(s => s.status !== MojangStatusColor.GREEN && s.status !== MojangStatusColor.GREY).length > 0) {
            return MojangRestAPI.statusToHex(MojangStatusColor.YELLOW)
        }
        // if all are grey, return grey.
        if(this.state.mojangStatuses.filter(s => s.status === MojangStatusColor.GREY).length === this.state.mojangStatuses.length) {
            return MojangRestAPI.statusToHex(MojangStatusColor.GREY)
        }

        return MojangRestAPI.statusToHex(MojangStatusColor.GREEN)
    }

    private getMojangStatusesAsJSX = (essential: boolean): JSX.Element[] => {
        
        const statuses: JSX.Element[] = []
        for(const status of this.state.mojangStatuses.filter(s => s.essential === essential)) {
            statuses.push(
                <>
                    <div className="mojangStatusContainer">
                        <span className="mojangStatusIcon" style={{color: MojangRestAPI.statusToHex(status.status)}}>&#8226;</span>
                        <span className="mojangStatusName">{status.name}</span>
                    </div>
                </>
            )
        }
        return statuses
    }

    render(): JSX.Element {
        return <>
            
            <div id="landingContainer">
                <div id="upper">
                    <div id="left">
                        <div id="image_seal_container">
                            <img id="image_seal" src="../images/SealCircle.png"/>
                            <div id="updateAvailableTooltip">Update Available</div>
                        </div>
                    </div>
                    <div id="content">
                    </div>
                    <div id="right">
                        <div id="rightContainer">
                            <div id="user_content">
                                <span id="user_text">Username</span>
                                <div id="avatarContainer">
                                    <button id="avatarOverlay">Edit</button>
                                </div>
                            </div>
                            <div id="mediaContent">
                                <div id="internalMedia">
                                    <div className="mediaContainer" id="settingsMediaContainer">
                                        <button className="mediaButton" id="settingsMediaButton">
                                            <svg id="settingsSVG" className="mediaSVG" viewBox="0 0 141.36 137.43">
                                                <path d="M70.70475616319865,83.36934004916053 a15.320781354859122,15.320781354859122 0 1 1 14.454501310561755,-15.296030496450625 A14.850515045097694,14.850515045097694 0 0 1 70.70475616319865,83.36934004916053 M123.25082856443602,55.425620905968366 h-12.375429204248078 A45.54157947163293,45.54157947163293 0 0 0 107.21227231573047,46.243052436416285 l8.613298726156664,-9.108315894326587 a9.727087354538993,9.727087354538993 0 0 0 0,-13.167456673319956 l-3.465120177189462,-3.6631270444574313 a8.489544434114185,8.489544434114185 0 0 0 -12.375429204248078,0 l-8.613298726156664,9.108315894326587 A40.442902639482725,40.442902639482725 0 0 0 81.99114759747292,25.427580514871032 V12.532383284044531 a9.108315894326587,9.108315894326587 0 0 0 -8.811305593424633,-9.306322761594556 h-4.950171681699231 a9.108315894326587,9.108315894326587 0 0 0 -8.811305593424633,9.306322761594556 v12.895197230826497 a40.17064319698927,40.17064319698927 0 0 0 -9.331073620003052,4.0591407789933704 l-8.613298726156664,-9.108315894326587 a8.489544434114185,8.489544434114185 0 0 0 -12.375429204248078,0 L25.58394128451018,23.967279868769744 a9.727087354538993,9.727087354538993 0 0 0 0,13.167456673319956 L34.19724001066683,46.243052436416285 a45.07131316187151,45.07131316187151 0 0 0 -3.6631270444574313,9.083565035918088 h-12.375429204248078 a9.083565035918088,9.083565035918088 0 0 0 -8.811305593424633,9.306322761594556 v5.197680265784193 a9.108315894326587,9.108315894326587 0 0 0 8.811305593424633,9.306322761594556 h11.979415469712139 a45.69008462208391,45.69008462208391 0 0 0 4.0591407789933704,10.642869115653347 l-8.613298726156664,9.108315894326587 a9.727087354538993,9.727087354538993 0 0 0 0,13.167456673319956 l3.465120177189462,3.6631270444574313 a8.489544434114185,8.489544434114185 0 0 0 12.375429204248078,0 l8.613298726156664,-9.108315894326587 a40.49240435629971,40.49240435629971 0 0 0 9.331073620003052,4.0591407789933704 v12.895197230826497 a9.083565035918088,9.083565035918088 0 0 0 8.811305593424633,9.306322761594556 h4.950171681699231 A9.083565035918088,9.083565035918088 0 0 0 81.99114759747292,123.68848839660077 V110.79329116577425 a40.78941465720167,40.78941465720167 0 0 0 9.331073620003052,-4.0591407789933704 l8.613298726156664,9.108315894326587 a8.489544434114185,8.489544434114185 0 0 0 12.375429204248078,0 l3.465120177189462,-3.6631270444574313 a9.727087354538993,9.727087354538993 0 0 0 0,-13.167456673319956 l-8.613298726156664,-9.108315894326587 a45.665333763675406,45.665333763675406 0 0 0 4.034389920584874,-10.642869115653347 h12.004166328120636 a9.108315894326587,9.108315894326587 0 0 0 8.811305593424633,-9.306322761594556 v-5.197680265784193 a9.083565035918088,9.083565035918088 0 0 0 -8.811305593424633,-9.306322761594556 " id="svg_3" className=""/>
                                            </svg>
                                            <div id="settingsTooltip">Settings</div>
                                        </button>
                                    </div>
                                </div>
                                <div className="mediaDivider"></div>
                                <div id="externalMedia">
                                    <div className="mediaContainer">
                                        <a href="https://github.com/dscalZi/HeliosLauncher" className="mediaURL" id="linkURL">
                                            <svg id="linkSVG" className="mediaSVG" viewBox="35.34 34.3575 70.68 68.71500">
                                                <g>
                                                    <path d="M75.37,65.51a3.85,3.85,0,0,0-1.73.42,8.22,8.22,0,0,1,.94,3.76A8.36,8.36,0,0,1,66.23,78H46.37a8.35,8.35,0,1,1,0-16.7h9.18a21.51,21.51,0,0,1,6.65-8.72H46.37a17.07,17.07,0,1,0,0,34.15H66.23A17,17,0,0,0,82.77,65.51Z"/>
                                                    <path d="M66,73.88a3.85,3.85,0,0,0,1.73-.42,8.22,8.22,0,0,1-.94-3.76,8.36,8.36,0,0,1,8.35-8.35H95A8.35,8.35,0,1,1,95,78H85.8a21.51,21.51,0,0,1-6.65,8.72H95a17.07,17.07,0,0,0,0-34.15H75.13A17,17,0,0,0,58.59,73.88Z"/>
                                                </g>
                                            </svg>
                                        </a>
                                    </div>
                                    <div className="mediaContainer">
                                        <a href="#" className="mediaURL" id="twitterURL" {...{disabled: true}}>
                                            <svg id="twitterSVG" className="mediaSVG" viewBox="0 0 5000 4060" preserveAspectRatio="xMidYMid meet">	
                                                <g>
                                                    <path d="M1210 4048 c-350 -30 -780 -175 -1124 -378 -56 -33 -86 -57 -86 -68 0 -16 7 -17 83 -9 114 12 349 1 493 -22 295 -49 620 -180 843 -341 l54 -38 -49 -7 c-367 -49 -660 -256 -821 -582 -30 -61 -53 -120 -51 -130 3 -16 12 -17 73 -13 97 7 199 5 270 -4 l60 -9 -65 -22 c-341 -117 -609 -419 -681 -769 -18 -88 -26 -226 -13 -239 4 -3 32 7 63 22 68 35 198 77 266 86 28 4 58 9 68 12 10 2 -22 -34 -72 -82 -240 -232 -353 -532 -321 -852 15 -149 79 -347 133 -418 16 -20 17 -19 49 20 377 455 913 795 1491 945 160 41 346 74 485 86 l82 7 -7 -59 c-5 -33 -7 -117 -6 -189 2 -163 31 -286 103 -430 141 -285 422 -504 708 -550 112 -19 333 -19 442 0 180 30 335 108 477 239 l58 54 95 -24 c143 -36 286 -89 427 -160 70 -35 131 -60 135 -56 19 19 -74 209 -151 312 -50 66 -161 178 -216 217 l-30 22 73 -14 c111 -21 257 -63 353 -101 99 -39 99 -39 99 -19 0 57 -237 326 -412 468 l-88 71 6 51 c4 28 1 130 -5 226 -30 440 -131 806 -333 1202 -380 745 -1036 1277 -1823 1477 -243 62 -430 81 -786 78 -134 0 -291 -5 -349 -10z"/>
                                                </g>
                                            </svg>
                                        </a>
                                    </div>
                                    <div className="mediaContainer">
                                        <a href="#" className="mediaURL" id="instagramURL" {...{disabled: true}}>
                                            <svg id="instagramSVG" className="mediaSVG" viewBox="0 0 5040 5040">
                                                <defs>
                                                    <radialGradient id="instaFill" cx="30%" cy="107%" r="150%">
                                                        <stop offset="0%" stopColor="#fdf497"/>
                                                        <stop offset="5%" stopColor="#fdf497"/>
                                                        <stop offset="45%" stopColor="#fd5949"/>
                                                        <stop offset="60%" stopColor="#d6249f"/>
                                                        <stop offset="90%" stopColor="#285AEB"/>
                                                    </radialGradient>
                                                </defs>
                                                <g>
                                                    <path d="M1390 5024 c-163 -9 -239 -19 -315 -38 -281 -70 -477 -177 -660 -361 -184 -184 -292 -380 -361 -660 -43 -171 -53 -456 -53 -1445 0 -989 10 -1274 53 -1445 69 -280 177 -476 361 -660 184 -184 380 -292 660 -361 171 -43 456 -53 1445 -53 989 0 1274 10 1445 53 280 69 476 177 660 361 184 184 292 380 361 660 43 171 53 456 53 1445 0 989 -10 1274 -53 1445 -69 280 -177 476 -361 660 -184 184 -380 292 -660 361 -174 44 -454 53 -1470 52 -599 0 -960 -5 -1105 -14z m2230 -473 c58 -6 141 -18 185 -27 397 -78 638 -318 719 -714 37 -183 41 -309 41 -1290 0 -981 -4 -1107 -41 -1290 -81 -395 -319 -633 -714 -714 -183 -37 -309 -41 -1290 -41 -981 0 -1107 4 -1290 41 -397 81 -636 322 -714 719 -33 166 -38 296 -43 1100 -5 796 3 1203 27 1380 67 489 338 758 830 825 47 7 162 15 255 20 250 12 1907 4 2035 -9z"/>
                                                    <path d="M2355 3819 c-307 -42 -561 -172 -780 -400 -244 -253 -359 -543 -359 -899 0 -361 116 -648 367 -907 262 -269 563 -397 937 -397 374 0 675 128 937 397 251 259 367 546 367 907 0 361 -116 648 -367 907 -197 203 -422 326 -690 378 -101 20 -317 27 -412 14z m400 -509 c275 -88 470 -284 557 -560 20 -65 23 -95 23 -230 0 -135 -3 -165 -23 -230 -88 -278 -284 -474 -562 -562 -65 -20 -95 -23 -230 -23 -135 0 -165 3 -230 23 -278 88 -474 284 -562 562 -20 65 -23 95 -23 230 0 135 3 165 23 230 73 230 219 403 427 507 134 67 212 83 390 79 111 -3 155 -8 210 -26z"/>
                                                    <path d="M3750 1473 c-29 -11 -66 -38 -106 -77 -70 -71 -94 -126 -94 -221 0 -95 24 -150 94 -221 72 -71 126 -94 225 -94 168 0 311 143 311 311 0 99 -23 154 -94 225 -43 42 -76 66 -110 77 -61 21 -166 21 -226 0z"/>
                                                </g>
                                            </svg>
                                        </a>
                                    </div>
                                    <div className="mediaContainer">
                                        <a href="#" className="mediaURL" id="youtubeURL" {...{disabled: true}}>
                                            <svg id="youtubeSVG" className="mediaSVG" viewBox="35.34 34.3575 70.68 68.71500">
                                                <g>
                                                    <path d="M84.8,69.52,65.88,79.76V59.27Zm23.65.59c0-5.14-.79-17.63-3.94-20.57S99,45.86,73.37,45.86s-28,.73-31.14,3.68S38.29,65,38.29,70.11s.79,17.63,3.94,20.57,5.52,3.68,31.14,3.68,28-.74,31.14-3.68,3.94-15.42,3.94-20.57"/>
                                                </g>
                                            </svg>
                                        </a>
                                    </div>
                                    <div className="mediaContainer">
                                        <a href="https://discord.gg/zNWUXdt" className="mediaURL" id="discordURL">
                                            <svg id="discordSVG" className="mediaSVG" viewBox="35.34 34.3575 70.68 68.71500">
                                                <g>
                                                    <path d="M81.23,78.48a6.14,6.14,0,1,1,6.14-6.14,6.14,6.14,0,0,1-6.14,6.14M60,78.48a6.14,6.14,0,1,1,6.14-6.14A6.14,6.14,0,0,1,60,78.48M104.41,73c-.92-7.7-8.24-22.9-8.24-22.9A43,43,0,0,0,88,45.59a17.88,17.88,0,0,0-8.38-1.27l-.13,1.06a23.52,23.52,0,0,1,5.8,1.95,87.59,87.59,0,0,1,8.17,4.87s-10.32-5.63-22.27-5.63a51.32,51.32,0,0,0-23.2,5.63,87.84,87.84,0,0,1,8.17-4.87,23.57,23.57,0,0,1,5.8-1.95l-.13-1.06a17.88,17.88,0,0,0-8.38,1.27,42.84,42.84,0,0,0-8.21,4.56S37.87,65.35,37,73s-.37,11.54-.37,11.54,4.22,5.68,9.9,7.14,7.7,1.47,7.7,1.47l3.75-4.68a21.22,21.22,0,0,1-4.65-2A24.47,24.47,0,0,1,47.93,82S61.16,88.4,70.68,88.4c10,0,22.75-6.44,22.75-6.44a24.56,24.56,0,0,1-5.35,4.56,21.22,21.22,0,0,1-4.65,2l3.75,4.68s2,0,7.7-1.47,9.89-7.14,9.89-7.14.55-3.85-.37-11.54"/>
                                                </g>
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="lower">
                    <div id="left">
                        <div className="bot_wrapper">
                            <div id="content">
                                <div id="server_status_wrapper">
                                    <span className="bot_label" id="landingPlayerLabel">SERVER</span>
                                    <span id="player_count">OFFLINE</span>
                                </div>
                                <div className="bot_divider"></div>
                                <div id="mojangStatusWrapper">
                                    <span className="bot_label">MOJANG STATUS</span>
                                    <span id="mojang_status_icon" style={{color: this.getMainMojangStatusColor()}}>&#8226;</span>
                                    <div id="mojangStatusTooltip">
                                        <div id="mojangStatusTooltipTitle">Services</div>
                                        <div id="mojangStatusEssentialContainer">
                                            {this.getMojangStatusesAsJSX(true)}
                                        </div>
                                        <div id="mojangStatusNEContainer">
                                            <div className="mojangStatusNEBar"></div>
                                            <div id="mojangStatusNETitle">Non&nbsp;Essential</div>
                                            <div className="mojangStatusNEBar"></div>
                                        </div>
                                        <div id="mojangStatusNonEssentialContainer">
                                            {this.getMojangStatusesAsJSX(false)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="center">
                        <div className="bot_wrapper">
                            <div id="content">
                                <button id="newsButton">
                                    {/* <img src="assets/images/icons/arrow.svg" id="newsButtonSVG"/> */}
                                    <div id="newsButtonAlert" style={{display: 'none'}}></div>
                                    <svg id="newsButtonSVG" viewBox="0 0 24.87 13.97">
                                        <polyline fill="none" stroke="#FFF" strokeWidth="2px" points="0.71 13.26 12.56 1.41 24.16 13.02"/>
                                    </svg>
                                    &#10;<span id="newsButtonText">NEWS</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div id="right">
                        <div className="bot_wrapper">
                            <div id="launch_content">
                                <button id="launch_button">PLAY</button>
                                <div className="bot_divider"></div>
                                <button id="server_selection_button" className="bot_label">&#8226; No Server Selected</button>
                            </div>
                            <div id="launch_details">
                                <div id="launch_details_left">
                                    <span id="launch_progress_label">0%</span>
                                    <div className="bot_divider"></div>
                                </div>
                                <div id="launch_details_right">
                                    <progress id="launch_progress" value="22" max="100"></progress>
                                    <span id="launch_details_text" className="bot_label">Please wait..</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="newsContainer">
                    <div id="newsContent" {...{article: '-1'}} style={{display: 'none'}}>
                        <div id="newsStatusContainer">
                            <div id="newsStatusContent">
                                <div id="newsTitleContainer">
                                    <a id="newsArticleTitle" href="#">Lorem Ipsum</a>
                                </div>
                                <div id="newsMetaContainer">
                                    <div id="newsArticleDateWrapper">
                                        <span id="newsArticleDate">Mar 15, 44 BC, 9:14 AM</span>
                                    </div>
                                    <div id="newsArticleAuthorWrapper">
                                        <span id="newsArticleAuthor">by Cicero</span>
                                    </div>
                                    <a href="#" id="newsArticleComments">0 Comments</a>
                                </div>
                            </div>
                            <div id="newsNavigationContainer">
                                <button id="newsNavigateLeft">
                                    <svg id="newsNavigationLeftSVG" viewBox="0 0 24.87 13.97">
                                        <polyline style={{transition: '0.25s ease'}} fill="none" stroke="#FFF" strokeWidth="2px" points="0.71 13.26 12.56 1.41 24.16 13.02"/>
                                    </svg>
                                </button>
                                <span id="newsNavigationStatus">1 of 1</span>
                                <button id="newsNavigateRight">
                                    <svg id="newsNavigationRightSVG" viewBox="0 0 24.87 13.97">
                                        <polyline style={{transition: '0.25s ease'}} fill="none" stroke="#FFF" strokeWidth="2px" points="0.71 13.26 12.56 1.41 24.16 13.02"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div id="newsArticleContainer">
                            <div id="newsArticleContent">
                                <div id="newsArticleContentScrollable">
                                    {/*  Article Content */}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="newsErrorContainer">
                        <div id="newsErrorLoading">
                            <span id="nELoadSpan" className="newsErrorContent">Checking for News..</span>
                        </div>
                        <div id="newsErrorFailed" style={{display: 'none'}}>
                            <span id="nEFailedSpan" className="newsErrorContent">Failed to Load News</span>
                            <button id="newsErrorRetry">Try Again</button>
                        </div>
                        <div id="newsErrorNone" style={{display: 'none'}}>
                            <span id="nENoneSpan" className="newsErrorContent">No News</span>
                        </div>
                    </div>
                </div>
                <script src="./assets/js/scripts/landing.js"></script>
            </div>


        </>
    }

}