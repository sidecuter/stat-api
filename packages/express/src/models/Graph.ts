//Граф тут из данных
import {CorpusData, LocationData, PlanData} from './data/types/data'

export class Graph {
	vertexes: Array<Vertex> = [] //Мапа вершин
	readonly location: LocationData
	readonly plans: PlanData[]
	readonly corpuses: CorpusData[]


	constructor(location: LocationData, plans: PlanData[], corpuses: CorpusData[]) { //Вызывается после того заполнились данные приложения и заполняет себя
		console.log('Граф начинает заполняться')
		this.location = location
		this.plans = plans
		this.corpuses = corpuses
		this.fillVertexesByRawVertexes()
		this.addStairs()
		this.addCrossings()
		console.log('✅ Граф заполнен, всего вершин:', this.vertexes.length)
	}


	private fillVertexesByRawVertexes() {
		const plansOfLocation = this.plans.filter(plan => plan.corpus.location === this.location)
		plansOfLocation.forEach(plan => {
			plan.graph.forEach(rawVertex => {
				this.vertexes.push(new Vertex(
					rawVertex.id,
					rawVertex.x,
					rawVertex.y,
					rawVertex.type,
					rawVertex.neighborData,
					plan
				))
				plan.graph = []
			})
		});
	}


	private addStairs() { //добавление связей между лестницами в графе по данным
		const corpusesOfLocations = this.corpuses.filter(corpus => corpus.location === this.location)
		// console.log(corpusesOfLocations)
		corpusesOfLocations.forEach(corpus => {
			corpus.stairs.forEach(stairsGroup => {
				for (let stairIndex = 1; stairIndex < stairsGroup.length; stairIndex++) {
					const stair1Vertex = this.findVertexById(stairsGroup[stairIndex - 1])
					const stair2Vertex = this.findVertexById(stairsGroup[stairIndex])
					this.addNeighborBoth(stair1Vertex, stair2Vertex, 1085, 916)
				}
			})
		})
	}

	private addCrossings() {
		this.location.crossings.forEach(crossingGroup => {
			const [crossing1Id, crossing2Id, distance] = crossingGroup
			this.addNeighborBoth(
				this.findVertexById(crossing1Id),
				this.findVertexById(crossing2Id),
				distance,
				distance
			)
		})
	}


	findVertexById(id: VertexId) {
		return this.vertexes.find(vertex => vertex.id === id) as Vertex
	}

	private addNeighborBoth(vertex1: Vertex, vertex2: Vertex, distance1to2: number, distance2to1: number) {
		vertex1.neighborData.push([vertex2.id, distance1to2])
		vertex2.neighborData.push([vertex1.id, distance2to1])
	}

	public getShortestWayFromTo(idVertex1: VertexId, idVertex2: VertexId): { way: Vertex[], distance: number } {
		const start = Date.now()

		function isVertexNeedCheck(vertex: Vertex) {
			return (vertex.type === 'hallway' ||
				vertex.type === 'lift' ||
				vertex.type === 'stair' ||
				vertex.type === 'corpusTransition' ||
				vertex.type === 'crossingSpace' ||
				vertex.id === idVertex1 ||
				vertex.id === idVertex2 ||
				vertex.id.includes('crossing')
			)
		}

		const filteredVertexes = this.vertexes.filter((vertex) => isVertexNeedCheck(vertex))
		//Список вершин находящиеся только в коридорах
		const distances = new Map() //расстояния до вершин от начальной точки (старта)
		const ways: Map<VertexId, VertexId[]> = new Map() //маршруты из точек
		for (const vertex of filteredVertexes) { // для всех вершин устанавливаем бесконечную длину пути
			distances.set(vertex.id, Infinity)
			ways.set(vertex.id, [])
		}
		distances.set(idVertex1, 0) //для начальной вершины длина пути = 0
		const finals = new Set() //вершины с окончательной длиной (обработанные вершины)

		let currentVertexID = idVertex1 //ид обрабатываемой вершины
		// for (let i = 0; i < 2; i ++) {
		const iterations = [0, 0] //счётчик количества итераций внешнего и внутреннего циклов
		let isEndVertexInFinals = false //Флаг находится ли конечная вершина в обработанных
		while (finals.size !== filteredVertexes.length && !isEndVertexInFinals) { //пока не посетили все вершины (или пока не обнаружено, что
			// граф не связный) или пока не обработана конечная вершина
			iterations[0] += 1

			//релаксации для соседних вершин
			const currentVertexDistance = distances.get(currentVertexID) //длина до обрабатываемой вершины
			for (const [neighborId, distanceToNeighbor] of this.findVertexById(currentVertexID).neighborData) { //для всех айдишников соседей вершины по айди
				if (!filteredVertexes.includes(this.findVertexById(neighborId)))
					continue
				iterations[1] += 1
				const distanceBetweenCurrentAndNeighbor = distanceToNeighbor
				//расстояние между обрабатываемой и соседней вершиной
				const neighborDistance = distances.get(neighborId) //расстояние до соседней вершины от старта

				//если расстояние до обр верш + между соседней < расст до соседней вершины от старта
				if (currentVertexDistance + distanceBetweenCurrentAndNeighbor < neighborDistance) {
					//обновляем расстояние до соседней вершины
					distances.set(neighborId, currentVertexDistance + distanceBetweenCurrentAndNeighbor)
					//и путь для нёё, как путь до текущей вершины + текущая вершина
					const wayToRelaxingVertex = Array.from(ways.get(currentVertexID) as VertexId[])
					wayToRelaxingVertex.push(currentVertexID)
					ways.set(neighborId, wayToRelaxingVertex)
				}

			}

			finals.add(currentVertexID) //помечаем текущую вершину как обработканную
			if (currentVertexID === idVertex2)
				isEndVertexInFinals = true
			//поиск следующей обрабатываемой вершины (необработанная вершина с наименьшим расстоянием от начала)
			let minDistance = Infinity
			let nextVertexID = ''
			for (const [id, distance] of distances) {
				if (distance < minDistance && (!finals.has(id))) {
					minDistance = distance
					nextVertexID = id
					// console.log(minDistance, nextVertexID)
				}
			}
			if (minDistance === Infinity) //если граф несвязный то закончить поиск путей
				break
			currentVertexID = nextVertexID
		}
		for (const [id, way] of ways) {
			way.push(id)
		}
		console.log(`Путь найден за ${Date.now() - start} миллисекунд с количеством итераций ${iterations[0]}, ${iterations[1]} и количеством вершин ${filteredVertexes.length}`)
		return {
			way: (ways.get(idVertex2) as VertexId[]).map(vertexId => this.findVertexById(vertexId)),
			distance: Math.floor(distances.get(idVertex2))
		}
	}

	public getDistanceBetween2Vertexes(vertex1: Vertex, vertex2Id: VertexId): number {
		return (vertex1.neighborData.find(note => note[0] === vertex2Id) as [string, number])[1]
	}
}

type VertexId = string

export class Vertex {
	constructor(
		public id: VertexId,
		public x: number,
		public y: number,
		public type: string | "hallway" | "entrancesToAu" | "stair" | "crossing" | "crossingSpace" | "lift",
		public neighborData: Array<[string, number]>,
		public plan: PlanData
	) {

	}
}