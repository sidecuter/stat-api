import axios from 'axios'
import {DataDto} from './types/dto'
import {CorpusData, LocationData, PlanData, RoomData} from './types/data'
import {Parser} from '../Parser'
import {appConfig} from '../../appConfig'

export async function getDataFromServerAndParse() {
	let dto: DataDto = {
		plans: [],
		rooms: [],
		corpuses: [],
		locations: []
	}

	let locations: LocationData[] = []
	let corpuses: CorpusData[] = []
	let plans: PlanData[] = []
	let rooms: RoomData[]= []

	try {
		dto = (await axios.get(appConfig.dataUrl)).data as DataDto

		console.log('✅ Данные загружены с сервера')

		locations = dto.locations.map(locDto => ({
			id: locDto.id,
			title: locDto.title,
			short: locDto.short,
			address: locDto.address,
			available: locDto.available,
			crossings: locDto.crossings ?? []
		}))

		corpuses = dto.corpuses.map(corpDto => ({
			id: corpDto.id,
			location: locations.find(loc => loc.id === corpDto.locationId) as LocationData,
			title: corpDto.title,
			available: corpDto.available,
			stairs: corpDto.stairs ?? []
		}))

		plans = dto.plans.map(planDto => ({
			id: planDto.id,
			corpus: corpuses.find(corpus => corpus.id === planDto.corpusId) as CorpusData,
			available: planDto.available,
			wayToSvg: planDto.wayToSvg,
			graph: planDto.graph,
			floor: parseInt(planDto.floor) ?? 0,
			entrances: planDto.entrances
		}))

		rooms = dto.rooms.map(roomDto => Parser.fillRoomData(roomDto, plans.find(plan => plan.id === roomDto.planId) as PlanData)).filter(room => !!room)
	} catch (e) {
		console.log('Не удалось загрузить данные с сервера')
	}
	return {locations, corpuses, plans, rooms}
}