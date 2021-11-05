
const execPath = process.execPath
export const MIR_PATH = (execPath.includes('node.exe')) ? 'D:/完美火龙202109' : process.execPath.replace('GameNodeTry.exe', '')

export const MapWorkerRunnerStopReason = [
	{ reason: 200, text: '正常结束' },
	{ reason: 401, text: '内部中断' },
	{ reason: 402, text: ' 外部中断' },
	{ reason: 403, text: '运行超时' },
	{ reason: 404, text: '未知错误' }
]




export const Screen_Resolution = [2560, 1440]
// 血条颜色
export const COLOR_HP_REGION_GAME = "6262FF|0000CB|080810";
export const COLOR_HP_SIMILAR = 70;
// NPC
const COLOR_TEXT_NPC = "00FF00";

// 宠物
export const COLOR_TEXT_PET = "FF0000";

// 怪物
const COLOR_TEXT_MONSTER_NAME_1 = "FFFFFF";
const COLOR_TEXT_MONSTER_NAME_2 = "A4A0A0";
const COLOR_TEXT_MONSTER_NAME_3 = "fffff";

// 装备
const COLOR_EQUE_NAME_SZ = 'DEC663' // 圣战套
const COLOR_EQUE_NAME_LT = '8CEFF7' // 42衣服，尊者套
const COLOR_EQUE_NAME_42 = '00FFFF'
const COLOR_EQUE_NAME_QHLT = 'FF00FF' // 强化雷霆
const COLOR_EQUE_NAME_TL = '00FF00' // 屠龙
const COLOR_EQUE_NAME_ZS = 'FFAADD' // 战神套
const COLOR_EQUE_NAME_HL = '0000FF' // 火龙，冰龙
const COLOR_EQUE_NAME_BL = '0000FF'

export const COLOR_EQUE = [
	COLOR_EQUE_NAME_SZ, COLOR_EQUE_NAME_LT, COLOR_EQUE_NAME_QHLT, COLOR_EQUE_NAME_TL,
	COLOR_EQUE_NAME_ZS, COLOR_EQUE_NAME_HL, COLOR_EQUE_NAME_42
].join('|')

// 人物
const COLOR_TEXT_CHARACTER_NAME_1 = "7BA5BD";
const COLOR_TEXT_CHARACTER_NAME_2 = "2C35CA";
const COLOR_TEXT_CHARACTER_NAME_3 = "B317E3";
const COLOR_TEXT_CHARACTER_NAME_4 = "00FF00";
const COLOR_TEXT_CHARACTER_NAME_5 = "DE7B00";
const COLOR_TEXT_CHARACTER_NAME_6 = "EFB539";
const COLOR_TEXT_CHARACTER_NAME_7 = "FFFF00";
const COLOR_TEXT_CHARACTER_NAME_8 = "FFFFFF";
const COLOR_TEXT_CHARACTER_NAME_9 = "0077FF";
const COLOR_TEXT_CHARACTER_NAME_0 = "00FFFF";

// 1439
export const PIXEL_MAP_BLOCK_START_X = 19;
export const PIXEL_MAP_BLOCK_START_Y = 0;
export const PIXEL_MAP_BLOCK_WIDTH = 48;
export const PIXEL_MAP_BLOCK_HEIGHT = 32;
export const PIXEL_MAP_BLOCK_ROW_NUMBER = 29;
export const PIXEL_MAP_BLOCK_COLUMN_NUMBER = 22;

// 19 + 48*w(29) +  28
// 32 * h(22)  = 704

// view = (19,0) (48*29+19, 32*22)

// text = (x, y + 32 - 8)

// center = (15, 11)

export const FILE_PATH_FONT_LIB_SONG = "rushb/song.lib";
export const FILE_PATH_FONT_LIB_HP = "rushb/hp.lib";
export const FILE_PATH_FONT_LIB_BAR = "rushb/bar.lib";
export const FILE_PATH_FONT_LIB_SXFZ = "rushb/sxfz.lib"
export const FILE_PATH_FONT_LIB_MAP = "rushb/map.lib"
export const FILE_PATH_FONT_LIB = "rushb/font.lib";
export const FILE_PATH_MON_LIB = "rushb/mon.lib";
export const FILE_PATH_MAP_3 = "WM2020/Map/3.map";

export const FILE_PATH_MAP_A1 = "WM2020/Map/103a.map";
export const FILE_PATH_MAP_A2 = "WM2020/Map/103c.map";

export const BMP_PACKAGE_COIN = 'rushb/bmp/package_coin.bmp'
export const BMP_PACKAGE_LAST2 = 'rushb/bmp/package_last2.bmp'

interface NPC {
	name: string;
	position: MirPosition;
}

export const MAP_LIST: MAP_HD[] = [

	{
		name: '盟重省',
		path: 'WM2020/Map/3.map',
		hd: true,
		safe: [
			[320, 322, 340, 339],
		],
		block: [
			[320, 339, 341, 343],
			[340, 321, 349, 334],
			[342, 337, 344, 338],
			[305, 317, 340, 321]
		]
	},
	{
		name: '幽灵地堡一层',
		hd: true,
		path: 'WM2020/Map/103a.map',
		safe: [],
		block: []
	},
	{
		name: '幽灵地堡二层',
		hd: true,
		path: 'WM2020/Map/103c.map',
		safe: [],
		block: []
	},
	{
		name: '幽灵地堡三层',
		hd: true,
		path: 'WM2020/Map/103d.map',
		safe: [],
		block: []
	},
	{
		name: "四项法阵",
		path: 'WM2020/Map/SXFZ.map',
		hd: true,
		safe: [],
		block: []
	},
	{
		name: '连接通道',
		path: 'WM2020/Map/LJTD.map',
		hd: true,
		safe: [],
		block: [],
	},
	{
		name: '牛魔大厅',
		path: 'WM2020/Map/ND2079.map',
		hd: false,
		safe: [],
		block: []
	}
]

export const NPC_LIST: NPC[] = [
	{
		name: '装备回收',
		position: {
			x: 319,
			y: 328
		}
	},
	{
		name: "镇远镖局",
		position: {
			x: 337,
			y: 343,
		},
	},
	{
		name: "镇远总管",
		position: {
			x: 392,
			y: 337,
		},
	},
	{
		name: '新手圣地',
		position: {
			x: 334,
			y: 341
		}
	},
	{
		name: 'map',
		position: {
			x: 325,
			y: 336
		}
	}
];
