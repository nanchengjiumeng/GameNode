export default class Computed {
	// 计算一个点是否在一个举行内
	static positionInRect(position: MirPosition, rect: number[]) {
		const [x, y, r, b] = rect
		return x <= position.x && y <= position.y && r >= position.x && b >= position.y
	}

	static distance(a: MirPosition, b: MirPosition) {
		const _a = a.x - b.x, _b = a.y - b.y;
		return Math.sqrt(_a * _a + _b * _b);
	}

	static random(to: number, from = 0): number {
		return Math.floor(Math.random() * (to - from) + from)
	}

	// 是否三点一线
	static threePointsInOneLine(p1: MirPosition, p2: MirPosition, p3: MirPosition): boolean {
		return (p1.x === p2.x && p2.x === p3.x) ||
			(p1.y === p2.y && p2.y === p3.y) ||
			((p2.x - p1.x === p2.y - p1.y) && (p3.x - p2.x === p3.y - p2.y))
	}

	static sleep(time = 300) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(true)
			}, time)
		})
	}
}