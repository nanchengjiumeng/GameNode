import { Turing } from "ts-turing/types/turing"

const { createTuring, createFyl } = require('ts-turing')
export const TURING: Turing = createTuring()

interface Fyl {
	LeftClick: (count?: number) => void,
	RightClick: (count?: number) => void,
	M_ResolutionUsed: (x: number, y: number) => void,
	MoveTo3: (x: number, y: number) => void,
	MoveTo2: (x: number, y: number) => void,
	KeyPress: (keycode: number, n?: number) => void
}


export const fyl = createFyl() as Fyl