import type { CaseInfo, Clue } from '../../shared/api';

export const marigold: CaseInfo = {
    id: 'case-001',
    title: 'The Marigold',
    briefing:
        'A cargo ship is drifting in an uncharted sector. Last contact was 6 days ago. Crew of 4. No distress signal.',
    maxAreas: 3,
    totalClues: 8,
    areas: [
        { id: 'engine', name: 'ENGINE ROOM' },
        { id: 'bridge', name: 'BRIDGE' },
        { id: 'cargo', name: 'CARGO HOLD' },
        { id: 'pod', name: 'ESCAPE POD BAY' },
    ],
};

export const marigoldClues: Record<string, Clue[]> = {
    engine: [
        {
            id: 'E01',
            title: 'Fire Damage',
            text: 'Fire damage covers one electrical panel. The machinery beside it is untouched.',
        },
        {
            id: 'E02',
            title: 'Fire Extinguisher',
            text: 'A fire extinguisher hangs beside the panel. Its safety seal is intact.',
        },
    ],
    bridge: [
        {
            id: 'E03',
            title: 'Log vs Alarm Record',
            text: 'The captain’s report is stamped 02:10. The ship’s fire alarm record says 02:40.',
        },
        {
            id: 'E04',
            title: 'Last Communication',
            text: 'The last message from the ship was routine. No distress call is on record. The distress button is untouched.',
        },
    ],
};