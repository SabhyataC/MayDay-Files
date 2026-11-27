const room = (
    name: string,
    img: string,
    flicker: string,
    flickerCss: string,
    extra: string,
    hots: string
) => `<svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid meet">
<defs>
<radialGradient id="vig"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>
<style>
.bg{transform-box:view-box;transform-origin:50% 50%;animation:kb 28s ease-in-out infinite alternate}
@keyframes kb{to{transform:scale(1.07) translate(-8px,-5px)}}
.flk{${flickerCss}}
</style>
</defs>
<image class="bg" href="${img}" width="1000" height="560" preserveAspectRatio="xMidYMid meet"/>
${flicker}
${extra}
<rect width="1000" height="560" fill="url(#vig)" pointer-events="none"/>
<text x="30" y="40" fill="#7fb8e6" font-size="14" letter-spacing="5">${name}</text>
${hots}
</svg>`;

const hot = (id: string, x: number, y: number, r: number) =>
    `<g class="hot" data-id="${id}" transform="translate(${x} ${y})"><circle r="${r}" fill="transparent"/><circle class="rg" r="18"/><circle class="dot" r="7"/></g>`;

export const ROOMS: Record<string, string> = {
    'ENGINE ROOM': room(
        'ENGINE ROOM',
        '/engine.png',
        '<rect class="flk" width="1000" height="560" fill="#fff"/>',
        'animation:flk 5s steps(1) infinite}@keyframes flk{0%,100%{opacity:0}8%{opacity:.12}10%{opacity:0}52%{opacity:.08}54%{opacity:0}78%{opacity:.14}80%{opacity:0}',
        '<circle cx="950" cy="40" r="60" fill="#f22" opacity=".25"><animate attributeName="opacity" values=".35;.05;.35" dur="1.6s" repeatCount="indefinite"/></circle>',
        hot('E01', 845, 255, 40) + hot('E02', 709, 285, 34)
    ),
    BRIDGE: room(
        'BRIDGE',
        '/bridge.png',
        '<rect class="flk" width="1000" height="560" fill="#9fd4f5"/>',
        'animation:flk 6s steps(1) infinite}@keyframes flk{0%,100%{opacity:0}8%{opacity:.08}10%{opacity:0}52%{opacity:.06}54%{opacity:0}',
        '',
        hot('E03', 780, 400, 40) + hot('E04', 180, 330, 40)
    ),
};