import Settings from "models/Settings";
import { ItemView } from "obsidian";
import React, { useEffect, useState } from "react";
import {
	Button,
	Form,
	Label,
	Input,
	FieldError,
	TextField,
	TooltipTrigger,
	Tooltip,
} from "react-aria-components";

import { fileToNote } from "./utility";
import { StatusTag } from "models/Project";

interface Props {
	parent: ItemView;
	settings: Settings;
}

const ReactView = (props: Props) => {
	// Get all obsidian notes

	const [isLoading, setIsLoading] = useState(true);
	const [totalNotes, setTotalNotes] = useState(0);
	const [count, setCount] = useState(0);
	const [folderPath, setFolderPath] = useState("");
	const [doesFolderExist, setDoesFolderExist] = useState(false);

	const createNote = async () => {
		setIsLoading(true);
		if (!doesFolderExist) {
			await createFolders(folderPath);
		}

		const file = await props.parent.app.vault.create(
			`${folderPath}NewNote_${count}.md`,
			"---\nobsidian-projects: true\nstatus: 'todo'\n---\n"
		);

		const statusTags: StatusTag[] = [{
			name: "todo",
			color: "blue",
			priority: 1
		}, {
			name: "done",
			priority: 2,
			color: "green"
		}];
		
		console.log(await fileToNote(props.parent.app, {
			notesPath: "",
			name: "Sample",
			created: new Date(),
			updated: new Date(),
			isArchived: false,
			statusProperty: "status",
			statusTags
		}, file));


		setCount(count + 1);
		setIsLoading(false);
	};

	useEffect(init, []);

	const highlightText = (text: { toString: () => string }) => {
		return <span className="text-yellow-300">{text.toString()}</span>;
	};

	return (
		<div>
			<h1>Better Obsidian Projects</h1>
			{isLoading && <p>Loading...</p>}
			{!isLoading && (
				<div className="flex flex-col space-y-10">
					<div className="flex flex-col space-y-5">
						<p>Folder Path: {highlightText(folderPath)}</p>
						<p>
							There are {highlightText(totalNotes)} notes in this
							vault.
						</p>
						<Button
							className="py-2 px-4 rounded"
							onPress={createNote}
						>
							Create Note
						</Button>

						<p>
							There are {highlightText(count)} notes created by
							React.
						</p>
					</div>

					<Form
						className="flex flex-col space-y-5"
						onSubmit={(e) => {
							e.preventDefault();
							console.log(e);
						}}
					>
						<TextField
							className="mb-4"
							name="email"
							type="email"
							isRequired
						>
							<Label className="block mb-2">Email</Label>
							<Input
								className="border border-gray-400 p-2 w-full"
								placeholder="Email"
							/>
							<FieldError className="text-red-600" />
						</TextField>
						<TooltipTrigger>
							<Button className="py-2 px-4 rounded" type="submit">
								Submit
							</Button>
							<Tooltip placement="bottom">
								<div className="bg-gray-300 text-black p-2 rounded-lg shadow-lg">
									This is a tooltip
								</div>
							</Tooltip>
						</TooltipTrigger>
					</Form>
				</div>
			)}
		</div>
	);

	function init() {
		setIsLoading(false);
		const obsidianNotes = props.parent.app.vault.getMarkdownFiles();
		setTotalNotes(obsidianNotes.length);
		// Replace any slashes at the end of the path with nothing and then add a /
		const cleanedFolderPath =
			props.settings.projectsFolderPath.replace(/\/$/, "") + "/";
		setFolderPath(cleanedFolderPath);

		setCount(
			obsidianNotes.reduce((sum, note) => {
				const cache = props.parent.app.metadataCache.getFileCache(note);
				if (cache?.frontmatter?.["obsidian-projects"]) {
					return sum + 1;
				}
				return sum;
			}, 0)
		);

		// Check if the folder exists
		props.parent.app.vault.adapter
			.exists(cleanedFolderPath)
			.then((doesExist) => {
				setDoesFolderExist(doesExist);
				setIsLoading(false);
				// test
			});
	}

	async function createFolders(folderPath: string) {
		const folders = folderPath.split("/");
		let currentPath = "";
		for (const folder of folders) {
			currentPath += folder + "/";
			const doesExist = await props.parent.app.vault.adapter.exists(
				currentPath
			);
			if (!doesExist) {
				await props.parent.app.vault.createFolder(currentPath);
			}
		}
		setDoesFolderExist(true);
	}
};

export default ReactView;
