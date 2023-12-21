import { ItemView } from "obsidian";
import React from "react";
import { Text } from "react-aria-components";

import Settings from "../../models/Settings";
import { Note } from "../../models/Project";

interface Props {
	parent: ItemView;
	settings: Settings;
	note: Note;
}

const ReactView = (props: Props) => {
	return (
		<>
			<div aria-label={props.note.name} className="flex flex-col p-1 border-2 rounded-md">
				<Text className="text-md" slot="label">{props.note.name}</Text>
				<Text className="text-sm font-light" slot="description">{props.note.statusTag?.name}</Text>
			</div>
		</>
	);
};

export default ReactView;
