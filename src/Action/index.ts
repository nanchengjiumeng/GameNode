import MirMap from "../Base/MirMap";
import {
	PIXEL_MAP_BLOCK_COLUMN_NUMBER,
	PIXEL_MAP_BLOCK_ROW_NUMBER,
	PIXEL_MAP_BLOCK_HEIGHT
} from "../Constants/index";
import Character from "../Base/Charater";
import { TURING, fyl } from '../Main/Turing'
import { animate } from "popmotion"
import Computed from "../UI/Computed";

// 游戏坐标转屏幕坐标
export function transformMirPosition2UIPosition(character: Character, mp: MirPosition) {
	const rect = character.postionRectInScreen(mp)
	return {
		x: (rect[0][0] + rect[1][0]) / 2,
		y: rect[0][1] + 8
	}
}

// 寻找一个能够点击的坐标
export function findMoveClickPositionInScreen(
	map: MirMap,
	character: Character,
	p: MirPosition,
): MirPosition | undefined {
	const cx = character.element.position.x,
		cy = character.element.position.y
	const ox = p.x - cx, oy = p.y - cy
	const dx = ox === 0 ? 0 : ox > 0 ? 1 : -1,
		dy = oy === 0 ? 0 : oy > 0 ? 1 : -1
	let line: MirPosition[] = []
	const maxInRow = PIXEL_MAP_BLOCK_ROW_NUMBER / 2,
		maxInColumn = PIXEL_MAP_BLOCK_COLUMN_NUMBER / 2
	for (let x = 2; x < maxInRow; x++) {
		for (let y = 2; y < maxInColumn; y++) {
			const bx = cx + x * dx, by = cy + y * dy
			if (
				map.canPositionLeftClick({ x: bx, y: by })
				// map.tmpBinary[by][bx] === 0
			) {
				line.push({
					x: bx,
					y: by
				})
			} else {
				line = []
			}

			if (line.length >= 3) {
				const position = line[1]
				const rect = character.postionRectInScreen(position)
				return {
					x: (rect[0][0] + rect[1][0]) / 2,
					y: rect[0][1] + 8
				}
			}
		}
	}
}

/** 鼠标移动到屏幕坐标 */
export function curveMove(to: UIPosition) {
	const cur = TURING.KM_GetCursorPos().split(',').map(Number)

	if (cur[0] === to.x && cur[1] === to.y) {
		// return console.log('跳过', cur, to);
		return
	}
	const from = { x: cur[0], y: cur[1] }
	let arrive = false
	let x = from.x, y = from.y
	let dx = (to.x - x) === 0 ? 0 : ((to.x - x) > 1) ? 1 : -1
	let dy = (to.y - y) === 0 ? 0 : ((to.y - y) > 1) ? 1 : -1
	const step = Math.floor(Math.random() * 3 + 2)
	while (!arrive) {
		if (x != to.x) {
			x = x + step * dx
		}
		if (y != to.y) {
			y = y + step * dy
		}
		fyl.MoveTo2(x, y)
		if ((x === to.x) && (y === to.y)) {
			arrive = true
		}
		if (Math.abs(x - to.x) <= 15) {
			x = to.x
		}
		if (Math.abs(y - to.y) <= 15) {
			y = to.y
		}
	}
}


export function timestamp() {
	return Number(new Date())
}

export const cMoveMouse =
	(dost: (postion: UIPosition) => void) =>
		(target: UIPosition) => {
			let start = timestamp()
			let cur = TURING.KM_GetCursorPos().split(',').map(Number)
			let origin = {
				x: cur[0],
				y: cur[1]
			}
			const d = Computed.distance(origin, target) * 0.6
			let t = Number(new Date())
			return new Promise((resolve) => {
				animate({
					from: origin,
					to: target,
					duration: d,
					onUpdate: latest => {
						let t1 = Number(new Date())
						if (t1 - t > 10) {
							t = t1
							dost(latest)
						}
					},
					onComplete: () => {
						// console.log(`移动鼠标耗时: ${timestamp() - start}`)
						resolve(0)
					}
				})
			})
		}

export const moveMouse = cMoveMouse(({ x, y }) => {
	// fyl.MoveTo2(x, y)
	TURING.KM_MoveTo(x, y)
})


export const moveMouseThenLeftClick = async ({ x, y }, time = 500) => {
	await moveMouse({ x, y })
	await Computed.sleep(time)
	fyl.LeftClick(2)
}

/** 移动一步 */
export async function moveStep(map: MirMap, character: Character, position: MirPosition, run: boolean) {
	let success = false
	try {
		const ps = findMoveClickPositionInScreen(map, character, position)
		if (!ps) return false
		await moveMouse(ps)
		if (run) {
			fyl.RightClick()
		} else {
			fyl.LeftClick()
		}
		// await before()
		success = character.element.position.x === position.x &&
			character.element.position.y === position.y

	} catch (e) {
		console.log(e);
	}
	return success
}

// 隐身
export function yinshen(delay = 350) {
	fyl.KeyPress(59, 1)
	TURING.KM_Delay(delay)
}


// 毒一下怪物
export function poisonMonster(monster: MirElement, delay = 50) {
	const positionInScreen = {
		x: (monster.positionScreen[0][0] + monster.positionScreen[1][0]) / 2 + 5,
		y: (monster.positionScreen[0][1]) - 2 * PIXEL_MAP_BLOCK_HEIGHT + 36
	}
	curveMove(positionInScreen)
	TURING.KM_Delay(delay)
	fyl.KeyPress(58, 3)
}

// 召唤白虎
export function baihu(delay = 150) {
	fyl.KeyPress(65, 1)
	TURING.KM_Delay(delay)
}


export function ESC(delay = 50) {
	fyl.KeyPress(41, 1)
	TURING.KM_Delay(delay)
}

export function F9(delay = 50) {
	fyl.KeyPress(66, 1)
	TURING.KM_Delay(delay)
}

export function Number1(delay = 50) {
	TURING.KM_Delay(delay)
	fyl.KeyPress(30, 3)
}