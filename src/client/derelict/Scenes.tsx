import './derelict.css';
import { useEffect, useRef } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore Vite raw-string import
import shipHtml from './ship.html?raw';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore Vite raw-string import
import planHtml from './plan.html?raw';
import { ROOMS } from './rooms';
import type { CaseInfo, Clue, VisitResponse } from '../../shared/api';

type Props = {
    info: CaseInfo;
    initialAreas: string[];
    initialClues: Record<string, Clue[]>;
};

function decorateShip() {
    const ns = 'http://www.w3.org/2000/svg';
    const $ = (i: string) => document.getElementById(i) as HTMLElement;
    if ($('cargo').childElementCount > 0) return;
    const mk = (p: Element, t: string, a: Record<string, string | number>) => {
        const e = document.createElementNS(ns, t);
        for (const k in a) e.setAttribute(k, String(a[k]));
        p.appendChild(e);
        return e;
    };
    let s = 7;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const cols: string[] = ['#b5452e', '#2f5d8a', '#d89b2b', '#3d7a5a', '#8d8f93', '#9c2f2f', '#d8d8d8', '#25476a', '#c46a1b'];
    const cg = $('cargo');
    for (let i = 0; i < 10; i++) {
        const t = 2 + Math.floor(r() * 3);
        for (let j = 0; j < t; j++) {
            const x = 335 + i * 56;
            const y = 262 - (j + 1) * 30;
            const c = cols[Math.floor(r() * cols.length)] as string;
            mk(cg, 'rect', { x, y, width: 54, height: 29, fill: c });
            mk(cg, 'rect', { x, y, width: 54, height: 29, fill: 'url(#corr)' });
            mk(cg, 'rect', { x: x + 48, y, width: 6, height: 29, fill: '#071522', opacity: 0.24 });
            mk(cg, 'rect', { x, y, width: 54, height: 3, fill: '#fff', 'fill-opacity': 0.18 });
            for (let rib = 3; rib < 53; rib += 4)
                mk(cg, 'line', { x1: x + rib, x2: x + rib, y1: y + 2, y2: y + 27, stroke: '#fff', 'stroke-opacity': 0.13, 'stroke-width': 1 });
            mk(cg, 'rect', { x, y, width: 54, height: 29, fill: 'none', stroke: '#101820', 'stroke-opacity': 0.62, 'stroke-width': 1 });
            mk(cg, 'rect', { x: x + 1, y: y + 1, width: 3, height: 3, fill: '#d5d0c4', opacity: 0.5 });
            mk(cg, 'rect', { x: x + 50, y: y + 25, width: 3, height: 3, fill: '#111', opacity: 0.35 });
        }
    }
    for (let i = 0; i < 14; i++)
        mk($('hullfx'), 'rect', { x: 140 + r() * 760, y: 264, width: 2 + r() * 3, height: 14 + r() * 30, fill: '#8a4a22', opacity: 0.25 + r() * 0.2 });
    const wins: [number, number, number][] = [[126, 226, 10], [134, 194, 9], [144, 163, 8]];
    wins.forEach(([x, y, n]) => {
        for (let k = 0; k < n; k++)
            mk($('win'), 'rect', { x: x + k * 13, y, width: 8, height: 7, fill: r() < 0.7 ? '#ffd980' : '#1b3550' });
    });
    for (let i = 0; i < 70; i++) {
        const y = 304 + Math.pow(r(), 1.6) * 190;
        const x = -300 + r() * 1600;
        const l = 14 + (y - 300) * 0.7;
        const sun = x > 650 && x < 950;
        const e = mk($('waves'), 'line', { x1: x, x2: x + l, y1: y, y2: y, stroke: sun ? '#ffc27a' : '#fff', 'stroke-width': 0.6 + (y - 300) / 60, opacity: 0.12 });
        mk(e, 'animate', { attributeName: 'opacity', values: '.05;' + (sun ? 0.5 : 0.22) + ';.05', dur: 2 + r() * 4 + 's', begin: '-' + r() * 5 + 's', repeatCount: 'indefinite' });
    }
}

export const Scenes = ({ info, initialAreas, initialClues }: Props) => {
    const store = useRef({
        areas: [...initialAreas],
        clues: { ...initialClues } as Record<string, Clue[]>,
        found: new Set<string>(),
        busy: false,
        visiting: false,
    });

    useEffect(() => {
        decorateShip();
        const el = (id: string) => document.getElementById(id) as HTMLElement;
        const shipScene = el('ship-scene');
        const planScene = el('plan-scene');
        const msg = el('msg');
        const flash = el('flash');
        const roomScene = el('room-scene');
        const view = el('room-view');
        const clueBox = el('clue');
        const cnt = el('cnt');
        const st = store.current;
        const ac = new AbortController();
        const opts = { signal: ac.signal };

        const updMsg = () => {
            const left = info.maxAreas - st.areas.length;
            msg.textContent =
                left === info.maxAreas
                    ? 'Choose ' + info.maxAreas + ' of the ' + info.areas.length + ' areas to investigate'
                    : left > 0
                        ? left + (left === 1 ? ' action left' : ' actions left')
                        : 'No actions left. You can still revisit rooms you searched.';
        };
        const updCnt = () => {
            cnt.textContent = 'CLICK THE GLOWING DOTS · CLUES FOUND ' + st.found.size + '/' + info.totalClues;
        };
        updMsg();

        el('ship').addEventListener(
            'click',
            () => {
                if (st.busy) return;
                st.busy = true;
                shipScene.classList.add('scan');
                setTimeout(() => shipScene.classList.add('dive'), 1500);
                setTimeout(() => {
                    flash.classList.add('go');
                    document.querySelectorAll<HTMLElement>('.area,.label').forEach((e, i) => {
                        e.style.transitionDelay = 1.6 + i * 0.2 + 's';
                    });
                    planScene.classList.add('show');
                    document.body.classList.add('live');
                }, 2000);
                setTimeout(() => {
                    shipScene.style.display = 'none';
                }, 3000);
            },
            opts
        );

        const enterRoom = (area: Element, name: string, areaClues: Clue[]) => {
            const markup = ROOMS[name];
            if (!markup) {
                msg.textContent = name + ' — coming next';
                return;
            }
            const rect = area.getBoundingClientRect();
            planScene.style.transformOrigin = rect.left + rect.width / 2 + 'px ' + (rect.top + rect.height / 2) + 'px';
            planScene.classList.add('enter');
            setTimeout(() => {
                view.innerHTML = markup;
                view.querySelectorAll<SVGGElement>('.hot').forEach((h) => {
                    const id = h.dataset.id as string;
                    if (st.found.has(id)) h.classList.add('seen');
                    h.onclick = () => {
                        const clue = areaClues.find((c) => c.id === id);
                        if (!clue) return;
                        st.found.add(id);
                        h.classList.add('seen');
                        const b = document.createElement('b');
                        b.textContent = id + ' — ' + clue.title;
                        const p = document.createElement('p');
                        p.textContent = clue.text;
                        clueBox.replaceChildren(b, p);
                        clueBox.classList.add('on');
                        updCnt();
                    };
                });
                updCnt();
                roomScene.classList.add('show');
                document.body.classList.add('inroom');
                flash.classList.remove('go');
                void flash.offsetWidth;
                flash.classList.add('go');
            }, 750);
        };

        document.querySelectorAll<SVGElement>('.area').forEach((a) =>
            a.addEventListener(
                'click',
                async () => {
                    const name = a.dataset.name ?? '';
                    const area = info.areas.find((x) => x.name === name);
                    if (!area || st.visiting) return;
                    if (st.areas.includes(area.id)) {
                        enterRoom(a, name, st.clues[area.id] ?? []);
                        return;
                    }
                    st.visiting = true;
                    try {
                        const res = await fetch('/api/visit', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ areaId: area.id }),
                        });
                        if (res.status === 404) {
                            msg.textContent = name + ' — coming next';
                            return;
                        }
                        if (res.status === 409) {
                            msg.textContent = 'No investigation actions left';
                            return;
                        }
                        if (!res.ok) throw new Error('visit failed');
                        const v = (await res.json()) as VisitResponse;
                        st.areas = v.areasUsed;
                        st.clues[area.id] = v.clues;
                        updMsg();
                        enterRoom(a, name, v.clues);
                    } catch {
                        msg.textContent = 'Something went wrong. Try again.';
                    } finally {
                        st.visiting = false;
                    }
                },
                opts
            )
        );

        el('back').addEventListener(
            'click',
            () => {
                roomScene.classList.remove('show');
                clueBox.classList.remove('on');
                setTimeout(() => planScene.classList.remove('enter'), 500);
                document.body.classList.remove('inroom');
            },
            opts
        );

        return () => ac.abort();
    }, [info]);

    return (
        <>
            <div className="scene" id="ship-scene" dangerouslySetInnerHTML={{ __html: shipHtml }} />
            <div id="beam" />
            <div id="flash" />
            <div
                className="scene"
                id="plan-scene"
                dangerouslySetInnerHTML={{ __html: planHtml + '<div id="msg"></div>' }}
            />
            <div id="room-scene">
                <div id="room-view" />
                <div id="cnt" />
                <button id="back">← DECK PLAN</button>
                <div id="clue" />
            </div>
        </>
    );
};