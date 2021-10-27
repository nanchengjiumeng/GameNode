import MirMap from "../Base/MirMap";
import {
	PIXEL_MAP_BLOCK_COLUMN_NUMBER,
	PIXEL_MAP_BLOCK_ROW_NUMBER,
	PIXEL_MAP_BLOCK_HEIGHT
} from "../Constants/index";
import Character from "../Base/Charater";
import { TURING, fyl } from '../Main/Turing'
import { animate } from "popmotion"

// 寻找一个能够点击的坐标
export function findMoveClickPositionInScreen(
	map: MirMap,
	character: Character,
	p: MirPosition
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
			if (map.tmpBinary[bx][by] === 0) {
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

/** 鼠标移动到游戏坐标 */
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

const cMoveMouse =
	(dost: (postion: UIPosition) => void) =>
		(target: UIPosition, duration = 100) => {
			// const start = timestamp()
			let cur = TURING.KM_GetCursorPos().split(',').map(Number)
			let origin = {
				x: cur[0],
				y: cur[1]
			}
			return new Promise((resolve) => {
				animate({
					from: origin,
					to: target,
					duration,
					onUpdate: latest => {
						dost(latest)
					},
					onComplete: () => {
						// console.log(`移动鼠标耗时: ${timestamp() - start}`)
						resolve(0)
					}
				})
			})
		}

export const moveMouse = cMoveMouse(({ x, y }) => {
	fyl.MoveTo2(x, y)
})


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
	fyl.KeyPress(59, 3)
	TURING.KM_Delay(delay)
}


// 毒一下怪物
export function poisonMonster(monster: MirElement, delay = 150) {

	console.log(monster.positionScreen);

	const positionInScreen = {
		x: (monster.positionScreen[0][0] + monster.positionScreen[1][0]) / 2,
		y: (monster.positionScreen[0][1]) - 2 * PIXEL_MAP_BLOCK_HEIGHT + 19
	}
	curveMove(positionInScreen)
	TURING.KM_Delay(delay)
	fyl.KeyPress(58, 4)
}

// 召唤白虎
export function baihu(delay = 150) {
	fyl.KeyPress(65, 3)
	TURING.KM_Delay(delay)
}