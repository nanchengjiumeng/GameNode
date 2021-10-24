declare type UIPosition = {
	x: number,
	y: number
}

declare interface UIData {
	elements: MirElement[],
	hp: number[],
	mapName: string
}