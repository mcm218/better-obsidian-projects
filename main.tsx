import {
	App,
	ItemView,
	Plugin,
	PluginSettingTab,
	Setting,
	WorkspaceLeaf,
} from "obsidian";

import { Root, createRoot } from "react-dom/client";

const REACT_PARENT_VIEW_TYPE = "react-parent";

import ReactView from "./src/ReactView";
import React from "react";
import Settings from "models/Settings";

// Remember to rename these classes and interfaces!



const DEFAULT_SETTINGS: Settings = {
	projectsFolderPath: "projects/",
};

export default class MyPlugin extends Plugin {
	settings: Settings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);

		this.registerView(
			REACT_PARENT_VIEW_TYPE,
			(leaf: WorkspaceLeaf) => new ReactParent(leaf, this.settings)
		);

		this.addRibbonIcon("dice", "React View", () => {
			this.activateView();
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(REACT_PARENT_VIEW_TYPE);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);
			await leaf.setViewState({
				type: REACT_PARENT_VIEW_TYPE,
				active: true,
			});
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		workspace.revealLeaf(leaf);
	}
}

class ReactParent extends ItemView {
	root: Root | null = null;
	parent: WorkspaceLeaf;
	settings: Settings;

	constructor(leaf: WorkspaceLeaf, settings: Settings) {
		super(leaf);
		this.parent = leaf;
		this.settings = settings;
	}

	getViewType(): string {
		return REACT_PARENT_VIEW_TYPE;
	}

	getDisplayText(): string {
		return "React Parent";
	}

	async onOpen() {
		// const container = this.containerEl.children[1];
		// container.empty();
		// container.createEl("h4", { text: "Example view" });


		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
			<ReactView
				parent={this}
				settings={this.settings}
			/>
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}
class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Projects Folder Path")
			.setDesc("Folder path to use for your projects metadata")
			.addText((text) =>
				text
					.setPlaceholder("projects or projects/ will work")
					.setValue(this.plugin.settings.projectsFolderPath)
					.onChange(async (value) => {
						this.plugin.settings.projectsFolderPath = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
