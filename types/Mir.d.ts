declare type MirElementType = 1 | 2 | 3 | 4
declare interface MirElement {
	name: string,
	type: MirElementType,
	block: boolean,
	position: MirPosition,
	positionScreen?: Rect,
	distance?: number
}


declare type Rect = [[number, number], [number, number]]