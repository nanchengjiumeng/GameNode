declare type MirElementType = 0 | 1 | 2 | 3 | 4  // 未知|人物/白虎/怪物/装备
declare interface MirElement {
	name: string,
	type: MirElementType,
	block: boolean,
	position: MirPosition,
	positionScreen?: Rect,
	distance?: number,
	originPosition?: { x: number, y: number }
}


declare type Rect = [[number, number], [number, number]]