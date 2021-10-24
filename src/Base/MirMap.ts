import { MAP_LIST } from "../Constants";
import MirMapFile from "../Sources/MirMapLoader";
import Computed from "../UI/Computed";
import Pathfinding from "pathfinding";

export default class MirMap {
	public file!: MirMapFile
	public tmpBinary!: MirMapBinaryArray
	public name = 'unknown'
	public els: MirElement[] = []
	public mapList = MAP_LIST
	public mapInfo!: MAP_HD
	public roadPath: MirPosition[] = []
	constructor() {

	}

	updateMapName(mapName: string) {
		if (mapName !== this.name) {
			const map = this.mapList.find(item => item.name.includes(mapName))
			if (map) {
				const file = new MirMapFile(map.path, map.hd)
				if (file.error) {
					throw new EvalError("地图文件加载失败!")
				}
				this.mapInfo = map
			}
		}
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
				this.tmpBinary[el.position.y][el.position.x] = 1
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
	findAPositionCanAcross(position: MirPosition, exact = 0): null | MirPosition {
		const round = [-1 * exact, exact], len = round.length
		let rp: MirPosition | null = null
		if (exact !== 0) {
			const p = this.findAPositionCanAcross(position, exact - 1)
			if (p) {
				return p
			} else {
				for (let i = 0; i < len; i++) {
					const oxi = position.x + round[i]
					for (let n = 0; n < len; n++) {
						const oyn = position.y + round[n]
						const posi = { x: oxi, y: oyn }
						const can = this.canPositionAcross(posi)
						if (can) {
							rp = posi
							break;
						}
					}
				}
			}
		}
		if (exact === 0 && this.canPositionAcross(position)) rp = position
		return rp
	}

	// 随机一个目击地
	radomAPostionSighting(): MirPosition | null {
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

	// 计算寻路坐标
	lpa(position: MirPosition, target: MirPosition) {
		const finder = new Pathfinding.BestFirstFinder({ diagonalMovement: 4 });
		const roadPath = finder.findPath(position.x, position.y, target.x, target.y, new Pathfinding.Grid(this.tmpBinary))
		this.roadPath = roadPath.slice(1).map(([x, y]) => ({ x, y }))
	}

	// 找到一个坐标附近的所有元素，按距离排序
	findAllMirElement(position: MirPosition, type: MirElementType, round: number = 1, sort = true) {
		const els = this.els.filter((el) => {
			if (el.type !== type) return false
			el.distance = Computed.distance(position, el.position)
			return el.distance <= round
		})
		if (sort) {
			return els.sort((a, b) => (a.distance as number) - (b.distance as number) > 0 ? 1 : -1)
		}
		return els
	}
}