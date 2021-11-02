import Character from "../Base/Charater";
import MirMap from "../Base/MirMap";
// import { parentPort } from "worker_threads";
import { STATEMACHINE } from '../Main/State'


/**
 * 主进程，处理ui线程的数据，然后进行操作
 */
const map = new MirMap()
const character = new Character();

process.once('message', async ({ type, mapName }) => {
	await requestNextFrame()
	const machine = new STATEMACHINE(map, character)
	machine.next()

	if (type === 'GuaJi') {
		machine.service.send({ type })
	}
	if (type === 'HuiShou') {
		machine.service.send({ type })
	}
	if (type === 'XiaDiTu') {
		machine.mapTarget = mapName
		machine.service.send(type)
	}
})


export function requestNextFrame(): Promise<UIData> {
	return new Promise((resolve) => {
		const fn = (data: UIData) => {
			map.updateMapName(data.mapName)
			map.updateMapElement(data.elements)
			character.setElement(data.elements[0])
			character.setHp(data.hp)
			if (data.tmp) {
				character.death = data.tmp.death
				character.packageFill = data.tmp.packageFilled
				character.packageOpened = data.tmp.packageOpend
				character.relivePosition = data.tmp.reliveButtonPosition
			}
			resolve(data)
		}
		process.once('message', fn)
		process.send({ type: 'update' })
	})
}







