import { Note, ObsidianPropertyTypes, Project, ProjectPropertyValue } from "models/Project";
import { App, TFile } from "obsidian";

export async function fileToNote(app: App, project: Project, file: TFile) {
	const statusTags = project.statusTags;
	const statusProperty = project.statusProperty;
	const note: Note = {
		name: file.basename,
		created: new Date(file.stat.ctime),
		updated: new Date(file.stat.mtime),
		statusTag: undefined,
		properties: []
	}

	// Get all properties on TFile, loaded directly from file contents
	await app.fileManager.processFrontMatter(file, (frontmatter: object) => {
		const rawProps = Object.entries(frontmatter);
		const status = rawProps.find(([key, value]) => key === statusProperty)?.[1];
		const statusTag = statusTags.find(tag => tag.name === status);
	
		const properties: ProjectPropertyValue[] = rawProps.map((prop: [string, unknown]) => {
			return {
				name: prop [0] as string,
				type: getPropertyType(prop[1]),
				value: prop[1],
			} as ProjectPropertyValue;
		});

		note.statusTag = statusTag;
		note.properties = properties;
	});

	return note;
}

function getPropertyType(property: unknown): ObsidianPropertyTypes | undefined  {
	if (typeof property === "string") {
		return "text";
	}

	if (typeof property === "number") {
		return "number";
	}

	if (typeof property === "boolean") {
		return "checkbox";
	}

	if (property instanceof Date) {
		return "date";
	}

	if (Array.isArray(property)) {
		return "list";
	}
}
