import express from 'express'
import {getDataFromServerAndParse} from './models/data/getDataFromServerAndParse'
import {Graph} from './models/Graph'
import {LocationData} from './models/data/types/data'
import {Way} from './models/Way'
import chalk from 'chalk'

const app = express()
const port = 3000

let graphBS: Graph | undefined

async function fetchData() {
	try {
		const {plans, locations, corpuses} = await getDataFromServerAndParse()
		const locationBS = locations.find(loc => loc.id === 'BS') as LocationData
		graphBS = new Graph(locationBS, plans, corpuses)
		setTimeout(fetchData, 10 * 60 * 1000) //Рефетч 10 минут
	} catch (e) {
		console.log('❗Ошибка запроса или заполнения данных')
		setTimeout(fetchData, 60 * 1000) //Рефетч при ошибке 1 минута
	}
}

void fetchData()

//Эндпроинт для получения маршрута, объекта типа Way
app.get('/api/get/route', async (req, res) => {
	const {from, to} = req.query as { from?: string, to?: string }

	if (!from || !to) {
		res.status(400).json({error: 'Parameters "from" and "to" are required and must be Id\'s of Vertexes (room id)'})
		return
	}
	if (!graphBS) {
		res.status(500).json({message: 'Server data error'})
		return
	}

	const fromV = graphBS.vertexes.find(v => v.id === from)
	const toV = graphBS.vertexes.find(v => v.id === to)
	if (!fromV || !toV) {
		console.log('no from')
		let message = 'You are trying to get a route along non-existent vertex ' + (!fromV ? `FROM: ${from}` : `TO: ${to}`)
		res.status(400).json({message: message})
		return
	}

	try {
		const way = new Way(from, to, graphBS)
		res.status(200).json({
			form: way.from,
			to: way.to,
			steps: way.steps.map(s => ({
				...s,
				plan: s.plan.id,
				way: s.way.map(v => ({
					id: v.id,
					x: v.x,
					y: v.y,
					type: v.type,
				}))
			})),
			fullDistance: way.fullDistance
		})
		console.log(chalk.green(`GET /api/get/route FROM=${chalk.underline(from)} TO=${chalk.underline(to)}. Маршрут построен с количеством шагов:`, way.steps.length))
		return
	} catch (e) {
		let message = `The requested route is impossible`
		res.status(400).json({message: message})
		console.log(chalk.red(`GET /api/get/route FROM=${chalk.underline(from)} TO=${chalk.underline(to)}. Маршрут не найден`))
		return
	}
})

// Запуск сервера
app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`)
})