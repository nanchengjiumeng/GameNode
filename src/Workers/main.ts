import Character from "../Base/Charater";
import MirMap from "../Base/MirMap";
// import { parentPort } from "worker_threads";
import { STATEMACHINE } from '../Main/State'


/**
 * 主进程，处理ui线程的数据，然后进行操作
 */
const map = new MirMap()
const character = new Character()

process.addListener('message', (data: UIData) => {
	map.updateMapName(data.mapName)
	map.updateMapElement(data.elements)
	character.setElement(data.elements[0])
	character.setHp(data.hp)
})

new STATEMACHINE(map, character)






