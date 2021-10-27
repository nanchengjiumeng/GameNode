import Computed from "./Computed"
import * as path from 'path'
const { createTuring } = require('ts-turing')

const TURING = createTuring()

import {
	COLOR_EQUE,
	FILE_PATH_FONT_LIB_BAR,
	FILE_PATH_FONT_LIB_HP,
	FILE_PATH_FONT_LIB_SONG,
	MIR_PATH,
	PIXEL_MAP_BLOCK_COLUMN_NUMBER,
	PIXEL_MAP_BLOCK_HEIGHT,
	PIXEL_MAP_BLOCK_ROW_NUMBER,
	PIXEL_MAP_BLOCK_START_X,
	PIXEL_MAP_BLOCK_START_Y,
	PIXEL_MAP_BLOCK_WIDTH,
} from "../Constants/index";

export class UI extends Computed {
	handleList: number[] = [];
	handle!: number;
	windowSize: Rect = [
		[0, 0],
		[1440, 900],
	];
	regionMapName: Rect = [[0, 880], [169, 898]];
	regionHp: Rect = [[0, 865], [84, 872]];
	regionMp: Rect = [[84, 865], [176, 872]];
	regionGame: Rect = [
		[PIXEL_MAP_BLOCK_START_X, PIXEL_MAP_BLOCK_START_Y],
		[
			PIXEL_MAP_BLOCK_WIDTH * PIXEL_MAP_BLOCK_ROW_NUMBER + PIXEL_MAP_BLOCK_START_X,
			PIXEL_MAP_BLOCK_HEIGHT * PIXEL_MAP_BLOCK_COLUMN_NUMBER,
		],
	];
	regionPickUp: Rect = [
		[
			PIXEL_MAP_BLOCK_START_X + Math.ceil(PIXEL_MAP_BLOCK_ROW_NUMBER / 4) * PIXEL_MAP_BLOCK_WIDTH,
			Math.floor(PIXEL_MAP_BLOCK_COLUMN_NUMBER / 4) * PIXEL_MAP_BLOCK_HEIGHT
		],
		[
			PIXEL_MAP_BLOCK_START_X + Math.floor(PIXEL_MAP_BLOCK_ROW_NUMBER / 4) * 3 * PIXEL_MAP_BLOCK_WIDTH,
			Math.floor(PIXEL_MAP_BLOCK_COLUMN_NUMBER / 4) * 3 * PIXEL_MAP_BLOCK_HEIGHT + + PIXEL_MAP_BLOCK_HEIGHT * 3
		]
	]
	pixel = [PIXEL_MAP_BLOCK_WIDTH, PIXEL_MAP_BLOCK_HEIGHT];
	config!: Object;
	fontLibPath!: string;
	mapName = "";
	characterHp = [1000, 1000];
	characterPosition!: MirPosition;
	lastCharacterPosition: MirPosition | undefined;
	characterBlockPositionInScreen!: UIPosition;
	charactersPosition!: MirPosition;
	petsPosition: MirPosition[] = [];
	allObjects: MirElement[] = []
	constructor(
		public debug: boolean,
		public mir = MIR_PATH,
		public handleKey = "正式开放",
	) {
		super()
		TURING.Lib_Load(path.join(this.mir, FILE_PATH_FONT_LIB_SONG));
		TURING.Lib_Add(1);
		TURING.Lib_Load(path.join(this.mir, FILE_PATH_FONT_LIB_HP));
		TURING.Lib_Add(2);
		TURING.Lib_Load(path.join(this.mir, FILE_PATH_FONT_LIB_BAR));
		// TURING.Lib_Create("宋体", 9, "DFZ"); // 道士/法师/战士
		TURING.Lib_Add(3);
		TURING.Lib_Create("宋体", 9, "白"); // 白虎
		TURING.Lib_Add(5);
		TURING.Lib_Create("宋体", 9, "牛魔大厅四项法阵盟重城1234567890:")
		TURING.Lib_Add(6)

		this.findHandle()

		if (this.debug) {
			TURING.Display_Open()
		} else {
			TURING.Display_Close()
		}

	}

	destroyed() {
		if (this.debug) {
			TURING.Display_Close()
		}
	}

	static str2Position(str: string): UIPosition | MirPosition {
		const [x, y] = str.split(",").map(Number);
		return { x, y };
	}

	/**
	 * 找到窗口句柄
	 * @returns 
	 */
	findHandle() {
		let handleList: number[] = [];
		const windows = (TURING.Window_Enum() as unknown as string).split("|");
		windows.forEach((iHwnd: string) => {
			const ret = Number(
				TURING.Window_EnumChild(Number(iHwnd), "", this.handleKey)
			);
			if (ret && handleList.indexOf(ret) === -1) handleList.push(ret);
		});
		this.handle = handleList[0];
		return this.handle;
	}

	bindHandle(): number | undefined {
		this.findHandle()
		TURING.Link(this.handle, "gdi")
		return this.handle
		// DM.moveWindow(this.handle, 0, 0)
		// TURING.Window_MoveTo(this.handle, 100, 100);
	}


	// 更新窗口信息
	updateWindowInfo() {
		const [l, t, r, b] = TURING.Window_GetSize(this.handle).split(',').map(Number)
		this.windowSize = [[l, t], [r - l, b - t]]
	}

	// 加载区域截图
	loadRegionFromScreen(region: Rect): void {
		const [[x, y], [w, h]] = region
		TURING.Pixel_FromScreen(x, y, w, h);
	}

	// 识别人物血量
	ocrHP(): void {
		this.loadRegionFromScreen(this.regionHp);
		TURING.Filter_Binaryzation("FFFFFF");
		TURING.Incise_RandomOrientation(0);
		TURING.Lib_Use(2);
		const ret = TURING.OCR(85) || "";
		const match = ret.match(/(\d+)\/(\d+)/i);

		if (ret && match) {
			const left = match[1];
			const all = match[2];
			this.characterHp = [Number(left), Number(all)];
		}
	}

	// 识别地图名称以及人物当前坐标
	ocrMapName() {
		this.loadRegionFromScreen(this.regionMapName);
		TURING.Filter_Binaryzation("ffffff");
		TURING.Incise_RandomOrientation(0);
		TURING.Lib_Use(6);
		const ret = TURING.OCR(95).replace(/(O|o)/g, "0") || "";
		const match = ret.match(/([^\x00-\xff]+)(\d+):(\d+)/);

		if (ret && match) {
			this.mapName = match[1];
			const x = Number(match[2]);
			const y = Number(match[3]);
			// if (this.lastCharacterPosition[0] !== x || this.lastCharacterPosition[1] !== y) { // 记录人物位置的移动时间
			// 	this.lastCharacterPosition = [x, y, Number(new Date())]
			// }
			this.characterPosition = { x, y };
			this.characterBlockPositionInScreen = {
				x: this.windowSize[0][0] + 10 + PIXEL_MAP_BLOCK_START_X + (PIXEL_MAP_BLOCK_ROW_NUMBER - 1) / 2 * PIXEL_MAP_BLOCK_WIDTH,
				y: this.windowSize[0][1] + PIXEL_MAP_BLOCK_START_Y + (PIXEL_MAP_BLOCK_COLUMN_NUMBER / 2 + 1) * PIXEL_MAP_BLOCK_HEIGHT
			}
		}
	}

	// 识别根据图灵字符串位置，转换成游戏坐标
	positionName(
		res: string,
		type: 0 | 1 | 2 | 3,
		callback: (x: number, y: number, text?: string) => MirPosition
	): MirElement[] {
		if (!res) {
			return []
		}
		const sp = res.split("|");
		const text = sp.slice(0, 1)[0].split("");
		const list = sp.slice(1).map((s: any) => UI.str2Position(s as string));
		const pList = list.map((item, idx) => {
			// 将b的转换成血条位置
			if (text[idx] === 'b') {
				item.x = item.x - 27
				item.y = item.y + 11
				text[idx] === '血'
			}

			if (text[idx] === '虎') {
				item.x = item.x - 11
				item.y = item.y
				text[idx] = '白'
			}

			if (text[idx] === '白') {
				item.x = item.x + 20
				item.y = item.y - 39
			}


			const { x, y } = item;
			const px = Math.floor((x + 24) / PIXEL_MAP_BLOCK_WIDTH);
			const py = Math.floor(y / PIXEL_MAP_BLOCK_HEIGHT);
			const ret: MirElement = {
				position: callback(
					this.characterPosition?.x + px - 14,
					this.characterPosition?.y + py - 9,
					text[idx]
				),
				originPosition: { x, y },
				name: text[idx],
				type,
				block: true,
			};
			return ret;
		});
		return pList;
	}

	// 四项法阵
	ocrPositionOfMonsters1() {
		this.loadRegionFromScreen(this.regionGame);
		TURING.Filter_Posterization(2)
		TURING.Filter_Binaryzation("FFFFFF")
		TURING.Filter_DespeckleEx(5, true, 1)
		TURING.Incise_ScopeAisle(2, 1, "10-24", "10-24")
		TURING.Lib_Use(5)
		const res = TURING.OCR(85, 1);

		const objects = this.positionName(
			res,
			3,
			(x: number, y: number) => {
				return {
					x,
					y: y - 1,
				};
			}
		);
		this.allObjects = this.allObjects.concat(objects);
	}

	// 通过文字定位装备位置
	positionEquements(res: string): MirElement[] {
		var a = res.split('|')
		var text = a.slice(0, 1)[0].split('')
		var pixel = a.slice(1)
		const objects: MirElement[] = []
		const throughCenter = []
		text.forEach((t, i) => {
			const p = pixel[i].split(',').map(Number)
			const left = p[1] % PIXEL_MAP_BLOCK_HEIGHT
			if (left < 23 || left > 25) {
				return
			}
			const x = (p[0] + this.regionPickUp[0][0] + PIXEL_MAP_BLOCK_START_X) / 48 + this.characterPosition.x - 15
			const fx = Math.floor(x)
			const y = Math.floor((p[1] + this.regionPickUp[0][1]) / PIXEL_MAP_BLOCK_HEIGHT) + this.characterPosition.y - 10
			const obj = objects.find((o) => o.type === 4 && o.position.x === fx && o.position.y === y)
			if (obj) {
				obj.name += t
			} else {
				objects.push({
					name: t,
					position: { x: fx, y },
					type: 4,
					block: false,
				})
				throughCenter.push(false)
			}
			if (x % 1 < 0.1) {
				const obj = objects.find((o) => o.type === 4 && o.position.x === (fx - 1) && o.position.y === y)
				if (obj) {
					obj.name += t
				} else {
					objects.push({
						name: t,
						position: { x: fx - 1, y },
						type: 4,
						block: false,
					})
					throughCenter.push(false)
				}
			}
		})
		return objects.filter(o => o.name.length > 1)
	}


	// 识别掉落的的装备
	ocrPositionOfEquements() {
		// const start = new Date()
		this.loadRegionFromScreen(this.regionPickUp);
		TURING.Lib_Use(1)
		TURING.Filter_ColorChoose(COLOR_EQUE)
		TURING.Filter_Binaryzation("0-72")
		// TURING.Pixel_Preview()
		TURING.Incise_ScopeAisle(2, 1)
		TURING.Incise_AutoCharData()
		const ret = TURING.OCR(85, 1)
		if (!ret) {
			return
		} else {
			const objects = this.positionEquements(ret)

			this.allObjects = this.allObjects.concat(objects)
		}
	}



	/** 将游戏坐标转换成屏幕位置 */
	transformGamePositionToScreenPosition(position: MirPosition): UIPosition {
		const { x, y } = this.characterPosition
		const oX = position.x - x, oY = position.y - y
		const screenX = this.characterBlockPositionInScreen.x
			+ (oX * PIXEL_MAP_BLOCK_WIDTH)
		const screenY = this.characterBlockPositionInScreen.y
			+ (oY * PIXEL_MAP_BLOCK_HEIGHT)
		return {
			x: Math.floor(screenX),
			y: Math.floor(screenY)
		}
	}

	processElements() {
		let objs: MirElement[] = []
		const q = ['我', '白', '道', '战', '法', '血', 'b']
		const b: MirElement[] = []
		this.allObjects.forEach((obj) => {
			const find = objs.find(o => o.position.x === obj.position.x && o.position.y === obj.position.y)
			if (find) {
				obj.name = q[Math.min(q.indexOf(find.name), q.indexOf(obj.name))]
			} else {
				objs.push(obj)
				if (obj.type === 2) {
					b.push(obj)
				}
			}
		})
		objs = objs.map(o => {
			if (o.type === 0) {
				o.type = 3
				if (o.name === '战' || o.name === '道' || o.name === '法') o.type = 1
				if (o.name === '白') o.type = 2
			}
			return o
		});
		this.allObjects = objs
		this.allObjects.forEach(el => {
			const p = el.position
			const sp = this.transformGamePositionToScreenPosition(p)
			el.positionScreen = [
				[sp.x, sp.y],
				[sp.x + PIXEL_MAP_BLOCK_WIDTH, sp.y + PIXEL_MAP_BLOCK_HEIGHT]
			]
			return el
		})
		// console.log(this.allObjects);

	}

	update() {
		// const start = new Date()
		// console.log('---update ui---');
		this.allObjects = []
		this.updateWindowInfo()
		this.ocrMapName();
		this.ocrHP()
		this.allObjects.push({
			name: '我',
			type: 1,
			position: this.characterPosition,
			positionScreen: [
				[
					this.characterBlockPositionInScreen.x,
					this.characterBlockPositionInScreen.y
				],
				[
					this.characterBlockPositionInScreen.x + PIXEL_MAP_BLOCK_WIDTH,
					this.characterBlockPositionInScreen.y + PIXEL_MAP_BLOCK_HEIGHT
				]
			],
			block: false
		})

		this.ocrPositionHpBar();
		// this.ocrPositionOfEquements();
		this.processElements()


		// console.log('---updated base ui--- 用时: ', Number(new Date()) - Number(start));
		// if (this.debug) {
		// 	this.print()
		// }
	}

	updateEquements() {
		// const start = new Date()
		// console.log('---update ui---');
		this.allObjects = []
		this.updateWindowInfo()
		this.ocrMapName();
		this.ocrPositionOfEquements();

		// console.log('---updated equements ui--- 用时: ', Number(new Date()) - Number(start));
	}

	print() {
		// TURING.Display_Show(`我,${this.characterBlockPositionInScreen.x},${this.characterBlockPositionInScreen.y
		// 	},${PIXEL_MAP_BLOCK_WIDTH},${PIXEL_MAP_BLOCK_HEIGHT}`)
		const str = this.allObjects.map(el => {
			const r = [
				el.positionScreen[0][0],
				el.positionScreen[0][1]
			]
			if (
				el.type === 3 ||
				el.type === 2 || el.type === 1) {
				return `${el.name},${r[0]},${r[1] - PIXEL_MAP_BLOCK_HEIGHT * 2
					},${PIXEL_MAP_BLOCK_WIDTH},${PIXEL_MAP_BLOCK_HEIGHT * 3}`
			}
			return `${el.name},${r[0]},${r[1]},${PIXEL_MAP_BLOCK_WIDTH},${PIXEL_MAP_BLOCK_HEIGHT}`
		}).join('|')
		TURING.Display_Show(str)
	}

	ocrPositionHpBar() {
		this.loadRegionFromScreen(this.regionGame);

		if (this.mapName.includes('盟')) {
			TURING.Filter_ChannelLayer(0)
		} else {
			TURING.Filter_Posterization(2)
		}
		TURING.Filter_Binaryzation("0000FF|FFFFFF|FF0000")
		TURING.Incise_ConnectedArea(true, "5-30", "1-12", 1)
		TURING.Lib_Use(3)
		const res = TURING.OCR(100, 1);
		const objects = this.positionName(
			res,
			0,
			(x: number, y: number, text: string) => {
				return {
					x,
					y: y,
				};
			}
		);
		this.allObjects = this.allObjects.concat(objects);
	}
}