sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], (Device, Controller, Filter, FilterOperator, JSONModel, MessageToast) => {
	"use strict";

	return Controller.extend("sap.ui.demo.todo.controller.App", {

		onInit() {
			this.aSearchFilters = [];
			this.aTabFilters = [];

			this.getView().setModel(new JSONModel({
				isMobile: Device.browser.mobile,
				filterText: undefined
			}), "view");
		},

		/**
		 * Adds a new todo item to the bottom of the list.
		 */
		addTodo() {
			const oModel = this.getView().getModel();
			const aTodos = oModel.getProperty("/todos").map((oTodo) => Object.assign({}, oTodo));			
			const currentDate = new Date();
			const userDate = this._transformToEuDate(oModel.getProperty("/newDate"))

			// Tag und Titel seprieren
			const sTag = oModel.getProperty("/newTodo").split(" ").pop();
			const sTitle = oModel.getProperty("/newTodo").split("#").shift()
		
			console.log("test")
			console.log(oModel.getProperty("/newDate"))
			console.log(currentDate.getTime())

			aTodos.push({
				title: sTitle,				
				completed: false,
				date: oModel.getProperty("/newDate"),
				overdue: userDate.getTime() < currentDate.getTime(),
				tag: this._verifyTag(sTag)
			});

			oModel.setProperty("/todos", aTodos);
			oModel.setProperty("/newTodo", "");
			oModel.setProperty("/newDate", "");
		},
		_verifyTag(sTag) { 
			const lowerCaseTag = sTag.toLowerCase();
			const firstTagLetter = lowerCaseTag.split("").shift()
			let sResult = lowerCaseTag.substring(1);

			if(firstTagLetter === "#") {
				sResult = sResult.charAt(0).toUpperCase() + sResult.substring(1)
			} else {
				sResult = "Allgemeines"
			}

			return sResult
		},
		_transformToEuDate(date){ // MM.DD.YYYY -> DD.MM.YYYY
			const aDate = date.split(".")
			const sDay = aDate[1]
			const sMonth = aDate[0]
			const sYear = aDate[2]
			
			let dResult = new Date(sDay + "." + sMonth + "."  +sYear + "." )
			
			return dResult;
		},
		/**
		 * Removes all completed items from the todo list.
		 */
		clearCompleted() {
			const oModel = this.getView().getModel();
			const aTodos = oModel.getProperty("/todos").map((oTodo) => Object.assign({}, oTodo));

			let i = aTodos.length;
			while (i--) {
				const oTodo = aTodos[i];
				if (oTodo.completed) {
					aTodos.splice(i, 1);
				}
			}

			oModel.setProperty("/todos", aTodos);
		},

		/**
		 * Updates the number of items not yet completed
		 */
		updateItemsLeftCount() {
			const oModel = this.getView().getModel();
			const aTodos = oModel.getProperty("/todos") || [];

			const iItemsLeft = aTodos.filter((oTodo) => oTodo.completed !== true).length;

			oModel.setProperty("/itemsLeftCount", iItemsLeft);
		},

		/**
		 * Trigger search for specific items. The removal of items is disable as long as the search is used.
		 * @param {sap.ui.base.Event} oEvent Input changed event
		 */
		onSearch(oEvent) {
			const oModel = this.getView().getModel();

			// First reset current filters
			this.aSearchFilters = [];

			// add filter for search
			this.sSearchQuery = oEvent.getSource().getValue();
			if (this.sSearchQuery && this.sSearchQuery.length > 0) {
				oModel.setProperty("/itemsRemovable", false);
				const filter = new Filter("title", FilterOperator.Contains, this.sSearchQuery);
				this.aSearchFilters.push(filter);
			} else {
				oModel.setProperty("/itemsRemovable", true);
			}

			this._applyListFilters();
		},

		onFilter(oEvent) {
			// First reset current filters
			this.aTabFilters = [];

			// add filter for search
			this.sFilterKey = oEvent.getParameter("item").getKey();

			// eslint-disable-line default-case
			switch (this.sFilterKey) {
				case "active":
					this.aTabFilters.push(new Filter("completed", FilterOperator.EQ, false));
					break;
				case "completed":
					this.aTabFilters.push(new Filter("completed", FilterOperator.EQ, true));
					break;
				case "overdue":
					this.aTabFilters.push(new Filter("overdue", FilterOperator.EQ, true));
					break;
				case "all":
				default:
				// Don't use any filter
			}

			this._applyListFilters();
		},

		_applyListFilters() {
			const oList = this.byId("todoList");
			const oBinding = oList.getBinding("items");

			oBinding.filter(this.aSearchFilters.concat(this.aTabFilters), "todos");

			let sI18nKey;
			if (this.sFilterKey && this.sFilterKey !== "all") {
				if (this.sFilterKey === "active") {
					sI18nKey = "ACTIVE_ITEMS";
				} else if (this.sFilterKey === "completed") {
					// completed items: sFilterKey = "completed"
					sI18nKey = "COMPLETED_ITEMS";
				} else {
					sI18nKey = "OVERDUE_ITEMS";
				}
				if (this.sSearchQuery) {
					sI18nKey += "_CONTAINING";
				}
			} else if (this.sSearchQuery) {
				sI18nKey = "ITEMS_CONTAINING";
			}

			let sFilterText;
			if (sI18nKey) {
				const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
				sFilterText = oResourceBundle.getText(sI18nKey, [this.sSearchQuery]);
			}

			this.getView().getModel("view").setProperty("/filterText", sFilterText);
		},
		_movePrio(oEvent, sDirection) {
			const oModel = this.getView().getModel();

			// Finde das geklickte Element
			const oClickedButton = oEvent.getSource();
			const bId = oClickedButton.getId();

			// Erhalte den Pfad des gebundenen Elements (z.B. "/todos/0") & extrahiere es
			const sBindingPath = oClickedButton.getBindingContext().getPath();
			const nIndex = parseInt(sBindingPath.split("/")[2]);

			// Ermittle aktuelles Array Item sowie die Item davor & danach
			const getItemBefore = oModel.oData.todos[nIndex - 1];
			const getClickedItem = oModel.oData.todos[nIndex]
			const getItemAfter = oModel.oData.todos[nIndex + 1];


			// Swap Arrays
			if (sDirection === "prioUp") {
				// Abfangen wenn Item bereits an erster Stelle steht
				if (nIndex > 0) {
					oModel.oData.todos[nIndex - 1] = getClickedItem;
					oModel.oData.todos[nIndex] = getItemBefore;

					MessageToast.show("Prio Up")
				}
			} else if (sDirection === "prioDown") {
				// Abfangen wenn Item bereits an letzter Stelle steht
				if (oModel.getProperty("/todos").length > nIndex + 1) {
					oModel.oData.todos[nIndex + 1] = getClickedItem;
					oModel.oData.todos[nIndex] = getItemAfter;

					MessageToast.show("Prio Down")
				}
			}
			
			oModel.refresh();
		},
		movePrioUp(oEvent) {
			this._movePrio(oEvent, "prioUp")
		},
		movePrioDown(oEvent) {
			this._movePrio(oEvent, "prioDown")
		}
		/*
		movePrioDown(oEvent) {
			
			const oModel = this.getView().getModel();

			// Finde das geklickte Element
			const oClickedButton = oEvent.getSource();

			// Erhalte den Pfad des gebundenen Elements (z.B. "/todos/0")
			const sBindingPath = oClickedButton.getBindingContext().getPath();
			// Extrahiere den Index aus dem Pfad
			const nIndex = parseInt(sBindingPath.split("/")[2]);

			if (oModel.getProperty("/todos").length > nIndex + 1) {
				const getItemBefore = oModel.oData.todos[nIndex + 1];
				const getClickedItem = oModel.oData.todos[nIndex]

				oModel.oData.todos[nIndex + 1] = getClickedItem;
				oModel.oData.todos[nIndex] = getItemBefore;
			}

			oModel.refresh();
			
		}
		*/
	});

});