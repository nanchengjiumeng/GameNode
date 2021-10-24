import { baihu, poisonMonster, yinshen } from "../Action/index"
import { PIXEL_MAP_BLOCK_HEIGHT, PIXEL_MAP_BLOCK_WIDTH } from "../Constants/index"

export default class Character {
	element: MirElement
	hp: number[]
	yinshenPosition: MirPosition | undefined
	yinshenTimestamp: number = 0
	yinshenCD = 10 * 1000 * 1000
	setElement(el: MirElement) {
		this.element = el
	}
	setHp(hp: number[]) {
		this.hp = hp
	}

	postionRectInScreen(position: MirPosition): Rect {
		const p = this.element.position
		const oX = position.x - p.x, oY = position.y - p.y

		const screenX = this.element.positionScreen[0][0] + (oX * PIXEL_MAP_BLOCK_WIDTH)
		const screenY = this.element.positionScreen[0][1] + (oY * PIXEL_MAP_BLOCK_HEIGHT)
		return [
			[screenX, screenY],
			[
				screenX + PIXEL_MAP_BLOCK_WIDTH,
				screenY + PIXEL_MAP_BLOCK_HEIGHT
			]
		]
	}

	poisonMonster(monster: MirElement) {
		poisonMonster(monster)
	}

	recallBaiHu(delay?: number) {
		baihu(delay)
	}

	yinshen() {
		const timestamp = Number(new Date)
		if (timestamp - this.yinshenTimestamp > this.yinshenCD) {
			const isSamePlace = this.element.position.x === this.yinshenPosition.x && this.element.position.y === this.yinshenPosition.y
			if (isSamePlace) {
				yinshen()
			}
		}
	}

}