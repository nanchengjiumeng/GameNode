declare type UIPosition = {
	x: number,
	y: number
}

declare interface UIData {
	elements: MirElement[],
	hp: number[],
	mapName: string,
	tmp?: UIDdataSence
}

declare interface UIDdataSence {
	death: boolean
	packageOpend: boolean
	packageFilled: boolean
	reliveButtonPosition: UIPosition
}