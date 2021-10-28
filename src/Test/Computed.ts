import Computed from "../UI/Computed";


function random(n) {
	return Math.floor(Math.random() * n)
}

const directions = [[-1, -1], [-1, 1], [-1, 0], [1, -1], [1, 1], [1, 0], [0, -1], [0, 1], [0, 0]]

function randomThreePosition() {
	const p: MirPosition = { x: random(100,), y: random(100) }
	const direct2 = directions[random(8)]
	const p2 = { x: p.x + direct2[0], y: p.y + direct2[1] }
	const direct3 = directions[random(8)]
	const p3 = { x: p2.x + direct3[0], y: p2.y + direct3[1] }
	if (p.x !== p3.x && p.y !== p3.y)
		console.log(p, p2, p3, Computed.threePointsInOneLine(p, p2, p3));

}

for (let i = 0; i < 30; i++)
	randomThreePosition()
// Computed.threePointsInOneLine()
// console.log(Computed.threePointsInOneLine({ x: 21, y: 6 }, { x: 20, y: 7 }, { x: 19, y: 8 }));
