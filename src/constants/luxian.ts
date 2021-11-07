import { NPC_LIST } from "../Constants"

export const LabeslPositionThenClick: MirPostionThenUIPosition[] = [
	{
		label: '幽灵地堡',
		position: NPC_LIST.find(i => i.name === '幽灵地堡').position,
		uiPosition: { x: 60, y: 148 }
	},
	{
		label: '四相法阵',
		position: NPC_LIST.find(i => i.name === '幽灵地堡').position,
		uiPosition: { x: 191, y: 148 }
	}
]


export const dnagerGJMap: GJMap[] = [
	{
		name: "四相法阵",
		path: [{ x: 46, y: 21 }, { x: 69, y: 48 }, { x: 46, y: 75 }, { x: 42, y: 65 }
			, { x: 23, y: 46 }, { x: 36, y: 29 }
		],
	},
	{
		name: "幽灵地堡一层",
		path: [
			{
				x: 142,
				y: 115
			}, {
				x: 121,
				y: 132
			},
			{
				x: 114,
				y: 114
			},
			{
				x: 92,
				y: 92
			},
			{
				x: 104,
				y: 71
			},
			{
				x: 79,
				y: 75
			},
			{
				x: 64,
				y: 104
			},
			{
				x: 34,
				y: 88
			},
			{
				x: 16,
				y: 70
			},
			{
				x: 30,
				y: 60
			},
			{
				x: 51,
				y: 59
			},
			{
				x: 76,
				y: 54
			},
			{
				x: 99,
				y: 37
			},
			{
				x: 61,
				y: 35
			}
		],
		next: { x: 43, y: 53 }
	},
	{
		name: "幽灵地堡二层",
		path: [
			{
				x: 99,
				y: 76
			},
			{
				x: 137,
				y: 37
			},
			{
				x: 122,
				y: 30
			},
			{
				x: 35,
				y: 113
			},
			{
				x: 65,
				y: 57
			},
			{
				x: 33,
				y: 35
			}
		],
		next: {
			x: 29,
			y: 33
		}
	},
	{
		name: "幽灵地堡",
		path: [
			{ x: 91, y: 65 }, { x: 71, y: 85 }, { x: 73, y: 69 },
			{ x: 54, y: 50 }, { x: 80, y: 24 }, { x: 21, y: 70 },
			{ x: 35, y: 38 }
		]
	}
]