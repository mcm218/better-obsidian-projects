import { ItemView } from "obsidian";
import React, { useEffect, useState } from "react";
import { Label, ListBox, ListBoxItem } from "react-aria-components";

import Settings from "../../models/Settings";
import { HydratedProject, Note } from "../../models/Project";
import NoteCard from "./NoteCard";

interface Props {
	parent: ItemView;
	settings: Settings;
	project: HydratedProject;
}

const ReactView = (props: Props) => {
	const [isLoading, setIsLoading] = useState(true);
	const [groupedNotes, setGroupedNotes] = useState<Map<string, Note[]>>();

	useEffect(init, []);

	return (
		<>
			{!isLoading && (
				<div>
					<Label>{props.project.name}</Label>
					{groupedNotes?.size && (
						<ListBox
							aria-label={props.project.name}
							orientation="horizontal"
							items={getGroupedNotesKeys(groupedNotes)}
							className="flex space-x-5 justify-stretch"
						>
							{(keyItem) => (
								<ListBoxItem
									className="bg-sky-800 rounded-lg p-2"
									id={keyItem.status}
								>
									<Label className="text-xl">
										{keyItem.status}
									</Label>
									<ListBox
										className="flex flex-col space-y-2"
										items={groupedNotes.get(keyItem.status)}
									>
										{(noteItem) => (
											<ListBoxItem id={noteItem.name}>
												<NoteCard
													parent={props.parent}
													settings={props.settings}
													note={noteItem}
												></NoteCard>
											</ListBoxItem>
										)}
									</ListBox>
								</ListBoxItem>
							)}
						</ListBox>
					)}
				</div>
			)}
		</>
	);

	function init() {
		setIsLoading(true);

		const notesMap = props.project.notes.reduce((acc, note) => {
			const status = note.statusTag?.name || "none";
			const notes = acc.get(status) || [];
			notes.push(note);
			acc.set(status, notes);
			return acc;
		}, new Map<string, Note[]>());

		console.log(notesMap);
		for (const something of notesMap.keys()) {
			console.log(something);
		}
		[...notesMap.keys()]
			.map((key) => {
				return { status: key };
			})
			.forEach((key) => console.log(key));
//		setGroupedNotes(notesMap);
		setGroupedNotes(new Map())

		setIsLoading(false);
	}

	function getGroupedNotesKeys(notes: Map<string, Note[]>) {
		return [...notes.keys()].map((key) => {
			return { status: key };
		});
	}
};

export default ReactView;
