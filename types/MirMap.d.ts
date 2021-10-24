declare type MirPosition = {
	x: number;
	y: number;
}

declare type MirMapFileData = {
	BkImg: string; // 底层图片索引 最高位为1不可以行走，图片索引为低17位 2
	MidImg: string; // 中间层图片索引 图片索引为低17位 2
	FrImg: string; // 表层图片索引 最高位为1不可以行走 2
	DoorIndex: string; // 最高位为1有门，索引为低7位 1
	DoorOffset: string; // 最高位为1是开，0是关 1
	AniFrame: string; // 动画效果 (Draw Alpha) 1
	AniTick: string	// 阴影效果 1
	Area: string; // 表层图片对应OBJECT索引 1
	light: string // 雾的效果（视线） 1
}


declare type MirMapMapPosition = {
	info: MirMapData,
	position: MirPosition,
	isRoad: boolean // 
}

declare type MirMapFileHeader = {
	width: number; // 2
	height: number; // 2
	title: string; // array [1..16] of char; 16
	updateDate: number; // 更新日期  8
	reserved: string; // array[0..23]of char; 保留字 24
}

declare type MirMapBinary = 1 | 0

declare type MirMapBinaryArray = MirMapBinary[][]

declare interface MAP_HD {
	name: string
	path: string
	hd: boolean
	safe: number[][]
	block: number[][]
}