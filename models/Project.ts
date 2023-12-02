import { TFile } from 'obsidian';

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
	notes: TFile[];
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
}

export interface ProjectProperty {
	name: string;
	type?: ObsidianPropertyTypes;
}

export interface ProjectPropertyValue extends ProjectProperty {
	value: ProjectProperty['type'];
}

export type ObsidianPropertyTypes = "text" | "list" | "number" | "checkbox" | "date" | "datetime";
