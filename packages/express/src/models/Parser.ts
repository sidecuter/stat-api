import {RoomDto} from './data/types/dto'
import {PlanData, RoomData, RoomType} from './data/types/data'

export class Parser {
	static fillRoomData(inRoom: RoomDto, plan: PlanData): RoomData | null {
		const type = inRoom.type as RoomType
		const icon = ''
		const {title, subTitle}: { title: string, subTitle: string } = function () {
			function getCorpusFloorSubtitle() {
				return `Корпус ${plan.corpus.title}, ${plan.floor}-й этаж`;
			}

			if (inRoom.tabletText && inRoom.tabletText !== '') {
				let title = ''
				if (inRoom.numberOrTitle && inRoom.numberOrTitle !== '-') title = inRoom.numberOrTitle
				title += ` — ${inRoom.tabletText}`
				return {
					title: title,
					subTitle: inRoom.addInfo ? inRoom.addInfo.trim() : ''
				}
			}
			if (['Женский туалет', 'Коворкинг', 'Лифт', 'Мужской туалет', 'Общий туалет', 'Столовая / кафе'].includes(inRoom.type))
				return {
					title: inRoom.type,
					subTitle: getCorpusFloorSubtitle()
				}
			if (inRoom.type === 'Лестница') {
				let title = ''
				if (inRoom.numberOrTitle && inRoom.numberOrTitle !== '-') title = `${inRoom.numberOrTitle} лестница`
				else title = 'Лестница'
				return {
					title: title,
					subTitle: getCorpusFloorSubtitle()
				}
			}
			if (inRoom.type === 'Вход в здание') return {
				title: `Вход в корпус ${plan.corpus.title}`,
				subTitle: ''
			}
			return {
				title: inRoom.numberOrTitle,
				subTitle: ''
			}
		}()

		if (!inRoom.id.startsWith('!'))
			return {
				id: inRoom.id,
				title: title,
				subTitle: subTitle,
				plan: plan,
				type: type,
				icon: icon,
				available: inRoom.available,
			}
		else
			return null
	}
}