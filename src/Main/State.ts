import { moveStep } from "../Action";
import Character from "../Base/Charater";
import MirMap from "../Base/MirMap";
import Computed from "../UI/Computed";
import { createMachine, interpret, Interpreter } from "xstate";

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



export class STATEMACHINE {
	public service !: Interpreter<any>;
	public target!: MirPosition;
	public monsterTarget!: MirPosition;
	public equipTarget!: MirPosition;
	constructor(
		public map: MirMap,
		public character: Character,
		public safeMap = '盟重',
		public dangerMap = '四项法阵',
		public distanceMonster = 11, // 如果范围11内有怪物开始找怪
		public distanceAttack = 8,  // 如果怪物进入范围8以内进入攻击模式
		public distanceAttackMonster = 3,
		public distancePickUp = 5,  // 捡起当前人物指定范围内的装备
		public distanceBaiHu = 5 // 战斗时白虎最远距离
	) {
		this.createService()
		this.service.start()
	}

	createService() {
		const state = createMachine({
			id: 'state',
			initial: STATE_FIND_MAP,
			states: {
				[STATE_MOVE]: {
					on: {
						[STATE_ATTACK]: STATE_ATTACK,
						[STATE_PICK_UP]: STATE_PICK_UP,
						[STATE_FIND_MONSTER]: STATE_FIND_MONSTER,
						[STATE_FIND_TARGET]: STATE_FIND_TARGET
					}
				},
				[STATE_ATTACK]: {},
				[STATE_PICK_UP]: {
					on: {
						[STATE_MOVE]: STATE_MOVE,
						[STATE_ATTACK]: STATE_ATTACK,
						[STATE_FIND_TARGET]: STATE_FIND_TARGET
					}
				},
				[STATE_BACK_HOME]: {},
				[STATE_FIND_MONSTER]: {},
				[STATE_FIND_TARGET]: {
					on: {
						[STATE_MOVE]: STATE_MOVE,
						[STATE_FIND_MONSTER]: STATE_FIND_MONSTER,
						[STATE_FIND_TARGET]: STATE_FIND_TARGET
					}
				},
				[STATE_FIND_MAP]: {}
			}
		})

		this.service = interpret(state).onTransition((state) => {
			switch (state.value) {
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
			}
		})

	}

	backHome() {

	}

	findMap() {

	}

	pickup() {
		const eques = this.map.findAllMirElement(this.character.element.position, 4, this.distancePickUp)
		if (eques.length === 0) {
			const previousValue = this.service.state.history.value as string
			this.service.send({ type: previousValue }) // 返回上一个状态
		} else {
			this.equipTarget = eques[0].position
			this.service.send({ type: STATE_MOVE }) // 走到怪物指定距离以内
		}
	}

	attack() {
		const monsters = this.map.findAllMirElement(this.character.element.position, 3, this.distanceMonster)
		if (monsters.length > 0) {
			const monster = monsters[0]
			if (monster.distance && (monster.distance >= this.distanceAttack - 1 && monster.distance >= this.distanceAttack + 1)) {
				// 召唤bb 施毒术 ..
				const baiHu = this.map.findAllMirElement(this.character.element.position, 2, this.distanceBaiHu)
				if (baiHu.length === 0) {
					this.character.recallBaiHu(150)
				}
				if (baiHu.length === 1) {
					this.character.recallBaiHu()
				}
				// this.character
				// this.character.poisonMonster(monster)

				this.service.send({ type: STATE_ATTACK }) // 攻击怪物
			} else {
				this.monsterTarget = monsters[0].position
				this.service.send({ type: STATE_MOVE }) // 走到怪物指定距离以内
			}
		} else {
			this.service.send({ type: STATE_PICK_UP })
		}
	}

	move() {
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
		moveStep(this.map, this.character, long[long.length - 1], run)
		const previousValue = this.service.state.history.value as string
		this.service.send({ type: previousValue })
	}

	findTarget() {
		this.map.lpa(this.character.element.position, this.target)
		const monsters = this.map.findAllMirElement(this.character.element.position, 3, this.distanceMonster)
		if (monsters.length > 0) {
			this.service.send({ type: STATE_FIND_MONSTER }) // 找到怪物怪物
		} if (this.map.roadPath.length > 0) {
			this.service.send({ type: STATE_MOVE }) // 移动人物
		} else {
			// 重置目标后，开始寻找目标
			this.target = this.map.radomAPostionSighting()
			this.service.send({ type: STATE_FIND_TARGET })
		}
	}

	findMonster() {
		const monsters = this.map.findAllMirElement(this.character.element.position, 3, this.distanceMonster)
		if (monsters.length > 0) {
			const monster = monsters[0]
			if (monster.distance && monster.distance < this.distanceAttack) {
				this.service.send({ type: STATE_ATTACK }) // 攻击怪物
			} else {
				this.monsterTarget = monsters[0].position
				this.service.send({ type: STATE_MOVE }) // 走到怪物跟前
			}
		} else {
			this.service.send({ type: STATE_FIND_TARGET })
		}
	}

}



