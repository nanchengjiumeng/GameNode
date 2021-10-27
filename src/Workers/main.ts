import Character from "../Base/Charater";
import MirMap from "../Base/MirMap";
// import { parentPort } from "worker_threads";
import { STATEMACHINE } from '../Main/State'


/**
 * 主进程，处理ui线程的数据，然后进行操作
 */
const map = new MirMap()
const character = new Character();

process.once('message', async ({ type }) => {
	await requestNextFrame()
	const machine = new STATEMACHINE(map, character)
	machine.next()
	if (type === 'GuaJi') {
		machine.service.send({ type })
	}
	// if (type === 'HuiShou') {
	// 	machine.service.send(type)
	// }
	// if (type === 'XiaDiTu') {
	// 	machine.service.send(type)
	// }
})


export function requestNextFrame(): Promise<UIData> {
	return new Promise((resolve) => {
		const fn = (data: UIData) => {
			map.updateMapName(data.mapName)
			map.updateMapElement(data.elements)
			character.setElement(data.elements[0])
			character.setHp(data.hp)
			resolve(data)
		}
		process.once('message', fn)
		process.send({ type: 'update' })
	})
}







