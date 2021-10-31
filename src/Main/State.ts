import { moveMouseThenLeftClick, moveStep, transformMirPosition2UIPosition } from "../Action/index";
import Character from "../Base/Charater";
import MirMap from "../Base/MirMap";
import Computed from "../UI/Computed";
import { createMachine, interpret, Interpreter } from "xstate";
import { logger } from "./logger";
import { requestNextFrame } from "../Workers/main";
import { NPC_LIST, PIXEL_MAP_BLOCK_HEIGHT } from "../Constants";
import { ui } from "./Turing";

// 1. move 移动
// 2. attack 攻击
// 3. pickup 捡起装备
// 4. back 回城
// 5. find monster 找怪物
// 6. find target 寻路
// 7. find map 地图判断

const STATE_MOVE = 'move'
const STATE_ATTACK = 'attack'
const STATE_PICK_UP = 'pickup'
const STATE_BACK_HOME = 'back'
const STATE_FIND_MONSTER = 'monster'
const STATE_FIND_TARGET = 'target'
const STATE_FIND_MAP = 'map'
const STATE_SHORT_MOVE = 'short-move'
const STATE_RECAIM = 'recaim'



export class STATEMACHINE {
	public service !: Interpreter<any>;
	public target!: MirPosition;
	public monsterTarget!: MirPosition;
	public equipTarget!: MirPosition;
	distanceAttackMonster1: number
	previousServiceType: string[] = []
	mapTarget: string
	start = false
	justRun = false
	__next: () => void
	constructor(
		public map: MirMap,
		public character: Character,
		public distanceMonster = 20, // 如果范围11内有怪物开始找怪
		public distanceAttack = 6,  // 如果怪物进入范围8以内进入攻击模式
		public distanceAttackMonster = 2,
		public distancePickUp = 10,  // 捡起当前人物指定范围内的装备
		public distanceBaiHu = 6, // 战斗时白虎最远距离

	) {
		this.distanceAttackMonster1 = distanceAttackMonster
		this.createService()

	}

	next() {
		if (!this.start) {
			this.start = true
			this.service.start()
		}
	}

	createService() {
		const state = createMachine({
			id: 'state',
			initial: 'idel',
			states: {
				idel: {
					on: {
						XiaDiTu: STATE_FIND_MAP,
						GuaJi: STATE_FIND_TARGET,
						HuiShou: STATE_RECAIM
					}
				},
				[STATE_RECAIM]: {
					on: {
						[STATE_MOVE]: STATE_MOVE,
						[STATE_SHORT_MOVE]: STATE_SHORT_MOVE
					}
				},
				[STATE_MOVE]: {
					on: {
						[STATE_ATTACK]: STATE_ATTACK,
						[STATE_PICK_UP]: STATE_PICK_UP,
						[STATE_FIND_MONSTER]: STATE_FIND_MONSTER,
						[STATE_FIND_TARGET]: STATE_FIND_TARGET,
						[STATE_RECAIM]: STATE_RECAIM
					}
				},
				[STATE_SHORT_MOVE]: {
					on: {
						[STATE_ATTACK]: STATE_ATTACK,
						[STATE_PICK_UP]: STATE_PICK_UP,
						[STATE_RECAIM]: STATE_RECAIM
					}
				},
				[STATE_ATTACK]: {
					on: {
						[STATE_MOVE]: STATE_MOVE,
						[STATE_ATTACK]: STATE_ATTACK,
						[STATE_FIND_MONSTER]: STATE_FIND_MONSTER,
						[STATE_PICK_UP]: STATE_PICK_UP,
						[STATE_SHORT_MOVE]: STATE_SHORT_MOVE
					}
				},
				[STATE_PICK_UP]: {
					on: {
						[STATE_MOVE]: STATE_MOVE,
						[STATE_ATTACK]: STATE_ATTACK,
						[STATE_FIND_TARGET]: STATE_FIND_TARGET,
						[STATE_SHORT_MOVE]: STATE_SHORT_MOVE
					}
				},
				[STATE_BACK_HOME]: {},
				[STATE_FIND_MONSTER]: {
					on: {
						[STATE_MOVE]: STATE_MOVE,
						[STATE_ATTACK]: STATE_ATTACK,
						[STATE_FIND_TARGET]: STATE_FIND_TARGET
					}
				},
				[STATE_FIND_TARGET]: {
					on: {
						[STATE_MOVE]: STATE_MOVE,
						[STATE_FIND_MONSTER]: STATE_FIND_MONSTER,
						[STATE_FIND_TARGET]: STATE_FIND_TARGET,
						[STATE_PICK_UP]: STATE_PICK_UP,
					}
				},
				[STATE_FIND_MAP]: {}
			}
		})

		this.service = interpret(state).onTransition(async (state) => {
			const value = state.value
			await requestNextFrame()
			switch (value) {
				case STATE_RECAIM:
					this.recaim()
					break
				case STATE_FIND_MAP:
					this.findMap()
					break;
				case STATE_FIND_TARGET:
					this.findTarget()
					break;
				case STATE_FIND_MONSTER:
					this.findMonster()
					break;
				case STATE_BACK_HOME:
					this.backHome()
					break;
				case STATE_ATTACK:
					this.attack()
					break;
				case STATE_MOVE:
					this.move();
					break;
				case STATE_PICK_UP:
					this.pickup();
					break;
				case STATE_SHORT_MOVE:
					this.shortDistanceMove()
					break;
			}
		})

	}

	backHome() {

	}

	findMap() {
		// 如果已经到达地图, 则直接结束
		if (this.map.name.includes(this.mapTarget)) process.send({ type: 'success' })

	}

	async shortDistanceMove() {
		logger.primary(`短距离位移中...`)
		let startPosition = this.character.element.position
		try {
			while (this.map.roadPath.length > 0) {
				const long = []
				let run = false
				if (this.map.roadPath.length > 0) {
					long.push(this.map.roadPath.shift())
				}
				if (this.map.roadPath.length > 0) {
					run = Computed.threePointsInOneLine(startPosition, long[0], this.map.roadPath[0])
					if (run) {
						long.push(this.map.roadPath.shift())
					}
				}
				const target = long[long.length - 1]
				await moveStep(this.map, this.character, target, run)
				this.character.element.position = target
				await Computed.sleep(800)

			}
		} catch (e) {
			logger.error('移动失败！')
		}
		const next = this.previousServiceType.pop()
		this.service.send({ type: next })
	}

	pickup() {
		logger.primary(`捡起物品中...${this.previousServiceType}`)
		const eques = this.map.findAllMirElement(this.character.element.position, 4, this.distancePickUp)
		if (eques.length === 0) {
			const t = this.previousServiceType.pop()
			return this.service.send({ type: t }) // 返回上一个状态
		}

		this.equipTarget = eques[0].position
		logger.error(`${this.equipTarget.x}, ${this.equipTarget.y}`)
		this.map.lpa(this.character.element.position, this.equipTarget)
		this.previousServiceType.push(STATE_PICK_UP)
		return this.service.send({ type: STATE_SHORT_MOVE }) // 走到怪物指定距离以内

	}

	async attack() {
		const eques = this.map.findAllMirElement(this.character.element.position, 4, this.distancePickUp)
		const monsters = this.map.findAllMirElement(this.character.element.position, 3, this.distanceMonster)
		const monster = monsters[0]

		// console.log(eques);
		if (eques.length > 0) {
			this.previousServiceType.push(STATE_ATTACK)
			return this.service.send({ type: STATE_PICK_UP }) // 攻击怪物
		}
		if (monster) {
			const inDistance = monster.distance && (monster.distance <= this.distanceAttack && monster.distance >= this.distanceAttackMonster)
			if (inDistance) {
				logger.primary(`攻击中...`)
				// 召唤bb 施毒术 ..
				const baiHu = this.map.findAllMirElement(this.character.element.position, 2, this.distanceBaiHu)
				if (baiHu.length === 0) {
					this.character.recallBaiHu(150)
					await Computed.sleep(150)
				}
				if (baiHu.length === 1) {
					this.character.recallBaiHu()
					await Computed.sleep(150)
				}

				this.character.yinshen()
				await Computed.sleep(100)

				this.character.poisonMonster(monster)
				this.distanceAttackMonster = this.distanceAttackMonster1
				return this.service.send({ type: STATE_ATTACK }) // 继续攻击
			}
			if (monster.distance > this.distanceAttack) {
				logger.primary(`攻击中...走近点`)
				this.monsterTarget = monster.position
				this.map.lpa(this.character.element.position, this.monsterTarget, true, this.distanceAttackMonster)
				this.previousServiceType.push(STATE_ATTACK)
				return this.service.send({ type: STATE_MOVE }) // 走到怪物指定距离以内
			}
			if (monster.distance < this.distanceAttackMonster) {
				logger.primary(`攻击中...走远点`)
				// 怪物位置太近
				this.monsterTarget = this.map.findAPositionCanAcross(this.character.element.position, 2, 1)
				if (this.monsterTarget) {
					this.map.lpa(this.character.element.position, this.monsterTarget, true)
				}
				if (!this.monsterTarget || this.map.roadPath.length === 0) {
					this.distanceAttackMonster = 0 // 被困住了
					return this.service.send({ type: STATE_ATTACK }) // 攻击怪物
				}

				this.previousServiceType.push(STATE_ATTACK)
				return this.service.send({ type: STATE_SHORT_MOVE }) // 走到怪物指定距离以内
			}

		} else {
			this.service.send({ type: this.previousServiceType.pop() })
		}
	}

	async move() {
		if (this.map.roadPath.length > 0) {
			try {
				const long = []
				let run = false

				if (this.map.roadPath.length > 0) {
					long.push(this.map.roadPath.shift())
				}
				if (this.map.roadPath.length > 0) {
					run = Computed.threePointsInOneLine(this.character.element.position, long[0], this.map.roadPath[0])
					if (run) {
						long.push(this.map.roadPath.shift())
					}
				}
				const target = long[long.length - 1]
				logger.primary(`移动(${run ? '跑' : '走'})到坐标:${JSON.stringify(target)}`)
				await moveStep(this.map, this.character, target, run || this.justRun)
				this.justRun = false
			} catch (e) {
				logger.error('移动失败！')
			}
		}
		this.service.send({ type: this.previousServiceType.pop() })
	}

	findTarget() {
		if (!this.target || (this.target.x === this.character.element.position.x && this.target.y === this.character.element.position.y)) {
			// 重置目标后，开始寻找目标
			this.target = this.map.radomAPostionSighting()
		}

		const eques = this.map.findAllMirElement(this.character.element.position, 4, this.distancePickUp)
		const monsters = this.map.findAllMirElement(this.character.element.position, 3, this.distanceMonster)
		logger.primary(`寻路中坐标:${JSON.stringify(this.target)}, 怪物数量: ${monsters.length}, 装备数量: ${eques.length} `)

		if (eques.length > 0) {
			this.previousServiceType.push(STATE_FIND_TARGET)
			return this.service.send({ type: STATE_PICK_UP }) // 捡起装备
		}

		if (monsters.length > 0) {
			this.previousServiceType.push(STATE_FIND_TARGET)
			return this.service.send({ type: STATE_FIND_MONSTER }) // 找到怪物怪物
		}

		this.map.lpa(this.character.element.position, this.target)

		if (this.map.roadPath.length > 0) {
			this.previousServiceType.push(STATE_FIND_TARGET)
			return this.service.send({ type: STATE_MOVE }) // 移动人物
		}

		this.target = undefined
		this.findTarget()
	}

	findMonster() {
		const monsters = this.map.findAllMirElement(this.character.element.position, 3, this.distanceMonster)
		logger.primary('寻找怪物...数量:' + monsters.length)
		if (monsters.length > 0) {
			this.previousServiceType.push(STATE_FIND_MONSTER)
			this.service.send({ type: STATE_ATTACK }) // 攻击怪物

		} else {
			this.service.send({ type: this.previousServiceType.pop() })
		}
	}

	async recaim() {
		const charactorPosition = this.character.element.position
		const npc = NPC_LIST.find(n => n.name.includes('装备回收'))
		if (Computed.distance(npc.position, charactorPosition) > 5) {
			this.map.lpa(this.character.element.position, npc.position)
			this.previousServiceType.push(STATE_RECAIM)
			this.justRun = true
			this.service.send({ type: STATE_MOVE }) // 走到怪物指定距离以内
		} else {
			// 点击
			const p = transformMirPosition2UIPosition(this.character, npc.position)
			await moveMouseThenLeftClick({ x: p.x, y: p.y - PIXEL_MAP_BLOCK_HEIGHT * 1.5 })
			await Computed.sleep(2000)
			const button = ui.detectHuishouButton()
			await moveMouseThenLeftClick(button)
		}

	}

}



