import { MAP_LIST, MIR_PATH } from "../Constants/index";
import MirMapFile from "../Sources/MirMapLoader";
import Computed from "../UI/Computed";
import Pathfinding from "pathfinding";
import path from "path";
import { logger } from "../Main/logger";
import { MAP_CHANGE, MAP_ERROR_1, MAP_ERROR_2 } from "../Constants/Emergencies";
import { dnagerGJMap } from "../Constants/luxian";
import { TURING } from "../Main/Turing";
import Character from "./Charater";

export default class MirMap {
	public file!: MirMapFile
	public tmpBinary!: MirMapBinaryArray
	public name = 'unknown'
	public els: MirElement[] = []
	public mapList = MAP_LIST
	public mapInfo!: MAP_HD
	public roadPath: MirPosition[] = []
	public GuaJiPath: GJMap[] = []
	public p: string = ""
	public changeNum = 0
	constructor() {

	}

	updateMapName(mapName: string) {
		try {
			if (mapName !== this.name) {
				if (this.changeNum > 0) {
					process.send({ type: MAP_CHANGE, mapName })
					return
				}
				this.changeNum++
				logger.error(`地图切换:${mapName}<-${this.name} `);
				this.name = mapName
				const map = this.mapList.find(item => item.name === (mapName))
				if (map) {
					this.file = new MirMapFile(path.join(MIR_PATH, map.path), map.hd)
					if (this.file.error) {
						throw new EvalError(MAP_ERROR_1)
					}
					this.mapInfo = map
					this.setLuXian()
				} else {
					throw new EvalError(MAP_ERROR_2)
				}
			}
		} catch (e) {
			process.send({
				type: 'error',
				msg: e.message
			})
		}
	}

	setLuXian() {
		this.GuaJiPath = []
		let start = 0
		if (this.p) {
			const R = this.p.split('->')
			R.forEach((name, idx) => {
				if (name === this.name) {
					start = idx
				}
				const danger = dnagerGJMap.find(dgjm => dgjm.name === (name))
				const copy: GJMap = JSON.parse(JSON.stringify(danger))
				if (idx !== R.length - 1) {
					copy.path = [copy.next]
				}
				this.GuaJiPath.push(copy)

			})
		}
		this.GuaJiPath = this.GuaJiPath.slice(start)
	}

	/**
	 * 更新ui识别到元素，并标记给地图
	 * @param els 
	 */
	updateMapElement(els: MirElement[]) {
		this.tmpBinary = this.file.copyBinary()
		this.els = els.map((el) => {
			let block = el.block
			if (this.mapInfo.safe.length > 0) {
				block = Boolean(this.mapInfo.safe.find(s => Computed.positionInRect(el.position, s)))
			}
			if (this.mapInfo.block.length > 0) {
				block = Boolean(this.mapInfo.block.find(b => Computed.positionInRect(el.position, b)))
			}
			if (block) {
				try {

					this.tmpBinary[el.position.y][el.position.x] = 1
				} catch (e) {
					console.log(e);

					console.log(this.tmpBinary);

				}
			}
			return {
				...el,
				block
			}
		})
	}

	/** 判断一个坐标能不能通过 */
	canPositionAcross(position: MirPosition) {
		return this.tmpBinary[position.y][position.x] === 0
	}

	/**
	 * 找到在exact范围内能到达的坐标
	 * @param position 
	 * @param exact 
	 * @returns 
	 */
	findAPositionCanAcross(position: MirPosition, exact = 0, min = 0): null | MirPosition {
		const directions = [[-1, -1], [-1, 1], [-1, 0], [1, -1], [1, 1], [1, 0], [0, -1], [0, 1], [0, 0]]
		for (let d = 0; d < 8; d++) {
			for (let i = min; i <= exact; i++) {
				const p = { x: directions[d][0] * i + position.x, y: directions[d][1] * i + position.y }
				if (this.canPositionAcross(p)) return p
			}
		}
		return null
	}

	// 打怪时找到一个安全的位置
	// 1. 找到白虎位置
	// 2. 走到白虎附近的一个位置
	findASafePoistion(position: MirPosition, distance: number): MirPosition {
		const bai = this.findAllMirElement(position, 2, distance)
		if (bai.length) {
			return this.findAPositionCanAcross(bai[0].position, 3, 2)
		} else {
			return this.findAPositionCanAcross(position, 3, 2)
		}
	}

	// 随机一个目击地
	radomAPostionSighting(): MirPosition | null {
		this.p[0]
		var position = null
		while (!position) {
			const x = Computed.random(this.file.header.width),
				y = Computed.random(this.file.header.height)
			if (this.tmpBinary[y][x] === 0) {
				position = { x, y }
			}
		}
		return position
	}

	getAPositionSighting(): MirPosition | null {
		try {
			const path = this.GuaJiPath[0].path
			return path.shift()
		} catch {
			return null
		}
	}

	// 计算寻路坐标
	lpa(position: MirPosition, target: MirPosition, monster = false, distance = 0) {
		try {

			const finder = new Pathfinding.AStarFinder({ diagonalMovement: 1 });
			if (monster) {
				this.tmpBinary[target.y][target.x] = 0
			}
			const roadPath = finder.findPath(position.x, position.y, target.x, target.y, new Pathfinding.Grid(this.tmpBinary))
			this.roadPath = roadPath.slice(1, roadPath.length - distance).map(([x, y]) => ({ x, y }))
		} catch {
			this.roadPath = []
			TURING.KM_Delay(500)
		}
	}

	// 找到一个坐标附近的所有元素，按距离排序
	findAllMirElement(position: MirPosition, type: MirElementType, round: number = 1, sort = true) {
		const els = this.els.filter((el) => {
			if (el.type !== type) return false
			if (el.type === 4 && !this.canPositionAcross(el.position)) return
			el.distance = Computed.distance(position, el.position)
			return el.distance <= round && el.distance !== 0
		})
		if (sort) {
			return els.sort((a, b) => (a.distance as number) - (b.distance as number) > 0 ? 1 : -1)
		}
		return els
	}

	canPositionLeftClick(position: MirPosition) {
		const { y, x } = position
		const el = this.els.find((el) => {
			const ely = el.position.y
			const elx = el.position.x
			return el.block && (y === ely + 2 || y === ely + 1 || y === ely) && x === elx
		})
		return !el;

	}
}