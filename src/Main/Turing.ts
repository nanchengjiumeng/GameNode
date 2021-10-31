import { MIR_PATH } from "../Constants/index";
import path from "path";
import { UI, TURING as Tur } from "../UI/UI"

const { createFyl } = require('ts-turing')

export const ui: UI = new UI(false)

ui.bindHandle()


export const TURING = Tur

interface Fyl {
	LeftClick: (count?: number) => void,
	RightClick: (count?: number) => void,
	M_ResolutionUsed: (x: number, y: number) => void,
	MoveTo3: (x: number, y: number) => void,
	MoveTo2: (x: number, y: number) => void,
	KeyPress: (keycode: number, n?: number) => void
}


export const fyl = createFyl(path.join(MIR_PATH, 'rushb/dll/msdk.dll')) as Fyl