import { Note, ObsidianPropertyTypes, Project, ProjectPropertyValue } from "models/Project";
import { App, TFile } from "obsidian";

export async function fileToNote(app: App, project: Project, file: TFile) {
	const statusTags = project.statusTags;
	const statusProperty = project.statusProperty;

	const updateProperties = async (note: Note, propsToUpdate: ProjectPropertyValue[]) => {
		const frontmatterUpdates: Record<string, unknown> = {};

		propsToUpdate.forEach(prop => {
			frontmatterUpdates[prop.name] = prop.value;
		});

		note.updated = new Date();
		frontmatterUpdates["updated"] = note.updated;

		await app.fileManager.processFrontMatter(file, async (frontmatter: Record<string, unknown>) => {
			if (!frontmatter) {
				frontmatter = {};
			}

			Object.entries(frontmatterUpdates).forEach(([key, value]) => {
				frontmatter[key] = value;
			});
		}).catch(err => {
			console.error(err);
		});

		// Merge, remove duplicates in favotr of propsToUpdate
		note.properties = note.properties.filter(prop => {
			return !propsToUpdate.find(propToUpdate => propToUpdate.name === prop.name);
		}).concat(propsToUpdate);

		// Check if statusTag has changed
		const status = propsToUpdate.find(prop => prop.name === statusProperty)?.value as string;
		note.statusTag = statusTags.find(tag => tag.name === status);

		return note;
	};

	const getPropertyValue = <T>(note: Note, propertyName: string): T | undefined => {
		const property = note.properties.find(prop => prop.name === propertyName);
		return property?.value as T;
	}

	const note: Note = {
		name: file.basename,
		created: new Date(file.stat.ctime),
		updated: new Date(file.stat.mtime),
		statusTag: undefined,
		properties: [],
		updateProperties: function (propsToUpdate: ProjectPropertyValue[]) {
			return updateProperties(this, propsToUpdate);
		},
		getPropertyValue: function (propertyName: string) {
			return getPropertyValue(this, propertyName);
		}
	}

	// Get all properties on TFile, loaded directly from file contents
	await app.fileManager.processFrontMatter(file, (frontmatter: object) => {
		const rawProps = Object.entries(frontmatter);
		const statusProp = rawProps.find(([key, value]) => key === statusProperty);
		const status = statusProp ? statusProp[1] as string : undefined;
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
