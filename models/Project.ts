export interface Project {
	notesPath: string;
	name: string;
	created: Date;
	updated: Date;
	isArchived: boolean;
	statusProperty: string;
	statusTags: StatusTag[];
}

export interface HydratedProject extends Project {
	notes: Note[];
	properties: ProjectProperty[];
}

export interface StatusTag {
	name: string;
	color: string;
	priority: number;
}

export interface Note {
	name: string;
	created: Date;
	updated: Date;
	statusTag?: StatusTag;
	properties: ProjectPropertyValue[];
	readonly updateProperties: (properties: ProjectPropertyValue[]) => Promise<Note>;
	readonly getPropertyValue: <T>(propertyName: string) => T | undefined;

}

export interface ProjectProperty {
	name: string;
	type?: ObsidianPropertyTypes;
}

export interface ProjectPropertyValue extends ProjectProperty {
	value: string | number | boolean | Date | object | Array<string | number | boolean | Date | object>;
}

export type ObsidianPropertyTypes = "text" | "list" | "number" | "checkbox" | "date" | "datetime";
