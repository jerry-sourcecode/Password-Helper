"use strict";
function goHome() {
    main.innerHTML = `
    <div class="title">我的</div>
    <div class="accordion" id="mainAccordion">
        <div class="accordion-item" id="backstory">
            <h2 class="accordion-header" id="accordionHeadingForBackstory">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseForBackstory" aria-expanded="true" aria-controls="collapseForBackstory">
                背景故事
                </button>
            </h2>
            <div id="collapseForBackstory" class="accordion-collapse collapse" aria-labelledby="accordionHeadingForBackstory" data-bs-parent="#mainAccordion">
                <div class="accordion-body">
                    <p>公元2077年，地球的生态环境已经濒临崩溃。无节制的工业化、疯狂的消费主义、以及对数字世界的无序扩张，导致了前所未有的碳排放危机。全球气温持续上升，极端天气事件频发，冰川融化，海平面上升，无数城市被淹没，生态系统崩溃，生物多样性锐减，人类赖以生存的家园，正面临着前所未有的威胁。空气污染、水污染、土壤污染，以及各种疾病的蔓延，让人们的生活苦不堪言。</p>
                    <p>在绝望的黑暗中，一丝微弱的希望之光闪耀。一个名为“碳排放守护者联盟”的组织应运而生。联盟汇集了来自世界各地的科学家、工程师、环保人士、技术专家，以及来自不同领域的精英，他们共同致力于通过各种创新方式，减少碳排放，保护地球环境。联盟的核心理念是：数字世界与现实世界息息相关，管理好数字世界的“碳排放”，就能间接改善现实世界的环境。他们相信，每一个微小的努力，都能汇聚成改变世界的巨大力量。联盟的目标是，通过技术手段，将数字世界的碳排放降到最低，为现实世界的环境保护提供支持。</p>
                    <p>而你，就是联盟中的一员，一名光荣的“密码回收员”。你将肩负起守护数字世界，拯救地球的重任。你的职责，不仅仅是保护密码，更是保护地球的未来。</p>
                    <br>
                </div>
            </div>
        </div>
        <div class="accordion-item" id="gameplay">
            <h2 class="accordion-header" id="accordionHeadingForGameplay">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseForGameplay" aria-expanded="true" aria-controls="collapseForGameplay">
                游戏玩法
                </button>
            </h2>
            <div id="collapseForGameplay" class="accordion-collapse collapse" aria-labelledby="accordionHeadingForGameplay" data-bs-parent="#mainAccordion">
                <div class="accordion-body">
                    <p>你可以通过完成任务来获得碳排放量指标，碳排放量指标可以帮助你解锁更多功能和更炫酷的铭牌。</p>
                </div>
            </div>
        </div>
    </div>
    `;
}
