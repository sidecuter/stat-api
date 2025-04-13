export type DataDto = {
	readonly locations: LocationDto[];
	readonly corpuses:  CorpusDto[];
	readonly plans:     PlanDto[];
	readonly rooms:     RoomDto[];
}

export type LocationDto = {
	readonly id:         string;
	readonly title:      string;
	readonly short:      string;
	readonly available:  boolean;
	readonly address:    string;
	readonly crossings?: Array<[string, string, number]>;
}

export type CorpusDto = {
	readonly id:         string;
	readonly locationId: string;
	readonly title:      string;
	readonly available:  boolean;
	readonly stairs?:    Array<string[]>;
}

export type PlanDto = {
	readonly id:        string;
	readonly corpusId:  string;
	readonly floor:     string;
	readonly available: boolean;
	readonly wayToSvg:  string;
	readonly graph:     GraphDto[];
	readonly entrances: Array<[string, string]>;
	readonly nearest:   NearestDto;
}

export type GraphDto = {
	readonly id:           string;
	readonly x:            number;
	readonly y:            number;
	readonly type:         string;
	readonly neighborData: Array<[string, number]>;
}

export type NearestDto = {
	readonly enter: string;
	readonly wm?:   string;
	readonly ww?:   string;
	readonly ws?:   string;
}

export type RoomDto = {
	readonly id:             string;
	readonly planId:         string;
	readonly type:           string;
	readonly available:      boolean;
	readonly numberOrTitle: string; // На самом деле тут может быть и undefined
	readonly tabletText:    string; // На самом деле тут может быть и undefined
	readonly addInfo:       string; // На самом деле тут может быть и undefined
}

